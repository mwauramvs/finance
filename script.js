// Global variables
let currentUser = null;
let transactions = [];
let accounts = [];
let budgets = [];
let savingsGoals = [];
let categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'],
    expense: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other']
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    const editTransactionModal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    const editAccountModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    const editGoalModal = new bootstrap.Modal(document.getElementById('editGoalModal'));
    const addToSavingsModal = new bootstrap.Modal(document.getElementById('addToSavingsModal'));

    // Show login modal on page load
    loginModal.show();

    // Toggle between login and register modals
    document.getElementById('showRegister').addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.hide();
        registerModal.show();
    });

    document.getElementById('showLogin').addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.hide();
        loginModal.show();
    });

    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Simple validation (in a real app, this would check against a database)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            loginModal.hide();
            initializeApp();
        } else {
            alert('Invalid email or password');
        }
    });

    // Register form submission
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.some(u => u.email === email)) {
            alert('Email already registered');
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Create default account for new user
        const userAccounts = JSON.parse(localStorage.getItem('accounts')) || {};
        userAccounts[newUser.id] = [{
            id: Date.now().toString(),
            name: 'Cash',
            type: 'Checking',
            balance: 0
        }];
        localStorage.setItem('accounts', JSON.stringify(userAccounts));
        
        alert('Registration successful! Please login.');
        registerModal.hide();
        loginModal.show();
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        currentUser = null;
        document.getElementById('appContainer').classList.add('d-none');
        loginModal.show();
    });

    // Navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Initialize date fields
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
    document.getElementById('transferDate').value = today;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('budgetMonth').value = currentMonth;
    document.getElementById('budgetMonthFilter').value = currentMonth;
    document.getElementById('expenseChartMonth').value = currentMonth;
    document.getElementById('incomeMonthFilter').value = currentMonth;
    document.getElementById('expenseMonthFilter').value = currentMonth;
    document.getElementById('exportMonth').value = currentMonth;
});

function initializeApp() {
    // Load user data
    loadUserData();
    
    // Show user greeting
    document.getElementById('userGreeting').textContent = `Hello, ${currentUser.name}`;
    
    // Show the app
    document.getElementById('appContainer').classList.remove('d-none');
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Initialize forms
    setupForms();
    
    // Initialize event listeners for filters
    setupFilters();
}

function loadUserData() {
    // Load transactions
    const allTransactions = JSON.parse(localStorage.getItem('transactions')) || {};
    transactions = allTransactions[currentUser.id] || [];
    
    // Load accounts
    const allAccounts = JSON.parse(localStorage.getItem('accounts')) || {};
    accounts = allAccounts[currentUser.id] || [];
    
    // Load budgets
    const allBudgets = JSON.parse(localStorage.getItem('budgets')) || {};
    budgets = allBudgets[currentUser.id] || [];
    
    // Load savings goals
    const allGoals = JSON.parse(localStorage.getItem('savingsGoals')) || {};
    savingsGoals = allGoals[currentUser.id] || [];
}

function saveUserData() {
    // Save transactions
    const allTransactions = JSON.parse(localStorage.getItem('transactions')) || {};
    allTransactions[currentUser.id] = transactions;
    localStorage.setItem('transactions', JSON.stringify(allTransactions));
    
    // Save accounts
    const allAccounts = JSON.parse(localStorage.getItem('accounts')) || {};
    allAccounts[currentUser.id] = accounts;
    localStorage.setItem('accounts', JSON.stringify(allAccounts));
    
    // Save budgets
    const allBudgets = JSON.parse(localStorage.getItem('budgets')) || {};
    allBudgets[currentUser.id] = budgets;
    localStorage.setItem('budgets', JSON.stringify(allBudgets));
    
    // Save savings goals
    const allGoals = JSON.parse(localStorage.getItem('savingsGoals')) || {};
    allGoals[currentUser.id] = savingsGoals;
    localStorage.setItem('savingsGoals', JSON.stringify(allGoals));
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show the selected section
    document.getElementById(`${sectionId}Section`).classList.remove('d-none');
    
    // Update the active nav link
    document.querySelectorAll('[data-section]').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    // Refresh the section content
    refreshSection(sectionId);
}

function refreshSection(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            refreshDashboard();
            break;
        case 'income':
            refreshIncomeSection();
            break;
        case 'expenses':
            refreshExpensesSection();
            break;
        case 'budget':
            refreshBudgetSection();
            break;
        case 'savings':
            refreshSavingsSection();
            break;
        case 'reports':
            refreshReportsSection();
            break;
        case 'accounts':
            refreshAccountsSection();
            break;
    }
}

