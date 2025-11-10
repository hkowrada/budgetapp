# Family Expense Tracker - Complete Edition

## 🚀 Quick Start

**Just double-click `index.html` - that's it!**

No installation, no server, no packages. Works 100% offline after first load.

---

## 🔐 Login with PIN

### Pre-configured Users:

| User | PIN | Role | Permissions |
|------|-----|------|-------------|
| **Harish** | `1234` | Admin | ✅ Full Access - Add, Edit, Delete, Categories, Salary, Recurring |
| **Bhavani** | `5678` | Contributor | ✅ Add expenses only |
| **Guest** | `0000` | Viewer | ✅ View reports only |

**Security:** PIN is required every time you login. Session ends when you logout or close browser.

---

## 💰 Monthly Salary Feature

Set different salary for each month:
- Default: **€2700**
- Dashboard automatically shows:
  - Monthly salary
  - Total expenses (current month only)
  - **Remaining balance** = Salary - Expenses
  - **Percentage spent** with visual progress bar
  - Status indicators:
    - ✓ **Looking good** (< 80% spent)
    - ⚡ **Running low** (80-99% spent)
    - ⚠️ **Over budget** (100%+ spent)

---

## 🔄 Recurring Expenses

Set up monthly bills that remind you automatically:

### Examples:
- Rent (due: 1st of month)
- Electricity (due: 15th of month)
- Internet (due: 20th of month)

### Features:
- **Due date notifications** - Badge shows # of bills due today
- **Quick pay** - Convert recurring expense to actual expense with 1 click
- **Active/Inactive** - Turn on/off without deleting
- **Visual status**:
  - 🟢 **Active** - Recurring is enabled
  - 🟡 **Due Soon** - Within 3 days
  - 🔴 **Due Today!** - Pay now
  - ⚫ **Inactive** - Paused

---

## ✨ Complete Features

### 1. **Expense Management**
- ✅ Add expenses
- ✅ Edit expenses (admin only)
- ✅ Delete expenses (admin only)
- ✅ Search by description, category, or member
- ✅ Filter by category, member, date range
- ✅ Sort by date (newest first)

### 2. **Dashboard Analytics**
- 💰 Monthly salary vs expenses
- 📊 Remaining balance
- 📈 Spending percentage
- 📉 Category breakdown chart
- 🎯 Budget alerts when approaching limit

### 3. **Data Management**
- 💾 **Export** - Download JSON backup file
- 📥 **Import** - Load data from JSON file
- 🔄 **Cross-device** - Export from one device, import on another
- 📱 **Cross-browser** - Works on any browser

### 4. **Smart Alerts**
- ⚠️ Budget exceeded warning
- ⚡ 80% budget warning
- 🔔 Recurring bills due today
- 💾 Auto-reminder to backup data (every 30 min)

### 5. **Search & Filter**
- 🔍 Real-time search
- 🎯 Filter by category
- 👤 Filter by family member
- 📅 Filter by date range
- ❌ Clear all filters button

---

## 📊 Data Storage

### ⚠️ IMPORTANT: Each Browser Has Separate Data

**Why do I see different data in Chrome vs Firefox?**
- Each browser stores data separately (Chrome, Firefox, Safari, Edge all have their own storage)
- This is normal browser behavior - data doesn't sync automatically
- **Solution:** Use one of the sync methods below

### Storage Methods:

**Option 1: Auto-Sync (Recommended)** ⭐
1. Click **"Setup Auto-Sync"** button
2. Select **"File-Based Sync"**
3. Choose a shared location:
   - Dropbox folder
   - Google Drive folder
   - USB drive
   - Network folder
4. Create/select file: `family-expenses.json`
5. Open app in other browsers and select THE SAME file
6. ✅ All browsers now use the same data!

**Option 2: Manual Export/Import**
- **Export** - Download JSON backup file
- **Import** - Load backup in other browser
- Repeat for each browser you use

**Option 3: Use One Browser Only**
- Pick your favorite browser (Chrome/Firefox/Safari/Edge)
- Only use that browser for expense tracking

