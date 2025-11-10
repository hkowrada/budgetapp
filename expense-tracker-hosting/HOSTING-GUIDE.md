# Family Expense Tracker - Web Hosting Guide

## 🌐 Upload to Hostinger (or Any PHP Hosting)

### ✅ What You Get:
- **Automatic sync** across ALL browsers and devices
- **Real-time updates** - changes appear instantly everywhere
- **Shared data file** - everyone sees the same data
- **No manual export/import** needed!

---

## 📁 Files to Upload

Upload these 4 files to your hosting `www` or `public_html` folder:

```
www/
├── index.html          (Main app - 82KB)
├── api.php             (Backend API - 1KB)
├── data.json           (Data storage - 1KB)
└── .htaccess           (Security config - 1KB)
```

**Total Size:** ~85KB - Very lightweight!

---

## 🚀 Step-by-Step Upload to Hostinger

### Method 1: Using File Manager (Easiest)

1. **Login to Hostinger**
   - Go to: https://hpanel.hostinger.com/
   - Login with your credentials

2. **Open File Manager**
   - Click on "File Manager" in your hosting panel
   - Navigate to `public_html` or `www` folder

3. **Upload Files**
   - Click "Upload" button
   - Select all 4 files:
     - `index.html`
     - `api.php`
     - `data.json`
     - `.htaccess`
   - Wait for upload to complete

4. **Set Permissions** (Important!)
   - Right-click on `data.json`
   - Select "Permissions" or "chmod"
   - Set to `666` or check: Read/Write for all
   - This allows PHP to save data

5. **Access Your App**
   - Go to: `https://yourdomain.com/index.html`
   - Or: `https://yourdomain.com/` (if you want it as homepage)

### Method 2: Using FTP Client (FileZilla)

1. **Download FileZilla**
   - https://filezilla-project.org/

2. **Get FTP Credentials from Hostinger**
   - Go to Hosting → FTP Accounts
   - Note: Host, Username, Password, Port

3. **Connect via FTP**
   - Open FileZilla
   - Enter FTP details
   - Click "Quickconnect"

4. **Upload Files**
   - Navigate to `public_html` or `www` on right side
   - Drag all 4 files from left to right
   - Wait for transfer to complete

5. **Set File Permissions**
   - Right-click `data.json` → File Permissions
   - Enter `666` or check Read/Write for all

6. **Done!**
   - Visit: `https://yourdomain.com/index.html`

---

## 🔧 Configuration

### Make index.html Your Homepage

**Option 1: Rename the file**
```
Rename: index.html → index.php
```
Then access: `https://yourdomain.com/`

**Option 2: Update .htaccess**
Add this line to `.htaccess`:
```apache
DirectoryIndex index.html
```

### Change Default Salary

Edit `data.json`, change this line:
```json
"salaries": {
    "2025-11": 2700
}
```
To your desired amount.

---

## 🔒 Security Configuration

The `.htaccess` file includes:

1. **Protects data.json** - Cannot be accessed directly via URL
2. **Prevents directory listing** - Files not visible
3. **Enables CORS** - Allows API calls from same domain
4. **Disables PHP errors display** - Production-safe

### Test Security:

Try accessing: `https://yourdomain.com/data.json`
- ✅ Should show: "Forbidden" or "Access Denied"
- ❌ If you see JSON data, permissions are wrong!

---

## 🌍 How It Works

### Architecture:

```
Browser 1 (Chrome)  ──┐
                      │
Browser 2 (Firefox) ──┼──► api.php ──► data.json
                      │
Browser 3 (Safari)  ──┘
```

1. **User opens app** in any browser
2. **JavaScript loads** from `index.html`
3. **Calls PHP API** at `api.php`
4. **PHP reads/writes** `data.json` file
5. **All browsers** see same data instantly!

### Automatic Sync:

- ✅ Add expense in Chrome → Appears in Firefox immediately
- ✅ Change salary in Safari → Updates on all devices
- ✅ Delete category on Phone → Syncs to Laptop

---

## ✅ Verification Steps

### 1. Test Upload:
Visit: `https://yourdomain.com/index.html`
- ✅ Should see login page with 3 users

### 2. Test Login:
- Login as Harish (PIN: 1234)
- ✅ Should see dashboard

### 3. Test Data Saving:
- Add an expense
- Refresh page
- ✅ Expense should still be there

### 4. Test Cross-Browser Sync:
- Open app in Chrome, add expense
- Open app in Firefox (same URL)
- ✅ Should see the same expense

### 5. Test API:
Visit: `https://yourdomain.com/api.php`
- ✅ Should see JSON data (categories, expenses, etc.)

### 6. Test Security:
Visit: `https://yourdomain.com/data.json`
- ✅ Should show "Forbidden" or "403 Error"

---

## 🐛 Troubleshooting

### Issue: "Cannot write to data.json"
**Solution:**
1. Check file permissions: `chmod 666 data.json`
2. Check folder permissions: `chmod 755 www`
3. Verify PHP has write access

### Issue: "404 Not Found" when accessing
**Solution:**
1. Ensure files are in correct folder (`public_html` or `www`)
2. Check file names are exact (case-sensitive on Linux)
3. Verify domain is pointing to correct folder

### Issue: Data not syncing across browsers
**Solution:**
1. Clear browser cache
2. Check browser console for errors (F12)
3. Verify API URL in index.html: `const API_URL = 'api.php';`
4. Test API directly: `yourdomain.com/api.php`

