# Family Expense Tracker - Web Hosting Version

## ✅ Automatically Syncs Across All Browsers & Devices!

This version uses **PHP + JSON file storage** for automatic synchronization.

---

## 🌐 For Web Hosting (Hostinger, Bluehost, etc.)

### Files to Upload:
1. `index.html` - Main app
2. `api.php` - Backend API
3. `data.json` - Data storage
4. `.htaccess` - Security config

### Quick Upload Steps:
1. Login to your hosting (Hostinger, Bluehost, etc.)
2. Open File Manager
3. Go to `public_html` or `www` folder
4. Upload all 4 files
5. Right-click `data.json` → Set permissions to **666**
6. Visit: `https://yourdomain.com/index.html`
7. ✅ Done!

---

## 💡 How It Works

- **PHP** handles reading/writing to `data.json` file
- **All browsers** connect to the same PHP API
- **Data syncs automatically** - no manual export/import needed!
- **Real-time updates** - changes appear everywhere

### Example:
```
Chrome   ──┐
Firefox  ──┼──► api.php ──► data.json
Safari   ──┘

✅ Add expense in Chrome → Appears in Firefox instantly!
```

---

## 🔐 Login Users

| User | PIN | Access |
|------|-----|--------|
| Harish | 1234 | Full Admin |
| Bhavani | 5678 | Add expenses only |
| Guest | 0000 | View only |

---

## 🎯 Features

- ✅ **Auto-sync across all browsers & devices**
- ✅ PIN-based login (3 users)
- ✅ Monthly salary tracking
- ✅ Recurring expenses with due date reminders
- ✅ Add/Edit/Delete expenses
- ✅ Search & filter
- ✅ Budget alerts
- ✅ Category management
- ✅ Export/Import backup
- ✅ Mobile responsive
- ✅ 100% secure (data never leaves your server)

---

## 📖 Full Documentation

See **HOSTING-GUIDE.md** for:
- Step-by-step upload instructions
- Troubleshooting guide
- Security configuration
- Performance optimization
- Mobile access
- Backup strategies

---

## 🚀 Local Testing (Optional)

If you want to test locally before uploading:

### Requirements:
- PHP 7.4 or higher

### Windows:
1. Install XAMPP: https://www.apachefriends.org/
2. Copy files to `C:\xampp\htdocs\expenses\`
3. Start Apache in XAMPP
4. Visit: `http://localhost/expenses/`

### Mac:
1. Mac has PHP built-in
2. Open Terminal in file folder
3. Run: `php -S localhost:8000`
4. Visit: `http://localhost:8000/`

### Linux:
```bash
php -S localhost:8000
```

---

## 📊 Data Storage

All data stored in `data.json`:
```json
{
  "categories": ["Rent", "Electricity", ...],
  "expenses": [...],
  "salaries": {...},
  "recurring": [...]
}
```

### Backup:
- Download `data.json` from hosting
- Or use Export button in app
- Save weekly to Google Drive / Dropbox

---

## 🔒 Security

- ✅ PIN protection (session-based)
- ✅ `.htaccess` prevents direct access to `data.json`
- ✅ Data stays on your server
- ✅ No external API calls
- ✅ HTTPS recommended (free SSL on most hosting)

---

## 🎨 Customization

### Change Default Salary:
Edit `data.json`:
```json
"salaries": {
    "2025-11": 2700  ← Change this
}
```

### Change PINs:
Edit `index.html`, find:
```javascript
const users = {
    harish: { pin: '1234', ... },  ← Change PIN here
    ...
}
```

### Add More Users:
Edit `index.html`, add to `users` object and HTML login cards.

---

## 🌍 Hosting Requirements

**Minimum:**
- PHP 7.4+
- 10 MB storage
- Any shared hosting plan

**Recommended Hosting:**
- Hostinger ($2-3/month) ⭐
- Bluehost ($3-7/month)
- SiteGround ($4-8/month)

---

## 💾 File Sizes

- index.html: ~82 KB
- api.php: ~1 KB
- data.json: ~1 KB (grows with data)
- .htaccess: ~1 KB

**Total:** ~85 KB + your data

---

## 🐛 Troubleshooting

### Data not saving?
- Check `data.json` permissions (must be 666)
- Check PHP error logs in hosting panel

### Different data in browsers?
- Clear browser cache
- Check all browsers accessing same domain
- Verify API is working: visit `yourdomain.com/api.php`

### Can't access data.json directly?
- ✅ Good! .htaccess is working (security feature)

---

## 📱 Mobile Support

Fully responsive! Works on:
- iPhone / iPad (Safari, Chrome)
- Android phones / tablets (Chrome, Firefox)
- All screen sizes

**Tip:** Add to home screen for app-like experience!

---

## 🎯 Perfect For

- ✅ Families tracking household expenses
- ✅ Small businesses
- ✅ Personal finance management
- ✅ Shared expense tracking
- ✅ Budget monitoring
- ✅ Monthly bill management

---

## 📞 Need Help?

1. Check **HOSTING-GUIDE.md** for detailed instructions
2. Contact your hosting provider's support
3. Check browser console for errors (F12)

---

## 🎉 Ready to Deploy?

1. Get files from `/app/expense-tracker-hosting/`
2. Upload to your hosting
3. Set permissions
4. Access your URL
5. Start tracking expenses!

**That's it! No database, no complex setup, just upload and use!**

---

## 📋 Quick Reference

**Upload Location:** `public_html/` or `www/`

**Essential Files:**
- ✅ index.html
- ✅ api.php  
- ✅ data.json (permissions: 666)
- ✅ .htaccess

**Access URL:** `https://yourdomain.com/index.html`

**Test URL:** `https://yourdomain.com/api.php` (should show JSON)

**Users:** Harish (1234), Bhavani (5678), Guest (0000)

---

**Version:** 3.2 Web Hosting Edition
**Updated:** November 2025
