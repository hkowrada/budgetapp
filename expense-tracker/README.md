# Family Expense Tracker - Standalone Version

## Quick Start

**Just double-click `index.html` to start using the app!**

No installation, no server, no packages needed. Works completely offline in your browser.

## Features

✅ **Add/Delete Expenses** - Track amounts, categories, dates, descriptions, and family members
✅ **Dynamic Categories** - Add and delete expense categories on the fly
✅ **Dashboard Summary** - Total expenses, monthly totals, and statistics
✅ **Filter & Search** - Filter by category, member, and date range
✅ **Visual Charts** - Beautiful category breakdown charts
✅ **Browser Storage** - All data saved automatically in your browser (localStorage)
✅ **Offline Ready** - Works without internet connection
✅ **No Installation** - Pure HTML/CSS/JavaScript

## How to Use

### Setup
1. Download the `index.html` file
2. Double-click to open in any modern web browser
3. Start tracking expenses!

### Adding Expenses
1. Click "Add Expense" button
2. Fill in amount, category, date, description, and family member
3. Click "Save Expense"

### Managing Categories
1. Click "Manage Categories" button
2. Type new category name and click "Add"
3. Delete unwanted categories using the Delete button

### Filtering Data
- Use the filter dropdowns to filter by category or family member
- Select date range to view expenses within specific dates
- Click "Clear" to reset all filters

## Data Storage

All your expense data is stored in your browser's **localStorage**:
- Data persists even after closing the browser
- Data is stored locally on your computer
- No external servers or databases needed

### Backup Your Data
To backup your data:
1. Open browser Developer Tools (F12)
2. Go to Application/Storage tab
3. Find localStorage → familyExpenseData
4. Copy the value and save it to a text file

### Restore Data
1. Open Developer Tools (F12)
2. Go to Console tab
3. Paste: `localStorage.setItem('familyExpenseData', 'YOUR_BACKUP_DATA_HERE')`
4. Refresh the page

## Browser Compatibility

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Opera (latest)

## Folder Structure for WWW

```
www/
└── index.html    (single file - that's it!)
```

You can place `index.html` anywhere:
- Desktop
- USB drive
- Web server www folder
- Dropbox/Google Drive
- Any folder on your computer

## Pre-loaded Categories

The app comes with these default categories:
- Rent
- Electricity
- Groceries
- Transport
- Entertainment

You can add or delete categories as needed.

## Tips

💡 **Share with family**: Copy the HTML file to family members - they can track expenses on their devices
💡 **Multiple devices**: Since data is stored locally, each device has its own data
💡 **Export option**: Use browser tools to copy/paste your data for backup
💡 **Print friendly**: You can print the dashboard directly from your browser

## Technical Details

- **Size**: ~30KB single HTML file
- **Dependencies**: Font Awesome (CDN), Google Fonts (CDN)
- **Storage**: Browser localStorage (typically 5-10MB available)
- **Privacy**: All data stays on your device

## No Internet Required

After the first load (to fetch fonts and icons from CDN), the app works completely offline. For 100% offline use, you can:
1. Download Font Awesome and Google Fonts
2. Embed them in the HTML file
3. Use without any internet connection

## Support

This is a standalone HTML file. No technical support needed - just open and use!

For customization, open the HTML file in any text editor and modify the code.

## License

Free to use for personal and family expense tracking.