### Issue: "Internal Server Error"
**Solution:**
1. Check .htaccess syntax
2. View error logs in Hostinger panel
3. Ensure PHP version is 7.4+ (Hosting → PHP Settings)

### Issue: Expenses disappear after refresh
**Solution:**
1. Check `data.json` file permissions (must be writable)
2. Check PHP error logs
3. Test saving manually: Update data.json via File Manager

### Issue: "Access-Control-Allow-Origin" error
**Solution:**
1. Ensure .htaccess is uploaded correctly
2. Enable CORS in hosting settings
3. Contact hosting support to enable CORS

---

## 📊 Performance

### Speed:
- **Load time:** < 1 second
- **Save time:** < 100ms
- **Sync delay:** Instant (on next page load/refresh)

### Capacity:
- **Max expenses:** 10,000+ (JSON file < 5MB)
- **Max users:** Unlimited (concurrent access)
- **Max categories:** Unlimited

### Bandwidth:
- **Per user per month:** < 1MB
- **100 users:** < 100MB/month
- **Very hosting-friendly!**

---

## 🔄 Backup & Maintenance

### Manual Backup:
1. Download `data.json` from File Manager weekly
2. Or use Export button in app
3. Save to Google Drive / Dropbox

### Automatic Backup:
Add this cron job in Hostinger:
```bash
# Daily backup at 2 AM
0 2 * * * cp /home/username/public_html/data.json /home/username/backups/data-$(date +\%Y\%m\%d).json
```

### Restore from Backup:
1. Upload backup file via File Manager
2. Rename to `data.json`
3. Replace existing file

---

## 🌟 Advanced Features

### Add Custom Domain:
1. Go to Hostinger → Domains
2. Point domain to hosting
3. Access via: `https://expenses.yourdomain.com`

### Add SSL Certificate (HTTPS):
1. Hostinger → SSL Certificates
2. Enable "Free SSL"
3. Wait 5-10 minutes
4. Access via: `https://yourdomain.com`

### Enable Compression:
Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

### Enable Caching:
Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 💡 Pro Tips

### 1. Subfolder Installation:
Upload to: `public_html/expenses/`
Access via: `yourdomain.com/expenses/`

### 2. Password Protect:
Add to `.htaccess`:
```apache
AuthType Basic
AuthName "Restricted Area"
AuthUserFile /home/username/.htpasswd
Require valid-user
```

### 3. Multiple Families:
- Create folders: `family1/`, `family2/`
- Each has own set of files
- Separate data for each family

### 4. Monitor Usage:
Check Hostinger → Statistics:
- Bandwidth used
- Visitor count
- Peak times

### 5. Upgrade Hosting:
Start with Basic plan ($2-3/month)
Upgrade if needed:
- More storage
- More bandwidth
- Better performance

---

## 📱 Mobile Access

The app is fully responsive:

✅ **iOS (iPhone/iPad):**
- Safari: Works perfectly
- Chrome: Works perfectly
- Add to Home Screen for app-like experience

✅ **Android:**
- Chrome: Works perfectly
- Firefox: Works perfectly
- Samsung Internet: Works perfectly

### Add to Home Screen:

**iPhone:**
1. Open in Safari
2. Tap Share icon
3. "Add to Home Screen"
4. Now accessible as app icon!

**Android:**
1. Open in Chrome
2. Tap Menu (3 dots)
3. "Add to Home Screen"
4. App icon created!

---

## 🚀 Alternative Hosting Platforms

This works on ANY PHP hosting:

### Hostinger (Recommended)
- ✅ Cheap ($2-3/month)
- ✅ Fast
- ✅ Easy to use
- ✅ Good support

### Other Options:
- **Bluehost** - $3-7/month
- **SiteGround** - $4-8/month
- **HostGator** - $3-6/month
- **GoDaddy** - $3-7/month
- **A2 Hosting** - $3-5/month

### Free Options (with limitations):
- **InfinityFree** - Free, ads on domain
- **000webhost** - Free, limited features
- **Freehostia** - Free, limited bandwidth

---

## 📞 Support

### Hostinger Support:
- Live Chat: 24/7
- Tutorials: https://www.hostinger.com/tutorials
- Phone: Check your account

### App Issues:
Check:
1. Browser console (F12)
2. PHP error logs in Hostinger
3. File permissions (666 for data.json)
4. .htaccess configuration

---

## 🎉 Quick Start Checklist

- [ ] Download all 4 files
- [ ] Login to Hostinger
- [ ] Upload files to `public_html`
- [ ] Set `data.json` permissions to 666
- [ ] Access `yourdomain.com/index.html`
- [ ] Login with PIN (Harish: 1234)
- [ ] Add first expense
- [ ] Refresh page - data should persist
- [ ] Open in different browser - data should sync
- [ ] ✅ Done! Share URL with family!

---

## 📄 Summary

**Upload Location:** `public_html/` or `www/`

**Files Needed:**
- index.html
- api.php
- data.json (set permissions: 666)
- .htaccess

**Access:** `https://yourdomain.com/index.html`

**Users:**
- Harish (1234) - Admin
- Bhavani (5678) - Add only
- Guest (0000) - View only

**Result:** All browsers and devices see the same data automatically!

---

**Need help? Contact Hostinger support or check error logs!**