function setupForms() {
    // Income form
    document.getElementById('incomeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const source = document.getElementById('incomeSource').value;
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        const date = document.getElementById('incomeDate').value;
        const category = document.getElementById('incomeCategory').value;
        const accountId = document.getElementById('incomeAccount').value;
        const notes = document.getElementById('incomeNotes').value;
        
        const account = accounts.find(a => a.id === accountId);
        if (!account) {
            alert('Selected account not found');
            return;
        }
        
        // Create transaction
        const transaction = {
            id: Date.now().toString(),
            type: 'income',
            source,
            amount,
            date,
            category,
            accountId,
            accountName: account.name,
            notes,
            createdAt: new Date().toISOString()
        };
        
        // Add to transactions
        transactions.push(transaction);
        
        // Update account balance
        account.balance += amount;
        
        // Save data
        saveUserData();
        
        // Reset form
        this.reset();
        document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
        
        // Refresh UI
        refreshDashboard();
        refreshIncomeSection();
        refreshAccountsSection();
        
        // Show success message
        alert('Income added successfully!');
    });
    
    // Expense form
    document.getElementById('expenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const description = document.getElementById('expenseDescription').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value;
        const accountId = document.getElementById('expenseAccount').value;
        const notes = document.getElementById('expenseNotes').value;
        
        const account = accounts.find(a => a.id === accountId);
        if (!account) {
            alert('Selected account not found');
            return;
        }
        
        if (account.balance < amount) {
            alert('Insufficient funds in the selected account');
            return;
        }
        
        // Create transaction
        const transaction = {
            id: Date.now().toString(),
            type: 'expense',
            description,
            amount,
            date,
            category,
            accountId,
            accountName: account.name,
            notes,
            createdAt: new Date().toISOString()
        };
        
        // Add to transactions
        transactions.push(transaction);
        
        // Update account balance
        account.balance -= amount;
        
        // Save data
        saveUserData();
        
        // Reset form
        this.reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        
        // Refresh UI
        refreshDashboard();
        refreshExpensesSection();
        refreshAccountsSection();
        
        // Show success message
        alert('Expense added successfully!');
    });
    
    // Budget form
    document.getElementById('budgetForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const category = document.getElementById('budgetCategory').value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        const month = document.getElementById('budgetMonth').value;
        
        // Check if budget already exists for this category and month
        const existingIndex = budgets.findIndex(b => b.category === category && b.month === month);
        
        if (existingIndex >= 0) {
            // Update existing budget
            budgets[existingIndex].amount = amount;
        } else {
            // Add new budget
            budgets.push({
                id: Date.now().toString(),
                category,
                amount,
                month
            });
        }
        
        // Save data
        saveUserData();
        
        // Reset form
        this.reset();
        document.getElementById('budgetMonth').value = new Date().toISOString().slice(0, 7);
        
        // Refresh UI
        refreshBudgetSection();
        
        // Show success message
        alert('Budget saved successfully!');
    });
    
    // Savings goal form
    document.getElementById('savingsGoalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('goalName').value;
        const target = parseFloat(document.getElementById('goalTarget').value);
        const deadline = document.getElementById('goalDeadline').value;
        const accountId = document.getElementById('goalAccount').value;
        
        savingsGoals.push({
            id: Date.now().toString(),
            name,
            target,
            current: 0,
            deadline,
            accountId,
            createdAt: new Date().toISOString()
        });
        
        // Save data
        saveUserData();
        
        // Reset form
        this.reset();
        
        // Refresh UI
        refreshSavingsSection();
        
        // Show success message
        alert('Savings goal added successfully!');
    });
    
    // Account form
    document.getElementById('accountForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('accountName').value;
        const type = document.getElementById('accountType').value;
        const balance = parseFloat(document.getElementById('accountBalance').value);
        
        accounts.push({
            id: Date.now().toString(),
            name,
            type,
            balance
        });
        
        // Save data
        saveUserData();
        
        // Reset form
        this.reset();
        
        // Refresh UI
        refreshAccountsSection();
        refreshDropdowns();
        
        // Show success message
        alert('Account added successfully!');
    });
    
    // Transfer form
    document.getElementById('transferForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fromAccountId = document.getElementById('fromAccount').value;
        const toAccountId = document.getElementById('toAccount').value;
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const date = document.getElementById('transferDate').value;
        const notes = document.getElementById('transferNotes').value;
        
        if (fromAccountId === toAccountId) {
            alert('Cannot transfer to the same account');
            return;
        }
        
        const fromAccount = accounts.find(a => a.id === fromAccountId);
        const toAccount = accounts.find(a => a.id === toAccountId);
        
        if (!fromAccount || !toAccount) {
            alert('One or both accounts not found');
            return;
        }
        
        if (fromAccount.balance < amount) {
            alert('Insufficient funds in the source account');
            return;
        }
        
        // Create transfer transactions
        const transferOut = {
            id: `transfer-${Date.now()}-out`,
            type: 'expense',
            description: `Transfer to ${toAccount.name}`,
            amount,
            date,
            category: 'Transfer',
            accountId: fromAccountId,
            accountName: fromAccount.name,
            notes,
            transfer: true,
            transferId: `transfer-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        
        const transferIn = {
            id: `transfer-${Date.now()}-in`,
            type: 'income',
            source: `Transfer from ${fromAccount.name}`,
            amount,
            date,
            category: 'Transfer',
            accountId: toAccountId,
            accountName: toAccount.name,
            notes,
            transfer: true,
            transferId: `transfer-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        
        // Add to transactions
        transactions.push(transferOut, transferIn);
        
        // Update account balances
        fromAccount.balance -= amount;
        toAccount.balance += amount;
        
        // Save data
        saveUserData();
        
        // Reset form
        this.reset();
        document.getElementById('transferDate').value = new Date().toISOString().split('T')[0];
        
        // Refresh UI
        refreshDashboard();
        refreshIncomeSection();
        refreshExpensesSection();
        refreshAccountsSection();
        
        // Show success message
        alert('Transfer completed successfully!');
    });
    
    // Export buttons
    document.getElementById('exportBudgetBtn').addEventListener('click', exportBudgetToCsv);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);
}

function setupFilters() {
    // Income filters
    document.getElementById('incomeSearch').addEventListener('input', refreshIncomeSection);
    document.getElementById('incomeCategoryFilter').addEventListener('change', refreshIncomeSection);
    document.getElementById('incomeMonthFilter').addEventListener('change', refreshIncomeSection);
    
    // Expense filters
    document.getElementById('expenseSearch').addEventListener('input', refreshExpensesSection);
    document.getElementById('expenseCategoryFilter').addEventListener('change', refreshExpensesSection);
    document.getElementById('expenseMonthFilter').addEventListener('change', refreshExpensesSection);
    
    // Budget filter
    document.getElementById('budgetMonthFilter').addEventListener('change', refreshBudgetSection);
    
    // Expense chart filter
    document.getElementById('expenseChartMonth').addEventListener('change', refreshReportsSection);
    
    // Income vs expense filter
    document.getElementById('incomeExpenseTimeframe').addEventListener('change', function() {
        const customRangeContainer = document.getElementById('customRangeContainer');
        if (this.value === 'custom') {
            customRangeContainer.style.display = 'block';
        } else {
            customRangeContainer.style.display = 'none';
        }
        refreshReportsSection();
    });
    
    document.getElementById('startDate').addEventListener('change', refreshReportsSection);
    document.getElementById('endDate').addEventListener('change', refreshReportsSection);
}

