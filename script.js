// Family Budget App JavaScript

// Local Storage Data Management
const STORAGE_KEYS = {
    salaries: 'family_budget_salaries',
    bills: 'family_budget_bills',
    transactions: 'family_budget_transactions'
};

// Initialize default data
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.salaries)) {
        const defaultSalaries = {
            harish: 3200,
            durga: 2800
        };
        localStorage.setItem(STORAGE_KEYS.salaries, JSON.stringify(defaultSalaries));
    }

    if (!localStorage.getItem(STORAGE_KEYS.bills)) {
        const defaultBills = [
            { id: 'bill_1', name: 'Electricity Bill', amount: 90, dueDay: 15 },
            { id: 'bill_2', name: 'Water Bill', amount: 30, dueDay: 5 },
            { id: 'bill_3', name: 'Internet & WiFi', amount: 35, dueDay: 1 },
            { id: 'bill_4', name: 'Mobile Phone', amount: 45, dueDay: 10 },
            { id: 'bill_5', name: 'Home Insurance', amount: 18, dueDay: 20 },
            { id: 'bill_6', name: 'Home Loan EMI', amount: 1000, dueDay: 1 }
        ];
        localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(defaultBills));
    }

    if (!localStorage.getItem(STORAGE_KEYS.transactions)) {
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify([]));
    }
}

// Get data from localStorage
function getData(key) {
    return JSON.parse(localStorage.getItem(key) || '{}');
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Update dashboard
function updateDashboard() {
    const salaries = getData(STORAGE_KEYS.salaries);
    const bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.bills) || '[]');
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]');

    // Calculate totals
    const monthlyIncome = (salaries.harish || 0) + (salaries.durga || 0);
    const monthlyBills = bills.reduce((total, bill) => total + bill.amount, 0);
    const monthlyExpenses = monthlyBills + transactions.reduce((total, txn) => total + (txn.amount || 0), 0);
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlySurplus / monthlyIncome) * 100).toFixed(1) : 0;

    // Update display
    document.getElementById('monthly-income').textContent = `€${monthlyIncome.toLocaleString()}`;
    document.getElementById('monthly-expenses').textContent = `€${monthlyExpenses.toLocaleString()}`;
    document.getElementById('monthly-surplus').textContent = `€${monthlySurplus.toLocaleString()}`;
    document.getElementById('savings-rate').textContent = `${savingsRate}%`;
    
    document.getElementById('harish-salary').textContent = `€${(salaries.harish || 0).toLocaleString()}`;
    document.getElementById('durga-salary').textContent = `€${(salaries.durga || 0).toLocaleString()}`;
    document.getElementById('combined-income').textContent = `€${monthlyIncome.toLocaleString()}/month`;

    // Update bills and transactions
    updateBillsDisplay();
    updateTransactionsDisplay();
}

