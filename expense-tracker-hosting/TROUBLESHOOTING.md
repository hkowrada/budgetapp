# Troubleshooting Guide - Expense Tracker

## 🚨 Error: "Failed to fetch"

### What This Means:
The browser cannot reach `api.php` at all.

### Common Causes & Fixes:

#### 1. api.php Not Uploaded
**Symptoms:** 404 error, "file not found"

**Fix:**
1. Check if `api.php` exists in File Manager
2. If missing, upload `api.php`
3. Make sure it's in the SAME folder as `index.html`
4. Refresh your browser

#### 2. Wrong File Permissions
**Symptoms:** 403 error, "forbidden"

**Fix:**
1. Right-click `api.php` in File Manager
2. Permissions → Set to **644**
3. Right-click `data.json`
4. Permissions → Set to **666** (very important!)
5. Apply changes

#### 3. PHP Not Enabled
**Symptoms:** api.php downloads instead of executing

**Fix:**
1. Visit: `https://yourdomain.com/check.php`
2. If it downloads → Contact hosting support
3. Ask: "Please enable PHP for my domain"

#### 4. Files in Wrong Folder
**Symptoms:** "Failed to fetch", blank page

**Fix:**
1. All files must be in SAME folder:
   - index.html
   - api.php
   - data.json
   - .htaccess
2. Usually this is: `public_html/` or `www/`
3. NOT in subdirectories

---

## 🚨 Error: "Cannot write to data.json"

### What This Means:
PHP can read but cannot save data.

### Fix:
1. File Manager → Find `data.json`
2. Right-click → Permissions
3. Enter: **666**
4. Or check all boxes for Read + Write
5. Click Apply/Save
6. Refresh browser

### Verify Fix:
1. Go to: `https://yourdomain.com/check.php`
2. Should show: "data.json writable: ✅ Yes"

---

## 🚨 Error: "Data file is not readable"

### What This Means:
data.json exists but PHP cannot read it.

### Fix:
1. Check if `data.json` exists
2. Check permissions (should be 666)
3. Check file ownership (should match PHP user)
4. Try deleting and re-uploading `data.json`

---

## 🚨 Categories Not Working

### Likely Cause:
Data not saving (permission issue)

### Fix:
1. Set `data.json` permissions to **666**
2. Run: `https://yourdomain.com/test.html`
3. Fix any failed tests
4. Refresh app

---

## 🚨 Nothing Saves / Blank Page

### Causes & Fixes:

#### Issue: PHP Error
**Fix:**
1. Check PHP error logs in hosting panel
2. Look for syntax errors in api.php
3. Re-upload api.php if corrupted

#### Issue: Permissions
**Fix:**
```
File          Permissions
--------------------------
api.php       644
data.json     666 (MUST!)
.htaccess     644
index.html    644
```

#### Issue: Invalid JSON
**Fix:**
1. Download `data.json`
2. Check if it's valid JSON
3. If corrupted, delete and let api.php recreate it

---

## 🔧 Diagnostic Tools

### 1. Check if PHP Works:
```
Visit: https://yourdomain.com/check.php
```
Shows: PHP version, file status, permissions

### 2. Run Full Tests:
```
Visit: https://yourdomain.com/test.html
```
Shows: Detailed test results with fix instructions

### 3. Test API Directly:
```
Visit: https://yourdomain.com/api.php
```
Should show: JSON data with categories and expenses

### 4. Browser Console:
```
Press F12 → Console tab
Look for red errors
```
Shows: Exact error messages from JavaScript

---

## 📋 Step-by-Step Fix Guide

### If NOTHING is working:

**Step 1: Verify Files**
```
□ index.html uploaded
□ api.php uploaded
□ data.json uploaded
□ .htaccess uploaded
□ All in same folder (public_html or www)
```

**Step 2: Check PHP**
```
1. Visit: https://yourdomain.com/check.php
2. Should show "✅ PHP is Working!"
3. If not → Contact hosting support
```

**Step 3: Set Permissions**
```
1. Right-click data.json
2. Permissions → 666
3. Apply
```

**Step 4: Run Tests**
```
1. Visit: https://yourdomain.com/test.html
2. Click "Run All Tests"
3. Fix any failures shown
```

**Step 5: Clear Cache**
```
1. Ctrl+Shift+Delete (Windows)
2. Cmd+Shift+Delete (Mac)
3. Clear browsing data
4. Refresh page (Ctrl+F5)
```

**Step 6: Test App**
```
1. Visit: https://yourdomain.com/index.html
2. Login (Harish: 1234)
3. Try to add expense
4. Refresh page
5. Expense should still be there
```

---

## 🆘 Still Not Working?

### Collect This Information:

1. **What error do you see?**
   - Exact error message
   - Screenshot if possible

2. **What did test.html show?**
   - Which tests passed/failed
   - Error messages

3. **Browser console errors:**
   - Press F12
   - Console tab
   - Copy any red errors

4. **Hosting Information:**
   - Hosting provider name
   - PHP version (from check.php)
   - Plan type

### Contact Support With:
1. All information above
2. URL to your test.html
3. URL to your check.php
4. Screenshots of errors

---

## 💡 Common Mistakes

### Mistake 1: Permissions Not Set
```
❌ data.json has 644 permissions
✅ data.json must have 666 permissions
```

### Mistake 2: Files in Subdirectory
```
❌ public_html/expenses/index.html
   public_html/api.php  ← Wrong location!
   
✅ public_html/index.html
   public_html/api.php  ← Correct!
```

### Mistake 3: Using HTTP Instead of HTTPS
```
❌ http://yourdomain.com/  ← Mixed content error
✅ https://yourdomain.com/ ← Secure
```

### Mistake 4: Cached Old Version
```
❌ Just refreshing (F5)
✅ Hard refresh (Ctrl+F5 or Ctrl+Shift+R)
```

### Mistake 5: Wrong PHP Version
```
❌ PHP 5.6 or older
✅ PHP 7.4 or newer
```

---

## 🎯 Quick Reference

### File Permissions:
```
api.php      : 644
data.json    : 666 ← CRITICAL!
.htaccess    : 644
index.html   : 644
check.php    : 644
test.html    : 644
```

### Test URLs:
```
Check PHP : https://yourdomain.com/check.php
Run Tests : https://yourdomain.com/test.html
Test API  : https://yourdomain.com/api.php
Main App  : https://yourdomain.com/index.html
```

### Required Files:
```
✓ index.html  (Main app)
✓ api.php     (Backend)
✓ data.json   (Storage)
✓ .htaccess   (Security)
+ check.php   (PHP test - optional)
+ test.html   (Diagnostics - optional)
```

---

## 📞 Getting Help

### From Hosting:
"My PHP script cannot write to data.json. Please help me set file permissions to 666."

### From Support:
1. Show test.html results
2. Show check.php results
3. Provide error messages
4. Share URLs (test.html, check.php)

---

## ✅ Success Checklist

After setup, verify:
- [ ] check.php shows "✅ PHP is Working!"
- [ ] check.php shows "data.json writable: ✅ Yes"
- [ ] test.html shows all tests passing
- [ ] api.php shows JSON when accessed directly
- [ ] Can login to index.html
- [ ] Can add expense
- [ ] Expense persists after refresh
- [ ] Same data in different browsers

Once all checked: **You're good to go!** 🎉

---

**Remember:** The most common issue is `data.json` permissions not set to 666!