function refreshDropdowns() {
    // Refresh account dropdowns
    const accountDropdowns = [
        'incomeAccount', 'expenseAccount', 'goalAccount', 
        'fromAccount', 'toAccount'
    ];
    
    accountDropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '';
        
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.name} (${account.type}) - KES ${account.balance.toFixed(2)}`;
            dropdown.appendChild(option);
        });
    });
}

function refreshDashboard() {
    // Calculate current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Filter transactions for current month
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    // Calculate totals
    const totalIncome = monthlyTransactions
        .filter(t => t.type === 'income' && !t.transfer)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthlyTransactions
        .filter(t => t.type === 'expense' && !t.transfer)
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate total balance across all accounts
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    
    // Calculate savings progress
    const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0);
    const totalSavingsCurrent = savingsGoals.reduce((sum, g) => sum + g.current, 0);
    const savingsPercentage = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;
    
    // Update dashboard values
    document.getElementById('currentBalance').textContent = `KES ${totalBalance.toFixed(2)}`;
    document.getElementById('monthlyIncome').textContent = `KES ${totalIncome.toFixed(2)}`;
    document.getElementById('monthlyExpenses').textContent = `KES ${totalExpenses.toFixed(2)}`;
    document.getElementById('savingsProgress').textContent = 
        `KES ${totalSavingsCurrent.toFixed(2)} / KES ${totalSavingsTarget.toFixed(2)}`;
    document.getElementById('savingsProgressBar').style.width = `${savingsPercentage}%`;
    
    // Update recent transactions
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    const recentTransactionsHtml = recentTransactions.map(t => `
        <tr>
            <td>${formatDate(t.date)}</td>
            <td>${t.type === 'income' ? t.source : t.description}</td>
            <td class="${t.type === 'income' ? 'text-success' : 'text-danger'}">
                ${t.type === 'income' ? '+' : '-'}KES ${t.amount.toFixed(2)}
            </td>
            <td>${t.type}</td>
        </tr>
    `).join('');
    
    document.getElementById('recentTransactions').innerHTML = recentTransactionsHtml;
    
    // Update budget usage chart
    updateBudgetUsageChart();
}

function updateBudgetUsageChart() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyBudgets = budgets.filter(b => b.month === currentMonth);
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && !t.transfer && t.date.startsWith(currentMonth));
    
    const categories = monthlyBudgets.map(b => b.category);
    const budgetAmounts = monthlyBudgets.map(b => b.amount);
    const spentAmounts = categories.map(category => 
        monthlyExpenses
            .filter(e => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0)
    );
    
    const ctx = document.createElement('canvas');
    ctx.id = 'budgetUsageCanvas';
    document.getElementById('budgetUsageChart').innerHTML = '';
    document.getElementById('budgetUsageChart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Budget',
                    data: budgetAmounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Spent',
                    data: spentAmounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function refreshIncomeSection() {
    refreshDropdowns();
    
    // Get filter values
    const searchTerm = document.getElementById('incomeSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('incomeCategoryFilter').value;
    const monthFilter = document.getElementById('incomeMonthFilter').value;
    
    // Filter income transactions
    let filteredIncome = transactions.filter(t => t.type === 'income' && !t.transfer);
    
    if (searchTerm) {
        filteredIncome = filteredIncome.filter(t => 
            t.source.toLowerCase().includes(searchTerm) || 
            (t.notes && t.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    if (categoryFilter) {
        filteredIncome = filteredIncome.filter(t => t.category === categoryFilter);
    }
    
    if (monthFilter) {
        filteredIncome = filteredIncome.filter(t => t.date.startsWith(monthFilter));
    }
    
    // Sort by date (newest first)
    filteredIncome.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate HTML
    const incomeHtml = filteredIncome.map(income => `
        <tr>
            <td>${formatDate(income.date)}</td>
            <td>${income.source}</td>
            <td class="text-success">KES ${income.amount.toFixed(2)}</td>
            <td>${income.category}</td>
            <td>${income.accountName}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action edit-income" data-id="${income.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-income" data-id="${income.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('incomeHistory').innerHTML = incomeHtml || '<tr><td colspan="6">No income records found</td></tr>';
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-income').forEach(btn => {
        btn.addEventListener('click', function() {
            const incomeId = this.getAttribute('data-id');
            editIncome(incomeId);
        });
    });
    
    document.querySelectorAll('.delete-income').forEach(btn => {
        btn.addEventListener('click', function() {
            const incomeId = this.getAttribute('data-id');
            deleteIncome(incomeId);
        });
    });
}

function refreshExpensesSection() {
    refreshDropdowns();
    
    // Get filter values
    const searchTerm = document.getElementById('expenseSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('expenseCategoryFilter').value;
    const monthFilter = document.getElementById('expenseMonthFilter').value;
    
    // Filter expense transactions
    let filteredExpenses = transactions.filter(t => t.type === 'expense' && !t.transfer);
    
    if (searchTerm) {
        filteredExpenses = filteredExpenses.filter(t => 
            t.description.toLowerCase().includes(searchTerm) || 
            (t.notes && t.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    if (categoryFilter) {
        filteredExpenses = filteredExpenses.filter(t => t.category === categoryFilter);
    }
    
    if (monthFilter) {
        filteredExpenses = filteredExpenses.filter(t => t.date.startsWith(monthFilter));
    }
    
    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate HTML
    const expensesHtml = filteredExpenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.description}</td>
            <td class="text-danger">KES ${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${expense.accountName}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action edit-expense" data-id="${expense.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-expense" data-id="${expense.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('expenseHistory').innerHTML = expensesHtml || '<tr><td colspan="6">No expense records found</td></tr>';
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-expense').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseId = this.getAttribute('data-id');
            editExpense(expenseId);
        });
    });
    
    document.querySelectorAll('.delete-expense').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseId = this.getAttribute('data-id');
            deleteExpense(expenseId);
        });
    });
}

