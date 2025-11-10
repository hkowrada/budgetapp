# Family Expense Tracker - With Login & Salary Management

## Quick Start

**Just double-click `index.html` to start using the app!**

No installation, no server, no packages needed. Works completely offline in your browser.

## 🔐 User Login System

The app includes 3 pre-configured users with different access levels:

### 1. **Harish** - Administrator (Full Access)
- ✅ Add expenses
- ✅ Delete expenses
- ✅ Manage categories (add/delete)
- ✅ Set monthly salary
- ✅ View all reports and dashboard

### 2. **Bhavani** - Contributor (Add Only)
- ✅ Add expenses
- ❌ Cannot delete expenses
- ❌ Cannot manage categories
- ❌ Cannot change salary
- ✅ View all reports and dashboard

### 3. **Guest** - Viewer (Read Only)
- ❌ Cannot add expenses
- ❌ Cannot delete expenses
- ❌ Cannot manage categories
- ❌ Cannot change salary
- ✅ View all reports and dashboard only

## 💰 Monthly Salary Feature

- Set a different salary for each month
- Default salary: **€2700**
- Dashboard shows:
  - Monthly salary
  - Total expenses for current month
  - Remaining balance (Salary - Expenses)
  - Percentage of salary spent
  - Visual progress bar
  - Status indicator:
    - ✓ Looking good (>20% remaining)
    - ⚡ Running low (<20% remaining)
    - ⚠️ Over budget! (negative balance)

## 🎯 Features

### Dashboard Summary Cards
1. **Monthly Salary** - Shows current month's salary
2. **Total Expenses** - Current month expenses with % of salary
3. **Remaining Balance** - What's left from salary
4. **Total Records** - Number of expense entries

### Expense Tracking
- Add expenses with: amount, category, date, description, family member
- Track who added each expense
- Filter by category, member, date range
- Sort by date (newest first)
- Delete expenses (admin only)

### Category Management
- Pre-loaded categories: Rent, Electricity, Groceries, Transport, Entertainment
- Add custom categories (admin only)
- Delete categories (admin only)
- Visual category breakdown chart

### Salary Management
- Set salary per month (admin only)
- Different salary for different months
- Automatic calculation of balance and percentage

## 📂 Data Storage

All data stored in browser's **localStorage**:
```javascript
{
  categories: ["Rent", "Electricity", ...],
  expenses: [{id, amount, category, date, description, member, addedBy}, ...],
  salaries: {"2025-11": 2700, "2025-12": 2800, ...}
}
```

## 🚀 How to Use

### First Time Setup
1. Download `index.html`
2. Double-click to open in browser
3. Select a user (Harish, Bhavani, or Guest)

### Setting Monthly Salary (Admin Only)
1. Login as **Harish**
2. Click **"Salary"** button
3. Enter amount (e.g., 2700)
4. Select month
5. Click **"Save Salary"**

### Adding Expenses
1. Login as **Harish** or **Bhavani**
2. Click **"Add Expense"**
3. Fill in details:
   - Amount (€)
   - Category
   - Date
   - Description
   - Family member name
4. Click **"Save Expense"**

### Managing Categories (Admin Only)
1. Login as **Harish**
2. Click **"Categories"** button
3. Add new category or delete existing ones

### Viewing Reports (All Users)
- Dashboard shows automatic calculations
- Filter expenses by category, member, or date
- View category breakdown chart
- Check remaining balance vs salary

### Switching Users
1. Click **"Logout"** button
2. Select different user from login page

## 💾 Backup & Restore Data

### Backup
1. Press **F12** (Developer Tools)
2. Go to **Application/Storage** tab
3. Find **localStorage** → familyExpenseData
4. Copy the value and save to text file

### Restore
1. Press **F12** (Developer Tools)
2. Go to **Console** tab
3. Paste: `localStorage.setItem('familyExpenseData', 'YOUR_BACKUP_HERE')`
4. Refresh page

## 🌐 Browser Compatibility

Works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

## 📱 Mobile Friendly

Fully responsive design works on:
- Desktop computers
- Laptops
- Tablets
- Mobile phones

## 🔒 Privacy & Security

- No internet connection required after first load
- All data stays on your device
- No external servers
- No data collection
- No tracking

## 💡 Tips

### For Families
- **Admin (Harish)**: Main account holder, manages everything
- **Contributor (Bhavani)**: Spouse/partner who can add expenses
- **Guest**: Kids or family members who just view reports

### Monthly Planning
1. Set salary at start of month
2. Track expenses throughout month
3. Monitor remaining balance
4. Adjust spending if over budget

### Categories Customization
- Add categories that match your spending habits
- Examples: "Internet", "Insurance", "Healthcare", "Education"
- Keep categories simple and consistent

### Multiple Devices
- Each device has separate data (localStorage is local)
- To sync: backup from one device, restore to another
- Or place file in shared cloud folder (Dropbox/Google Drive)

## 📊 Sample Usage Scenario

```
Month: November 2025
Salary: €2700

Expenses:
- Rent: €1000 (Harish)
- Electricity: €130 (Bhavani)
- Groceries: €250 (Harish)
- Transport: €180 (Bhavani)
- Entertainment: €90 (Harish)

Total Spent: €1650 (61% of salary)
Remaining: €1050
Status: ✓ Looking good
```

## 🛠 Technical Details

- **Size**: 65KB single HTML file
- **Dependencies**: Font Awesome (CDN), Google Fonts (CDN)
- **Storage**: Browser localStorage (~5-10MB available)
- **Technology**: Pure HTML5, CSS3, Vanilla JavaScript
- **No framework**: No React, Vue, Angular needed
- **No backend**: No server, database, or API required

## ❓ FAQ

**Q: Can I add more users?**
A: Yes! Edit the HTML file and add to the `users` object in JavaScript.

**Q: Can I change user passwords?**
A: This is a simple demo. For password protection, you'd need to add authentication code.

**Q: What if I lose my data?**
A: Always backup your localStorage data. Clear browser cache also clears data.

**Q: Can multiple people use this together?**
A: Each browser has separate data. For family use, share one device or sync via backup/restore.

**Q: How do I deploy to a website?**
A: Upload `index.html` to any web hosting. It will work immediately!

## 📝 License

Free to use for personal and family expense tracking.

---

**Perfect for:**
- Family budget management
- Household expense tracking
- Monthly salary planning
- Multi-user expense monitoring
- Offline expense tracking