### Data Structure:
```json
{
  \"categories\": [\"Rent\", \"Electricity\", ...],
  \"expenses\": [{
    \"id\": \"1699...\",
    \"amount\": 1000,
    \"category\": \"Rent\",
    \"date\": \"2025-11-10\",
    \"description\": \"Monthly rent\",
    \"member\": \"Harish\",
    \"addedBy\": \"Harish\",
    \"timestamp\": \"2025-11-10T15:30:00Z\"
  }],
  \"salaries\": {
    \"2025-11\": 2700,
    \"2025-12\": 2800
  },
  \"recurring\": [{
    \"id\": \"1699...\",
    \"name\": \"Monthly Rent\",
    \"amount\": 1000,
    \"category\": \"Rent\",
    \"member\": \"Harish\",
    \"dayOfMonth\": 1,
    \"active\": true
  }]
}
```

---

## 📖 How to Use

### First Time Setup
1. Download `index.html`
2. Double-click to open in browser
3. Select user (Harish, Bhavani, or Guest)
4. Enter PIN
5. Start tracking!

### Setting Monthly Salary (Admin Only)
1. Login as **Harish** (PIN: 1234)
2. Click **"Salary"** button
3. Enter amount (e.g., 2700)
4. Select month
5. Click **"Save Salary"**

### Adding Regular Expenses
1. Login as **Harish** or **Bhavani**
2. Click **"Add Expense"** button
3. Fill in:
   - Amount (€)
   - Category
   - Date
   - Description
   - Family member
4. Click **"Save Expense"**

