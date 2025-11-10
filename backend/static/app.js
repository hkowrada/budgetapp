// API Base URL
const API_URL = '/api';

// Global data
let allData = {
    categories: [],
    expenses: []
};

let filteredExpenses = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setDefaultDate();
});

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
}

// Load all data
async function loadData() {
    try {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) throw new Error('Failed to load data');
        
        allData = await response.json();
        filteredExpenses = [...allData.expenses];
        
        updateUI();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data', 'error');
    }
}

// Update all UI components
function updateUI() {
    updateSummary();
    updateFilters();
    updateExpensesTable();
    updateCategoryChart();
    updateCategorySelects();
}

// Update summary cards
function updateSummary() {
    const total = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    // Calculate this month's expenses
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthTotal = filteredExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    }).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    document.getElementById('totalExpenses').textContent = `€${total.toFixed(2)}`;
    document.getElementById('monthExpenses').textContent = `€${monthTotal.toFixed(2)}`;
    document.getElementById('totalCategories').textContent = allData.categories.length;
    document.getElementById('totalRecords').textContent = filteredExpenses.length;
}

// Update filter dropdowns
function updateFilters() {
    // Update category filter
    const categoryFilter = document.getElementById('filterCategory');
    const currentCategoryValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    allData.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
    categoryFilter.value = currentCategoryValue;
    
    // Update member filter
    const memberFilter = document.getElementById('filterMember');
    const currentMemberValue = memberFilter.value;
    const members = [...new Set(allData.expenses.map(exp => exp.member))];
    memberFilter.innerHTML = '<option value="">All Members</option>';
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        memberFilter.appendChild(option);
    });
    memberFilter.value = currentMemberValue;
}

// Apply filters
function applyFilters() {
    const categoryFilter = document.getElementById('filterCategory').value;
    const memberFilter = document.getElementById('filterMember').value;
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    
    filteredExpenses = allData.expenses.filter(exp => {
        let match = true;
        
        if (categoryFilter && exp.category !== categoryFilter) match = false;
        if (memberFilter && exp.member !== memberFilter) match = false;
        if (startDate && exp.date < startDate) match = false;
        if (endDate && exp.date > endDate) match = false;
        
        return match;
    });
    
    updateSummary();
    updateExpensesTable();
    updateCategoryChart();
}

// Clear filters
function clearFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterMember').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    
    filteredExpenses = [...allData.expenses];
    updateSummary();
    updateExpensesTable();
    updateCategoryChart();
}

// Update expenses table
function updateExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No expenses found. Try adjusting your filters or add a new expense!</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedExpenses.map(exp => `
        <tr data-testid="expense-row-${exp.id}">
            <td>${formatDate(exp.date)}</td>
            <td>${exp.description}</td>
            <td><span class="category-badge">${exp.category}</span></td>
            <td>${exp.member}</td>
            <td class="amount-cell">€${parseFloat(exp.amount).toFixed(2)}</td>
            <td>
                <button class="btn btn-delete" onclick="deleteExpense('${exp.id}')" data-testid="delete-expense-${exp.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Update category chart
function updateCategoryChart() {
    const chartContainer = document.getElementById('categoryChart');
    
    if (filteredExpenses.length === 0) {
        chartContainer.innerHTML = '<p class="no-data">No data available for chart</p>';
        return;
    }
    
    // Calculate totals by category
    const categoryTotals = {};
    filteredExpenses.forEach(exp => {
        if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += parseFloat(exp.amount);
    });
    
    const maxAmount = Math.max(...Object.values(categoryTotals));
    
    chartContainer.innerHTML = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => {
            const percentage = (amount / maxAmount) * 100;
            return `
                <div class="category-bar" data-testid="category-bar-${category}">
                    <div class="category-name">${category}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%">
                            €${amount.toFixed(2)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
}

// Update category selects in form
function updateCategorySelects() {
    const select = document.getElementById('expenseCategory');
    select.innerHTML = allData.categories.map(cat => 
        `<option value="${cat}">${cat}</option>`
    ).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Modal functions
function showAddExpenseModal() {
    document.getElementById('addExpenseModal').classList.add('active');
    document.getElementById('addExpenseForm').reset();
    setDefaultDate();
}

function showManageCategoriesModal() {
    document.getElementById('manageCategoriesModal').classList.add('active');
    renderCategoriesList();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Handle add expense
async function handleAddExpense(event) {
    event.preventDefault();
    
    const expense = {
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        description: document.getElementById('expenseDescription').value,
        member: document.getElementById('expenseMember').value
    };
    
    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        
        if (!response.ok) throw new Error('Failed to add expense');
        
        showNotification('Expense added successfully!', 'success');
        closeModal('addExpenseModal');
        await loadData();
    } catch (error) {
        console.error('Error adding expense:', error);
        showNotification('Error adding expense', 'error');
    }
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete expense');
        
        showNotification('Expense deleted successfully!', 'success');
        await loadData();
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification('Error deleting expense', 'error');
    }
}

// Render categories list
function renderCategoriesList() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = allData.categories.map(cat => `
        <div class="category-item" data-testid="category-item-${cat}">
            <span>${cat}</span>
            <button class="btn btn-delete" onclick="deleteCategory('${cat}')" data-testid="delete-category-${cat}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
}

// Handle add category
async function handleAddCategory(event) {
    event.preventDefault();
    
    const categoryName = document.getElementById('newCategoryName').value.trim();
    
    if (!categoryName) return;
    
    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add category');
        }
        
        showNotification('Category added successfully!', 'success');
        document.getElementById('addCategoryForm').reset();
        await loadData();
        renderCategoriesList();
    } catch (error) {
        console.error('Error adding category:', error);
        showNotification(error.message, 'error');
    }
}

// Delete category
async function deleteCategory(categoryName) {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/categories/${encodeURIComponent(categoryName)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete category');
        
        showNotification('Category deleted successfully!', 'success');
        await loadData();
        renderCategoriesList();
    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification('Error deleting category', 'error');
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);