function refreshBudgetSection() {
    const monthFilter = document.getElementById('budgetMonthFilter').value;
    
    // Filter budgets for selected month
    const filteredBudgets = budgets.filter(b => b.month === monthFilter);
    
    // Get expenses for selected month
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && !t.transfer && t.date.startsWith(monthFilter));
    
    // Generate budget overview
    const budgetHtml = filteredBudgets.map(budget => {
        const spent = monthlyExpenses
            .filter(e => e.category === budget.category)
            .reduce((sum, e) => sum + e.amount, 0);
        
        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;
        
        let progressClass = 'bg-success';
        if (percentage > 75) progressClass = 'bg-warning';
        if (percentage > 90) progressClass = 'bg-danger';
        
        return `
            <tr>
                <td>${budget.category}</td>
                <td>KES ${budget.amount.toFixed(2)}</td>
                <td>KES ${spent.toFixed(2)}</td>
                <td>KES ${remaining.toFixed(2)}</td>
                <td>
                    <div class="progress">
                        <div class="progress-bar ${progressClass}" role="progressbar" 
                            style="width: ${percentage}%" aria-valuenow="${percentage}" 
                            aria-valuemin="0" aria-valuemax="100">
                            ${percentage.toFixed(0)}%
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('budgetOverview').innerHTML = budgetHtml || '<tr><td colspan="5">No budgets set for this month</td></tr>';
}

function refreshSavingsSection() {
    refreshDropdowns();
    
    const savingsHtml = savingsGoals.map(goal => {
        const account = accounts.find(a => a.id === goal.accountId);
        const accountName = account ? account.name : 'Unknown Account';
        const percentage = (goal.current / goal.target) * 100;
        
        return `
            <div class="savings-goal-card">
                <h5>${goal.name}</h5>
                <div class="goal-meta">
                    <span>Target: KES ${goal.target.toFixed(2)}</span> | 
                    <span>Saved: KES ${goal.current.toFixed(2)}</span> | 
                    <span>Account: ${accountName}</span> | 
                    <span>Deadline: ${formatDate(goal.deadline)}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-success" role="progressbar" 
                        style="width: ${percentage}%" aria-valuenow="${percentage}" 
                        aria-valuemin="0" aria-valuemax="100">
                        ${percentage.toFixed(0)}%
                    </div>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-success add-to-savings" data-id="${goal.id}">
                        <i class="fas fa-plus"></i> Add to Savings
                    </button>
                    <button class="btn btn-sm btn-primary edit-goal" data-id="${goal.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-goal" data-id="${goal.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('savingsGoalsList').innerHTML = savingsHtml || '<p>No savings goals set yet.</p>';
    
    // Add event listeners to buttons
    document.querySelectorAll('.add-to-savings').forEach(btn => {
        btn.addEventListener('click', function() {
            const goalId = this.getAttribute('data-id');
            showAddToSavingsModal(goalId);
        });
    });
    
    document.querySelectorAll('.edit-goal').forEach(btn => {
        btn.addEventListener('click', function() {
            const goalId = this.getAttribute('data-id');
            editGoal(goalId);
        });
    });
    
    document.querySelectorAll('.delete-goal').forEach(btn => {
        btn.addEventListener('click', function() {
            const goalId = this.getAttribute('data-id');
            deleteGoal(goalId);
        });
    });
}

function refreshReportsSection() {
    // Expense breakdown chart
    updateExpenseChart();
    
    // Income vs expenses chart
    updateIncomeExpenseChart();
}

function updateExpenseChart() {
    const month = document.getElementById('expenseChartMonth').value;
    
    // Filter expenses for selected month
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && !t.transfer && t.date.startsWith(month));
    
    // Group by category
    const categories = {};
    monthlyExpenses.forEach(expense => {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += expense.amount;
    });
    
    // Create chart
    const ctx = document.createElement('canvas');
    ctx.id = 'expenseChartCanvas';
    document.getElementById('expenseChart').innerHTML = '';
    document.getElementById('expenseChart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: KES ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateIncomeExpenseChart() {
    const timeframe = document.getElementById('incomeExpenseTimeframe').value;
    let startDate, endDate;
    
    if (timeframe === 'month') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (timeframe === 'year') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
    } else {
        startDate = new Date(document.getElementById('startDate').value);
        endDate = new Date(document.getElementById('endDate').value);
    }
    
    // Filter transactions for selected timeframe
    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate && !t.transfer;
    });
    
    // Group by month
    const months = {};
    filteredTransactions.forEach(t => {
        const date = new Date(t.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!months[monthYear]) {
            months[monthYear] = { income: 0, expense: 0 };
        }
        
        if (t.type === 'income') {
            months[monthYear].income += t.amount;
        } else {
            months[monthYear].expense += t.amount;
        }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(months).sort();
    
    // Prepare data for chart
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        return new Date(year, month - 1).toLocaleDateString('default', { month: 'short', year: 'numeric' });
    });
    
    const incomeData = sortedMonths.map(m => months[m].income);
    const expenseData = sortedMonths.map(m => months[m].expense);
    
    // Create chart
    const ctx = document.createElement('canvas');
    ctx.id = 'incomeExpenseChartCanvas';
    document.getElementById('incomeExpenseChart').innerHTML = '';
    document.getElementById('incomeExpenseChart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: KES ${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function refreshAccountsSection() {
    refreshDropdowns();
    
    const accountsHtml = accounts.map(account => `
        <tr>
            <td>${account.name}</td>
            <td>${account.type}</td>
            <td class="${account.balance >= 0 ? 'text-success' : 'text-danger'}">
                KES ${account.balance.toFixed(2)}
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-action edit-account" data-id="${account.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-account" data-id="${account.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('accountsList').innerHTML = accountsHtml || '<tr><td colspan="4">No accounts found</td></tr>';
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-account').forEach(btn => {
        btn.addEventListener('click', function() {
            const accountId = this.getAttribute('data-id');
            editAccount(accountId);
        });
    });
    
    document.querySelectorAll('.delete-account').forEach(btn => {
        btn.addEventListener('click', function() {
            const accountId = this.getAttribute('data-id');
            deleteAccount(accountId);
        });
    });
}

function editIncome(incomeId) {
    const income = transactions.find(t => t.id === incomeId);
    if (!income) return;
    
    const formHtml = `
        <form id="editIncomeForm">
            <input type="hidden" id="editIncomeId" value="${income.id}">
            <div class="mb-3">
                <label for="editIncomeSource" class="form-label">Source</label>
                <input type="text" class="form-control" id="editIncomeSource" value="${income.source}" required>
            </div>
            <div class="mb-3">
                <label for="editIncomeAmount" class="form-label">Amount (KES)</label>
                <input type="number" step="0.01" class="form-control" id="editIncomeAmount" value="${income.amount}" required>
            </div>
            <div class="mb-3">
                <label for="editIncomeDate" class="form-label">Date</label>
                <input type="date" class="form-control" id="editIncomeDate" value="${income.date}" required>
            </div>
            <div class="mb-3">
                        <div class="mb-3">
                <label for="editIncomeCategory" class="form-label">Category</label>
                <select class="form-select" id="editIncomeCategory" required>
                    ${categories.income.map(cat => 
                        `<option value="${cat}" ${income.category === cat ? 'selected' : ''}>${cat}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="editIncomeAccount" class="form-label">Account</label>
                <select class="form-select" id="editIncomeAccount" required>
                    ${accounts.map(acc => 
                        `<option value="${acc.id}" ${income.accountId === acc.id ? 'selected' : ''}>
                            ${acc.name} (${acc.type}) - KES ${acc.balance.toFixed(2)}
                        </option>`
                    ).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="editIncomeNotes" class="form-label">Notes</label>
                <textarea class="form-control" id="editIncomeNotes" rows="2">${income.notes || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
    `;
    
    document.getElementById('editTransactionForm').innerHTML = formHtml;
    const editModal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    editModal.show();
    
    document.getElementById('editIncomeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const source = document.getElementById('editIncomeSource').value;
        const amount = parseFloat(document.getElementById('editIncomeAmount').value);
        const date = document.getElementById('editIncomeDate').value;
        const category = document.getElementById('editIncomeCategory').value;
        const accountId = document.getElementById('editIncomeAccount').value;
        const notes = document.getElementById('editIncomeNotes').value;
        
        const account = accounts.find(a => a.id === accountId);
        if (!account) {
            alert('Selected account not found');
            return;
        }
        
        // Find the original transaction
        const originalIndex = transactions.findIndex(t => t.id === income.id);
        if (originalIndex === -1) return;
        
        const originalTransaction = transactions[originalIndex];
        const originalAccount = accounts.find(a => a.id === originalTransaction.accountId);
        
        // Update account balances
        if (originalAccount && originalAccount.id !== accountId) {
            // If account changed, remove from old account and add to new
            originalAccount.balance -= originalTransaction.amount;
            account.balance += amount;
        } else if (originalAccount) {
            // Same account, just adjust the difference
            const amountDifference = amount - originalTransaction.amount;
            account.balance += amountDifference;
        }
        
        // Update the transaction
        transactions[originalIndex] = {
            ...originalTransaction,
            source,
            amount,
            date,
            category,
            accountId,
            accountName: account.name,
            notes
        };
        
        // Save data
        saveUserData();
        
        // Close modal
        editModal.hide();
        
        // Refresh UI
        refreshDashboard();
        refreshIncomeSection();
        refreshAccountsSection();
        
        // Show success message
        alert('Income updated successfully!');
    });
}

function editExpense(expenseId) {
    const expense = transactions.find(t => t.id === expenseId);
    if (!expense) return;
    
    const formHtml = `
        <form id="editExpenseForm">
            <input type="hidden" id="editExpenseId" value="${expense.id}">
            <div class="mb-3">
                <label for="editExpenseDescription" class="form-label">Description</label>
                <input type="text" class="form-control" id="editExpenseDescription" value="${expense.description}" required>
            </div>
            <div class="mb-3">
                <label for="editExpenseAmount" class="form-label">Amount (KES)</label>
                <input type="number" step="0.01" class="form-control" id="editExpenseAmount" value="${expense.amount}" required>
            </div>
            <div class="mb-3">
                <label for="editExpenseDate" class="form-label">Date</label>
                <input type="date" class="form-control" id="editExpenseDate" value="${expense.date}" required>
            </div>
            <div class="mb-3">
                <label for="editExpenseCategory" class="form-label">Category</label>
                <select class="form-select" id="editExpenseCategory" required>
                    ${categories.expense.map(cat => 
                        `<option value="${cat}" ${expense.category === cat ? 'selected' : ''}>${cat}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="editExpenseAccount" class="form-label">Account</label>
                <select class="form-select" id="editExpenseAccount" required>
                    ${accounts.map(acc => 
                        `<option value="${acc.id}" ${expense.accountId === acc.id ? 'selected' : ''}>
                            ${acc.name} (${acc.type}) - KES ${acc.balance.toFixed(2)}
                        </option>`
                    ).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="editExpenseNotes" class="form-label">Notes</label>
                <textarea class="form-control" id="editExpenseNotes" rows="2">${expense.notes || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
    `;
    
    document.getElementById('editTransactionForm').innerHTML = formHtml;
    const editModal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    editModal.show();
    
    document.getElementById('editExpenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const description = document.getElementById('editExpenseDescription').value;
        const amount = parseFloat(document.getElementById('editExpenseAmount').value);
        const date = document.getElementById('editExpenseDate').value;
        const category = document.getElementById('editExpenseCategory').value;
        const accountId = document.getElementById('editExpenseAccount').value;
        const notes = document.getElementById('editExpenseNotes').value;
        
        const account = accounts.find(a => a.id === accountId);
        if (!account) {
            alert('Selected account not found');
            return;
        }
        
        // Find the original transaction
        const originalIndex = transactions.findIndex(t => t.id === expense.id);
        if (originalIndex === -1) return;
        
        const originalTransaction = transactions[originalIndex];
        const originalAccount = accounts.find(a => a.id === originalTransaction.accountId);
        
        // Check if new amount exceeds account balance (if account changed)
        if (originalAccount && originalAccount.id !== accountId) {
            if (account.balance < amount) {
                alert('Insufficient funds in the selected account');
                return;
            }
        }
        
        // Update account balances
        if (originalAccount && originalAccount.id !== accountId) {
            // If account changed, remove from old account and add to new
            originalAccount.balance += originalTransaction.amount;
            account.balance -= amount;
        } else if (originalAccount) {
            // Same account, just adjust the difference
            const amountDifference = amount - originalTransaction.amount;
            account.balance -= amountDifference;
        }
        
        // Update the transaction
        transactions[originalIndex] = {
            ...originalTransaction,
            description,
            amount,
            date,
            category,
            accountId,
            accountName: account.name,
            notes
        };
        
        // Save data
        saveUserData();
        
        // Close modal
        editModal.hide();
        
        // Refresh UI
        refreshDashboard();
        refreshExpensesSection();
        refreshAccountsSection();
        
        // Show success message
        alert('Expense updated successfully!');
    });
}

function deleteIncome(incomeId) {
    if (!confirm('Are you sure you want to delete this income record?')) return;
    
    const incomeIndex = transactions.findIndex(t => t.id === incomeId);
    if (incomeIndex === -1) return;
    
    const income = transactions[incomeIndex];
    const account = accounts.find(a => a.id === income.accountId);
    
    if (account) {
        // Revert the account balance
        account.balance -= income.amount;
    }
    
    // Remove the transaction
    transactions.splice(incomeIndex, 1);
    
    // Save data
    saveUserData();
    
    // Refresh UI
    refreshDashboard();
    refreshIncomeSection();
    refreshAccountsSection();
    
    alert('Income deleted successfully!');
}

function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    
    const expenseIndex = transactions.findIndex(t => t.id === expenseId);
    if (expenseIndex === -1) return;
    
    const expense = transactions[expenseIndex];
    const account = accounts.find(a => a.id === expense.accountId);
    
    if (account) {
        // Revert the account balance
        account.balance += expense.amount;
    }
    
    // Remove the transaction
    transactions.splice(expenseIndex, 1);
    
    // Save data
    saveUserData();
    
    // Refresh UI
    refreshDashboard();
    refreshExpensesSection();
    refreshAccountsSection();
    
    alert('Expense deleted successfully!');
}

function editAccount(accountId) {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    
    const formHtml = `
        <form id="editAccountForm">
            <input type="hidden" id="editAccountId" value="${account.id}">
            <div class="mb-3">
                <label for="editAccountName" class="form-label">Account Name</label>
                <input type="text" class="form-control" id="editAccountName" value="${account.name}" required>
            </div>
            <div class="mb-3">
                <label for="editAccountType" class="form-label">Account Type</label>
                <select class="form-select" id="editAccountType" required>
                    <option value="Checking" ${account.type === 'Checking' ? 'selected' : ''}>Checking</option>
                    <option value="Savings" ${account.type === 'Savings' ? 'selected' : ''}>Savings</option>
                    <option value="Credit Card" ${account.type === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    <option value="Investment" ${account.type === 'Investment' ? 'selected' : ''}>Investment</option>
                    <option value="Other" ${account.type === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="editAccountBalance" class="form-label">Balance (KES)</label>
                <input type="number" step="0.01" class="form-control" id="editAccountBalance" value="${account.balance}" required>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
    `;
    
    document.getElementById('editAccountForm').innerHTML = formHtml;
    const editModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    editModal.show();
    
    document.getElementById('editAccountForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('editAccountName').value;
        const type = document.getElementById('editAccountType').value;
        const balance = parseFloat(document.getElementById('editAccountBalance').value);
        
        const accountIndex = accounts.findIndex(a => a.id === account.id);
        if (accountIndex === -1) return;
        
        // Update the account
        accounts[accountIndex] = {
            ...account,
            name,
            type,
            balance
        };
        
        // Save data
        saveUserData();
        
        // Close modal
        editModal.hide();
        
        // Refresh UI
        refreshAccountsSection();
        refreshDropdowns();
        
        // Show success message
        alert('Account updated successfully!');
    });
}

function deleteAccount(accountId) {
    if (!confirm('Are you sure you want to delete this account? Any transactions associated with this account will also be deleted.')) return;
    
    const accountIndex = accounts.findIndex(a => a.id === accountId);
    if (accountIndex === -1) return;
    
    // Check if this is the last account
    if (accounts.length <= 1) {
        alert('You must have at least one account');
        return;
    }
    
    // Remove transactions associated with this account
    transactions = transactions.filter(t => t.accountId !== accountId);
    
    // Remove the account
    accounts.splice(accountIndex, 1);
    
    // Remove savings goals associated with this account
    savingsGoals = savingsGoals.filter(g => g.accountId !== accountId);
    
    // Save data
    saveUserData();
    
    // Refresh UI
    refreshDashboard();
    refreshIncomeSection();
    refreshExpensesSection();
    refreshSavingsSection();
    refreshAccountsSection();
    refreshDropdowns();
    
    alert('Account deleted successfully!');
}

function editGoal(goalId) {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const formHtml = `
        <form id="editGoalForm">
            <input type="hidden" id="editGoalId" value="${goal.id}">
            <div class="mb-3">
                <label for="editGoalName" class="form-label">Goal Name</label>
                <input type="text" class="form-control" id="editGoalName" value="${goal.name}" required>
            </div>
            <div class="mb-3">
                <label for="editGoalTarget" class="form-label">Target Amount (KES)</label>
                <input type="number" step="0.01" class="form-control" id="editGoalTarget" value="${goal.target}" required>
            </div>
            <div class="mb-3">
                <label for="editGoalDeadline" class="form-label">Target Date</label>
                <input type="date" class="form-control" id="editGoalDeadline" value="${goal.deadline}" required>
            </div>
            <div class="mb-3">
                <label for="editGoalAccount" class="form-label">Savings Account</label>
                <select class="form-select" id="editGoalAccount" required>
                    ${accounts.map(acc => 
                        `<option value="${acc.id}" ${goal.accountId === acc.id ? 'selected' : ''}>
                            ${acc.name} (${acc.type}) - KES ${acc.balance.toFixed(2)}
                        </option>`
                    ).join('')}
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
    `;
    
    document.getElementById('editGoalForm').innerHTML = formHtml;
    const editModal = new bootstrap.Modal(document.getElementById('editGoalModal'));
    editModal.show();
    
    document.getElementById('editGoalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('editGoalName').value;
        const target = parseFloat(document.getElementById('editGoalTarget').value);
        const deadline = document.getElementById('editGoalDeadline').value;
        const accountId = document.getElementById('editGoalAccount').value;
        
        const goalIndex = savingsGoals.findIndex(g => g.id === goal.id);
        if (goalIndex === -1) return;
        
        // Update the goal
        savingsGoals[goalIndex] = {
            ...goal,
            name,
            target,
            deadline,
            accountId
        };
        
        // Save data
        saveUserData();
        
        // Close modal
        editModal.hide();
        
        // Refresh UI
        refreshSavingsSection();
        refreshDashboard();
        
        // Show success message
        alert('Savings goal updated successfully!');
    });
}

function showAddToSavingsModal(goalId) {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const formHtml = `
        <form id="addToSavingsForm">
            <input type="hidden" id="addToSavingsGoalId" value="${goal.id}">
            <div class="mb-3">
                <label for="addToSavingsAmount" class="form-label">Amount to Add (KES)</label>
                <input type="number" step="0.01" class="form-control" id="addToSavingsAmount" required>
            </div>
            <div class="mb-3">
                <label for="addToSavingsFromAccount" class="form-label">From Account</label>
                <select class="form-select" id="addToSavingsFromAccount" required>
                    ${accounts.map(acc => 
                        `<option value="${acc.id}">
                            ${acc.name} (${acc.type}) - KES ${acc.balance.toFixed(2)}
                        </option>`
                    ).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="addToSavingsDate" class="form-label">Date</label>
                <input type="date" class="form-control" id="addToSavingsDate" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="mb-3">
                <label for="addToSavingsNotes" class="form-label">Notes</label>
                <textarea class="form-control" id="addToSavingsNotes" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Add to Savings</button>
        </form>
    `;
    
    document.getElementById('addToSavingsForm').innerHTML = formHtml;
    const addModal = new bootstrap.Modal(document.getElementById('addToSavingsModal'));
    addModal.show();
    
    document.getElementById('addToSavingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('addToSavingsAmount').value);
        const fromAccountId = document.getElementById('addToSavingsFromAccount').value;
        const date = document.getElementById('addToSavingsDate').value;
        const notes = document.getElementById('addToSavingsNotes').value;
        
        const fromAccount = accounts.find(a => a.id === fromAccountId);
        const toAccount = accounts.find(a => a.id === goal.accountId);
        
        if (!fromAccount || !toAccount) {
            alert('One or both accounts not found');
            return;
        }
        
        if (fromAccount.balance < amount) {
            alert('Insufficient funds in the source account');
            return;
        }
        
        // Update account balances
        fromAccount.balance -= amount;
        toAccount.balance += amount;
        
        // Update savings goal
        const goalIndex = savingsGoals.findIndex(g => g.id === goal.id);
        if (goalIndex !== -1) {
            savingsGoals[goalIndex].current += amount;
        }
        
        // Create transfer transactions
        const transferOut = {
            id: `savings-${Date.now()}-out`,
            type: 'expense',
            description: `Savings transfer to ${goal.name}`,
            amount,
            date,
            category: 'Savings',
            accountId: fromAccountId,
            accountName: fromAccount.name,
            notes,
            transfer: true,
            savingsTransfer: true,
            savingsGoalId: goal.id,
            createdAt: new Date().toISOString()
        };
        
        const transferIn = {
            id: `savings-${Date.now()}-in`,
            type: 'income',
            source: `Savings transfer from ${fromAccount.name}`,
            amount,
            date,
            category: 'Savings',
            accountId: goal.accountId,
            accountName: toAccount.name,
            notes,
            transfer: true,
            savingsTransfer: true,
            savingsGoalId: goal.id,
            createdAt: new Date().toISOString()
        };
        
        // Add to transactions
        transactions.push(transferOut, transferIn);
        
        // Save data
        saveUserData();
        
        // Close modal
        addModal.hide();
        
        // Refresh UI
        refreshDashboard();
        refreshSavingsSection();
        refreshAccountsSection();
        
        // Show success message
        alert('Savings added successfully!');
    });
}

function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    
    const goalIndex = savingsGoals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;
    
    // Remove the goal
    savingsGoals.splice(goalIndex, 1);
    
    // Save data
    saveUserData();
    
    // Refresh UI
    refreshDashboard();
    refreshSavingsSection();
    
    alert('Savings goal deleted successfully!');
}

function exportBudgetToCsv() {
    const month = document.getElementById('budgetMonthFilter').value;
    const filteredBudgets = budgets.filter(b => b.month === month);
    
    if (filteredBudgets.length === 0) {
        alert('No budgets to export for the selected month');
        return;
    }
    
    // Get expenses for selected month
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && !t.transfer && t.date.startsWith(month));
    
    // Create CSV content
    let csvContent = "Category,Budget,Spent,Remaining,Progress\n";
    
    filteredBudgets.forEach(budget => {
        const spent = monthlyExpenses
            .filter(e => e.category === budget.category)
            .reduce((sum, e) => sum + e.amount, 0);
        
        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;
        
        csvContent += `"${budget.category}",${budget.amount.toFixed(2)},${spent.toFixed(2)},${remaining.toFixed(2)},${percentage.toFixed(0)}%\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `budgets_${month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const exportType = document.getElementById('exportType').value;
    const month = document.getElementById('exportMonth').value;
    
    let title = '';
    let headers = [];
    let data = [];
    
    switch(exportType) {
        case 'transactions':
            title = `Transactions for ${month}`;
            headers = [['Date', 'Description', 'Amount', 'Type', 'Category', 'Account']];
            data = transactions
                .filter(t => t.date.startsWith(month))
                .map(t => [
                    formatDate(t.date),
                    t.type === 'income' ? t.source : t.description,
                    t.type === 'income' ? `+KES ${t.amount.toFixed(2)}` : `-KES ${t.amount.toFixed(2)}`,
                    t.type,
                    t.category,
                    t.accountName
                ]);
            break;
            
        case 'budgets':
            title = `Budgets for ${month}`;
            headers = [['Category', 'Budget', 'Spent', 'Remaining', 'Progress']];
            
            const monthlyBudgets = budgets.filter(b => b.month === month);
            const monthlyExpenses = transactions
                .filter(t => t.type === 'expense' && !t.transfer && t.date.startsWith(month));
            
            data = monthlyBudgets.map(budget => {
                const spent = monthlyExpenses
                    .filter(e => e.category === budget.category)
                    .reduce((sum, e) => sum + e.amount, 0);
                
                const remaining = budget.amount - spent;
                const percentage = (spent / budget.amount) * 100;
                
                return [
                    budget.category,
                    `KES ${budget.amount.toFixed(2)}`,
                    `KES ${spent.toFixed(2)}`,
                    `KES ${remaining.toFixed(2)}`,
                    `${percentage.toFixed(0)}%`
                ];
            });
            break;
            
        case 'savings':
            title = 'Savings Goals';
            headers = [['Goal', 'Target', 'Saved', 'Progress', 'Deadline', 'Account']];
            
            data = savingsGoals.map(goal => {
                const account = accounts.find(a => a.id === goal.accountId);
                const accountName = account ? account.name : 'Unknown Account';
                const percentage = (goal.current / goal.target) * 100;
                
                return [
                    goal.name,
                    `KES ${goal.target.toFixed(2)}`,
                    `KES ${goal.current.toFixed(2)}`,
                    `${percentage.toFixed(0)}%`,
                    formatDate(goal.deadline),
                    accountName
                ];
            });
            break;
    }
    
    if (data.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Add title
    doc.text(title, 14, 15);
    
    // Add table
    doc.autoTable({
        head: headers,
        body: data,
        startY: 25,
        styles: {
            fontSize: 8
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
        }
    });
    
    // Save the PDF
    doc.save(`${exportType}_${month}.pdf`);
}

function exportToCsv() {
    const exportType = document.getElementById('exportType').value;
    const month = document.getElementById('exportMonth').value;
    
    let csvContent = '';
    let filename = '';
    
    switch(exportType) {
        case 'transactions':
            filename = `transactions_${month}.csv`;
            csvContent = "Date,Description,Amount,Type,Category,Account\n";
            
            transactions
                .filter(t => t.date.startsWith(month))
                .forEach(t => {
                    csvContent += `"${formatDate(t.date)}","${t.type === 'income' ? t.source : t.description}",${t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)},"${t.type}","${t.category}","${t.accountName}"\n`;
                });
            break;
            
        case 'budgets':
            filename = `budgets_${month}.csv`;
            csvContent = "Category,Budget,Spent,Remaining,Progress\n";
            
            const monthlyBudgets = budgets.filter(b => b.month === month);
            const monthlyExpenses = transactions
                .filter(t => t.type === 'expense' && !t.transfer && t.date.startsWith(month));
            
            monthlyBudgets.forEach(budget => {
                const spent = monthlyExpenses
                    .filter(e => e.category === budget.category)
                    .reduce((sum, e) => sum + e.amount, 0);
                
                const remaining = budget.amount - spent;
                const percentage = (spent / budget.amount) * 100;
                
                csvContent += `"${budget.category}",${budget.amount.toFixed(2)},${spent.toFixed(2)},${remaining.toFixed(2)},${percentage.toFixed(0)}%\n`;
            });
            break;
            
        case 'savings':
            filename = 'savings_goals.csv';
            csvContent = "Goal,Target,Saved,Progress,Deadline,Account\n";
            
            savingsGoals.forEach(goal => {
                const account = accounts.find(a => a.id === goal.accountId);
                const accountName = account ? account.name : 'Unknown Account';
                const percentage = (goal.current / goal.target) * 100;
                
                csvContent += `"${goal.name}",${goal.target.toFixed(2)},${goal.current.toFixed(2)},${percentage.toFixed(0)}%,"${formatDate(goal.deadline)}","${accountName}"\n`;
            });
            break;
    }
    
    if (!csvContent) {
        alert('No data to export');
        return;
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