### Setting Up Recurring Bills (Admin Only)
1. Login as **Harish**
2. Click **"Recurring"** button
3. Click **"Add Recurring Expense"**
4. Fill in:
   - Name (e.g., \"Monthly Rent\")
   - Amount (€1000)
   - Category (Rent)
   - Member (Harish)
   - Day of Month (1-31)
5. Click **"Save"**

### Paying Recurring Bills
1. Click **"Recurring"** button
2. Find the bill
3. Click **"Pay"** button
4. Expense automatically added to current month!

### Editing Expenses (Admin Only)
1. Find expense in table
2. Click **"Edit"** button (orange)
3. Update details
4. Click **"Save Expense"**

### Searching & Filtering
- **Search box** - Type to search description, category, or member
- **Category filter** - Select to show only that category
- **Member filter** - Select to show only that person's expenses
- **Date filters** - Select start/end dates
- **Clear button** - Reset all filters

### Exporting Data (Backup)
1. Click **"Export"** button
2. JSON file downloads automatically
3. Save this file safely!
4. **File name:** `family-expenses-2025-11-10.json`

### Importing Data (Restore/Transfer)
1. Click **"Import"** button
2. Select your backup JSON file
3. Confirm to replace current data
4. Data loaded!

**Use case:** Export on laptop → Import on phone to sync data

### Switching Users
1. Click **"Logout"** button
2. Select different user
3. Enter PIN

---

## 🎯 Sample Usage Scenario

```
👤 User: Harish (Admin)
📅 Month: November 2025
💰 Salary: €2700

📋 Recurring Bills Set Up:
✓ Rent - €1000 (Due: 1st)
✓ Electricity - €130 (Due: 15th)
✓ Internet - €45 (Due: 20th)

📝 Regular Expenses Added:
- Groceries: €250 (Harish)
- Transport: €180 (Bhavani)
- Entertainment: €90 (Harish)

💳 Total Spent: €1695 (62.8% of salary)
💰 Remaining: €1005
✅ Status: Looking good

🔔 Notifications:
- Nov 1: Rent due today! (€1000)
- Nov 15: Electricity due today! (€130)
- Nov 20: Internet due today! (€45)
```

---

## 🔒 Security & Privacy

### Local Data:
- ✅ All data stays on your device
- ✅ No internet connection needed after first load
- ✅ No external servers
- ✅ No data collection
- ✅ No tracking

### PIN Protection:
- ✅ 4-digit PIN required to login
- ✅ Session-based (logout required)
- ✅ Different PINs for each user

### Changing PINs:
Currently, PINs are hardcoded. To change:
1. Open `index.html` in text editor
2. Find this section:
```javascript
const users = {
    harish: { name: 'Harish', pin: '1234', ... },
    bhavani: { name: 'Bhavani', pin: '5678', ... },
    guest: { name: 'Guest', pin: '0000', ... }
};
```
3. Change PIN numbers
4. Save file

---

## 💾 Backup & Restore Guide

### Why Backup?
- Browser cache can be cleared
- Device can be lost/damaged
- Data is stored locally only

### When to Backup?
- ✅ After adding important data
- ✅ Before clearing browser cache
- ✅ Once a week (recommended)
- ✅ Before switching devices

### Backup Methods:

**Method 1: Export Button** (Recommended)
1. Click **"Export"** button
2. Save JSON file to:
   - Cloud storage (Dropbox, Google Drive)
   - Email to yourself
   - External USB drive
   - Multiple locations!

**Method 2: Manual Browser Storage**
1. Press F12 (Developer Tools)
2. Go to **Application** tab
3. Find **Local Storage** → familyExpenseData
4. Copy entire value
5. Save to text file

### Restore Data:

**Method 1: Import Button** (Recommended)
1. Click **"Import"** button
2. Select your backup JSON file
3. Confirm to restore

**Method 2: Manual**
1. Press F12
2. Console tab
3. Paste: `localStorage.setItem('familyExpenseData', 'PASTE_YOUR_BACKUP_HERE')`
4. Refresh page

---

## 📱 Device Compatibility

### Browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)
- ✅ Brave (latest)

### Devices:
- 💻 Desktop computers
- 💻 Laptops
- 📱 Tablets (iPad, Android)
- 📱 Mobile phones (iPhone, Android)

### Screen Sizes:
- Fully responsive design
- Optimized for all screen sizes
- Mobile-friendly forms
- Touch-friendly buttons

---

## 🎨 Customization

### Adding More Users:
1. Open `index.html` in text editor
2. Find the `users` object
3. Add new user:
```javascript
newuser: { 
    name: 'John', 
    pin: '9999', 
    role: 'contributor', 
    permissions: ['add'] 
}
```
4. Add login card in HTML section

### Changing Colors:
Find and modify CSS color codes:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your colors */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Changing Default Salary:
Line ~1940 in HTML:
```javascript
allData.salaries[currentMonth] = 2700; // Change this number
```

### Adding More Categories:
Default categories in code:
```javascript
categories: [\"Rent\", \"Electricity\", \"Groceries\", \"Transport\", \"Entertainment\"]
```
Or add through UI (Admin → Categories → Add)

---

## 🐛 Troubleshooting

### Issue: PIN not working
**Solution:** Check caps lock, refresh page, or check PIN in code

### Issue: Data disappeared
**Solution:** 
- Don't clear browser cache
- Check if imported wrong file
- Restore from backup

### Issue: Can't add expense
**Solution:**
- Check if logged in as Guest (read-only)
- Ensure all fields filled
- Check date format

### Issue: Import not working
**Solution:**
- Ensure JSON file is valid
- Check file wasn't corrupted
- Try exporting and re-importing

### Issue: Recurring not showing notifications
**Solution:**
- Check if recurring is set to \"Active\"
- Verify day of month is correct
- Refresh page to update notifications

---

## 💡 Tips & Best Practices

### For Families:
- **Admin (Harish):** Main account holder, manages everything
- **Contributor (Bhavani):** Spouse/partner adds expenses
- **Guest:** Kids/others view reports only

### Monthly Workflow:
1. **Start of month:** Set salary
2. **Setup recurring:** Add all monthly bills
3. **During month:** Add expenses as they occur
4. **Check dashboard:** Monitor remaining balance
5. **End of month:** Export data for records

### Category Best Practices:
- Keep categories simple
- Use consistent naming
- Examples: \"Healthcare\", \"Education\", \"Insurance\", \"Subscriptions\"
- Don't create too many categories (5-10 is good)

### Recurring Expenses:
- Set all monthly bills as recurring
- Review recurring list quarterly
- Deactivate instead of delete (keeps history)
- Use \"Pay\" button instead of manually adding

### Data Safety:
- ✅ Export weekly
- ✅ Save to multiple locations
- ✅ Test restore once
- ✅ Keep old backups (last 3 months)

---

## 🛠 Technical Details

**File Size:** 108KB (single HTML file)

**Dependencies:**
- Font Awesome 6.5.1 (CDN)
- Google Fonts: Space Grotesk, Inter (CDN)

**Storage:** Browser localStorage (~5-10MB available)

**Technology:**
- HTML5
- CSS3
- Vanilla JavaScript (No frameworks!)

**Features:**
- Responsive design (mobile-first)
- Animations & transitions
- Modal dialogs
- Real-time search
- Auto-save
- Session management

---

## 📋 Feature Comparison

| Feature | Free Version | This Version |
|---------|--------------|--------------|
| Add Expenses | ✅ | ✅ |
| PIN Login | ❌ | ✅ |
| Edit Expenses | ❌ | ✅ |
| Recurring Bills | ❌ | ✅ |
| Monthly Salary | ❌ | ✅ |
| Budget Alerts | ❌ | ✅ |
| Export/Import | ❌ | ✅ |
| Search | ❌ | ✅ |
| Multi-user | ❌ | ✅ |
| Due Date Reminders | ❌ | ✅ |

---

## ❓ FAQ

**Q: Do I need internet?**
A: Only for first load (fonts/icons). After that, 100% offline.

**Q: Can I use on multiple devices?**
A: Yes! Export from one device, import on another.

**Q: Is my data safe?**
A: Yes! Data never leaves your device. Use export for backups.

**Q: Can I add more than 3 users?**
A: Yes! Edit the HTML file to add more users.

**Q: What if I forget PIN?**
A: Check the HTML file or use default PINs listed in this README.

**Q: Can I change currency from € to $?**
A: Yes! Find \"€\" in HTML and replace with \"$\".

**Q: Will data sync automatically?**
A: No. Use Export/Import to manually sync between devices.

**Q: Can I print reports?**
A: Yes! Use browser's Print function (Ctrl+P / Cmd+P).

**Q: How long does data last?**
A: Forever (unless you clear browser cache). Regular backups recommended.

**Q: Can I use this for business?**
A: It's designed for families, but you can customize for business use.

---

## 🎓 Learning Resources

Want to understand or modify the code?

**Key Concepts:**
- HTML structure
- CSS styling & animations
- JavaScript functions
- localStorage API
- JSON data format
- Modal dialogs
- Form validation

**Code Sections:**
1. **Lines 1-1500:** CSS styling
2. **Lines 1500-2500:** HTML structure
3. **Lines 2500+:** JavaScript logic

---

## 📝 License

Free to use for personal and family expense tracking.

**Permissions:**
- ✅ Personal use
- ✅ Family use
- ✅ Modify for personal needs
- ✅ Share with friends/family

**Restrictions:**
- ❌ Commercial sale
- ❌ Remove credits
- ❌ Claim as your own creation

---

## 🎉 What's New in This Version?

✨ **NEW:** PIN-based login with 4-digit security
✨ **NEW:** Edit expense feature (admin only)
✨ **NEW:** Recurring expenses with due date reminders
✨ **NEW:** Export/Import data (JSON files)
✨ **NEW:** Real-time search functionality
✨ **NEW:** Budget alerts (80%, 100%+)
✨ **NEW:** Monthly salary management
✨ **NEW:** Quick pay for recurring bills
✨ **NEW:** Visual status indicators
✨ **NEW:** Auto-save reminders
✨ **NEW:** Session-based authentication
✨ **FIXED:** All bugs from previous version

---

## 📞 Support

**Having issues?**
- Check Troubleshooting section
- Review FAQ section
- Verify all form fields filled correctly
- Try clearing browser cache and re-importing data

**Want to add features?**
- Edit `index.html` in any text editor
- Modify JavaScript section (search for function names)
- Test thoroughly before using with real data

---

## 🚀 Quick Reference Card

```
LOGIN PINS:
Harish (Admin): 1234
Bhavani (Add only): 5678  
Guest (View only): 0000

QUICK ACTIONS:
Ctrl+F / Cmd+F: Search in page
F12: Developer tools
Ctrl+P / Cmd+P: Print

MAIN BUTTONS:
Add Expense: Add new transaction
Recurring: Manage monthly bills
Categories: Add/remove categories
Salary: Set monthly income
Export: Download backup (JSON)
Import: Load backup file
Logout: Exit current user

DATA FILES:
Export: family-expenses-YYYY-MM-DD.json
Location: Browser Downloads folder

BACKUP LOCATIONS:
✓ Cloud storage (Dropbox, Drive)
✓ Email to yourself
✓ USB drive
✓ Multiple devices
```

---

**Built with ❤️ for families who want simple expense tracking**

**Version:** 3.0 Complete Edition
**Last Updated:** November 2025

---