function updateBillsDisplay() {
    const bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.bills) || '[]');
    const container = document.getElementById('bills-container');
    
    container.innerHTML = bills.map(bill => `
        <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-blue-100 hover:border-blue-200 transition-colors relative card">
            <button onclick="deleteBill('${bill.id}')" class="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">
                🗑️
            </button>
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-600 flex items-center">
                        <span class="mr-2 text-lg">${getBillIcon(bill.name)}</span>
                        ${bill.name}
                    </p>
                    <p class="text-xs text-gray-500 mb-2">Due: ${bill.dueDay} of every month</p>
                    <div class="flex items-center space-x-2 mt-1">
                        <p class="text-lg font-bold text-blue-600">€${bill.amount.toLocaleString()}</p>
                        <button onclick="editBill('${bill.id}')" class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 text-xs rounded">
                            ✏️ Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateTransactionsDisplay() {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]');
    const container = document.getElementById('transactions-container');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No transactions yet</p>';
        return;
    }
    
    container.innerHTML = transactions.slice(-10).reverse().map(txn => `
        <div class="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <div>
                <p class="font-medium text-gray-800">${txn.description}</p>
                <p class="text-sm text-gray-500">${new Date(txn.date).toLocaleDateString()}</p>
            </div>
            <p class="font-bold text-red-600">€${txn.amount.toLocaleString()}</p>
        </div>
    `).join('');
}

function getBillIcon(billName) {
    const name = billName.toLowerCase();
    if (name.includes('electricity')) return '⚡';
    if (name.includes('water')) return '💧';
    if (name.includes('internet') || name.includes('wifi')) return '📶';
    if (name.includes('mobile') || name.includes('phone')) return '📱';
    if (name.includes('insurance')) return '🛡️';
    if (name.includes('loan') || name.includes('emi')) return '🏠';
    return '💵';
}

// Navigation functions
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('mobile-menu-closed');
    menu.classList.toggle('mobile-menu-open');
}

// Salary management
let currentSalaryUser = '';

function editSalary(user) {
    currentSalaryUser = user;
    const salaries = getData(STORAGE_KEYS.salaries);
    document.getElementById('salary-input').value = salaries[user] || 0;
    document.getElementById('salary-modal').classList.remove('hidden');
}

function saveSalary() {
    const amount = parseFloat(document.getElementById('salary-input').value) || 0;
    const salaries = getData(STORAGE_KEYS.salaries);
    salaries[currentSalaryUser] = amount;
    setData(STORAGE_KEYS.salaries, salaries);
    closeSalaryModal();
    updateDashboard();
    showToast(`Salary updated to €${amount.toLocaleString()}`);
}

function closeSalaryModal() {
    document.getElementById('salary-modal').classList.add('hidden');
}

// Expense management
function showAddExpense() {
    document.getElementById('expense-modal').classList.remove('hidden');
}

function saveExpense() {
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value) || 0;
    
    if (!description || amount <= 0) {
        alert('Please enter valid description and amount');
        return;
    }

    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]');
    transactions.push({
        id: Date.now(),
        description,
        amount,
        date: new Date().toISOString()
    });
    
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    closeExpenseModal();
    updateDashboard();
    showToast(`Added expense: €${amount.toLocaleString()} - ${description}`);
}

function closeExpenseModal() {
    document.getElementById('expense-modal').classList.add('hidden');
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-amount').value = '';
}

// Bill management
function showAddBill() {
    document.getElementById('bill-modal').classList.remove('hidden');
}

function saveBill() {
    const name = document.getElementById('bill-name').value.trim();
    const amount = parseFloat(document.getElementById('bill-amount').value) || 0;
    const dueDay = parseInt(document.getElementById('bill-due-day').value) || 15;
    
    if (!name || amount <= 0) {
        alert('Please enter valid bill name and amount');
        return;
    }

    const bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.bills) || '[]');
    bills.push({
        id: 'bill_' + Date.now(),
        name,
        amount,
        dueDay
    });
    
    localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(bills));
    closeBillModal();
    updateDashboard();
    showToast(`Added bill: ${name} - €${amount.toLocaleString()}`);
}

function closeBillModal() {
    document.getElementById('bill-modal').classList.add('hidden');
    document.getElementById('bill-name').value = '';
    document.getElementById('bill-amount').value = '';
    document.getElementById('bill-due-day').value = '';
}

function editBill(billId) {
    const bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.bills) || '[]');
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const newAmount = prompt(`Edit ${bill.name} amount:`, bill.amount);
    if (newAmount && !isNaN(parseFloat(newAmount))) {
        bill.amount = parseFloat(newAmount);
        localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(bills));
        updateDashboard();
        showToast(`Updated ${bill.name} to €${bill.amount.toLocaleString()}`);
    }
}

function deleteBill(billId) {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    
    let bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.bills) || '[]');
    bills = bills.filter(bill => bill.id !== billId);
    localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(bills));
    updateDashboard();
    showToast('Bill deleted successfully');
}

// Additional features
function showAddEvent() {
    showToast('Calendar feature coming soon!');
}

// Toast notifications
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('opacity-0'), 3000);
    setTimeout(() => document.body.removeChild(toast), 3500);
}

// Hash navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    showSection(hash);
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    updateDashboard();
    
    // Show initial section based on hash
    const hash = window.location.hash.slice(1) || 'dashboard';
    showSection(hash);
});