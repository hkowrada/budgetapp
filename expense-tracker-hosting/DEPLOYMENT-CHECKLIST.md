# 🚀 Deployment Checklist - Secure Version 2.0

## Pre-Deployment Checklist

### 📦 Files to Upload
Ensure all these files are uploaded to your web hosting:

**Required Files**:
- [ ] `index.html` (115 KB) - Main application
- [ ] `api.php` (3.5 KB) - Data management API  
- [ ] `auth.php` (8.6 KB) - Authentication API ⭐ NEW
- [ ] `data.json` (180 bytes) - Database file
- [ ] `.htaccess` (1.0 KB) - Security configuration ⭐ NEW

**Documentation Files** (Optional but recommended):
- [ ] `README.md` - Project overview
- [ ] `SECURITY-IMPLEMENTATION.md` ⭐ NEW - Security documentation
- [ ] `MANUAL-TESTING-GUIDE.md` ⭐ NEW - Testing instructions
- [ ] `HOSTING-GUIDE.md` - Deployment guide
- [ ] `TROUBLESHOOTING.md` - Common issues
- [ ] `QUICK-START.txt` - Quick reference

**Testing Files** (Optional):
- [ ] `security-test.html` ⭐ NEW - Automated security tests
- [ ] `test.html` - Environment diagnostic
- [ ] `check.php` - PHP environment check

---

## 🔧 Configuration Steps

### Step 1: Upload Files
1. [ ] Connect to your web hosting via FTP/File Manager
2. [ ] Upload all files to public_html (or your domain folder)
3. [ ] Verify all files uploaded successfully

### Step 2: Set File Permissions
1. [ ] `data.json` → Set to **666** (read/write for all)
2. [ ] `index.html` → Set to **644** (default)
3. [ ] `api.php` → Set to **644** (default)
4. [ ] `auth.php` → Set to **644** (default) ⭐
5. [ ] `.htaccess` → Set to **644** (default) ⭐

**How to set permissions**:
- In cPanel File Manager: Right-click file → Permissions
- Via FTP: Right-click file → File Attributes
- Command line: `chmod 666 data.json`

### Step 3: Verify PHP Configuration
1. [ ] Open `check.php` in your browser
2. [ ] Verify PHP version is 7.4+ (8.0+ recommended)
3. [ ] Check that `password_hash` function is available
4. [ ] Verify sessions are enabled

### Step 4: Initialize Application
1. [ ] Open `index.html` in your browser
2. [ ] You should see the login page
3. [ ] User data will auto-initialize on first auth.php call

---

## 🔒 Security Verification

### Verify Security Implementation
1. [ ] Open `index.html` in browser
2. [ ] Right-click → View Page Source
3. [ ] Search for "1234", "5678", "0000"
4. [ ] **CONFIRM**: No PINs found in source code ✅
5. [ ] Search for "pin:"
6. [ ] **CONFIRM**: No hardcoded passwords ✅

### Run Security Tests
1. [ ] Open `security-test.html` in browser
2. [ ] Click "Run All Security Tests"
3. [ ] **EXPECTED**: All 6 tests pass ✅
4. [ ] If any test fails, check troubleshooting guide

### Test Login Functionality
1. [ ] Click on "Harish" user
2. [ ] Enter PIN: `1234`
3. [ ] **EXPECTED**: Successful login ✅
4. [ ] **EXPECTED**: Dashboard loads ✅
5. [ ] **EXPECTED**: Welcome message shown ✅

### Test Brute-Force Protection
1. [ ] Logout from application
2. [ ] Select any user
3. [ ] Enter wrong PIN 5 times
4. [ ] **EXPECTED**: Account locked message ✅
5. [ ] **EXPECTED**: Cannot login for 15 minutes ✅

---

## 🧪 Manual Testing

Follow the comprehensive testing guide:
1. [ ] Open `MANUAL-TESTING-GUIDE.md`
2. [ ] Complete all 10 manual tests
3. [ ] Mark each test as passed/failed
4. [ ] Verify all tests pass before going live

---

## 🔐 Post-Deployment Security

### Change Default PINs
**CRITICAL**: Change default PINs immediately after deployment!

**Current Default PINs**:
- Harish: `1234`
- Bhavani: `5678`
- Guest: `0000`

**How to Change PINs**:
1. Download `data.json` from server
2. Generate new hash for each user:
   ```php
   <?php echo password_hash('NEW_PIN_HERE', PASSWORD_BCRYPT); ?>
   ```
3. Replace password hash in data.json
4. Upload modified data.json
5. Test new PINs

### Enable HTTPS (Recommended)
1. [ ] Obtain SSL certificate (Let's Encrypt is free)
2. [ ] Install SSL on your domain
3. [ ] Edit `.htaccess` - uncomment HSTS header:
   ```apache
   Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
   ```
4. [ ] Force HTTPS redirect by adding to .htaccess:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

### Backup Original Data
1. [ ] Create backup folder on server
2. [ ] Copy `data.json` to backup folder
3. [ ] Set up automatic daily backups (if available)

---

## 📊 Monitoring & Maintenance

### Regular Checks
**Weekly**:
- [ ] Check `login_attempts.json` for suspicious activity
- [ ] Backup `data.json`
- [ ] Test login functionality

**Monthly**:
- [ ] Review user permissions
- [ ] Check for PHP/server updates
- [ ] Test all security features

### Monitor Failed Login Attempts
1. Download `login_attempts.json` periodically
2. Look for:
   - High number of failed attempts (potential attack)
   - Unusual usernames (brute-force attempts)
   - Patterns indicating automated attacks

### If Suspicious Activity Detected
1. [ ] Review `login_attempts.json`
2. [ ] Change all user PINs immediately
3. [ ] Delete `login_attempts.json` to reset
4. [ ] Consider increasing lockout time in `auth.php`
5. [ ] Enable IP blocking if available

---

## 🆘 Troubleshooting Deployment

### Issue: 500 Internal Server Error
**Causes**:
- Wrong file permissions
- .htaccess syntax error
- PHP version incompatibility

**Solutions**:
1. [ ] Check file permissions (data.json = 666)
2. [ ] Temporarily rename .htaccess to test
3. [ ] Check server error logs
4. [ ] Verify PHP version (7.4+)

### Issue: "Cannot reach auth.php"
**Causes**:
- File not uploaded
- Wrong file location
- PHP not enabled

**Solutions**:
1. [ ] Verify auth.php is uploaded
2. [ ] Check auth.php is in same folder as index.html
3. [ ] Open auth.php directly in browser (should show JSON)
4. [ ] Contact hosting support if PHP disabled

### Issue: Login always fails
**Causes**:
- Users not initialized
- data.json corrupted
- Permission issues

**Solutions**:
1. [ ] Delete entire `users` object from data.json
2. [ ] Reload page to reinitialize
3. [ ] Check data.json permissions (666)
4. [ ] Check browser console for errors

### Issue: .htaccess not working
**Causes**:
- Apache mod_rewrite disabled
- Server doesn't support .htaccess

**Solutions**:
1. [ ] Contact hosting support to enable mod_rewrite
2. [ ] Check if Apache server (not Nginx)
3. [ ] Test with minimal .htaccess
4. [ ] Application will still work without .htaccess (less secure)

---

## ✅ Final Verification Checklist

Before declaring deployment successful:

**Security** ✅:
- [ ] No PINs visible in page source
- [ ] All security tests pass
- [ ] Brute-force protection working
- [ ] Sessions persisting correctly
- [ ] HTTPS enabled (recommended)

**Functionality** ✅:
- [ ] Login/logout working
- [ ] All user roles have correct permissions
- [ ] Can add/edit/delete expenses (as admin)
- [ ] Data persists after page reload
- [ ] Export/import working

**Performance** ✅:
- [ ] Page loads in < 3 seconds
- [ ] Login response in < 2 seconds
- [ ] No console errors
- [ ] Mobile responsive

**Documentation** ✅:
- [ ] Users have access to user guide
- [ ] Default PINs documented
- [ ] Support contact information available

---

## 🎯 Success Criteria

Your deployment is **SUCCESSFUL** when:

✅ All files uploaded and configured correctly
✅ Security tests show 6/6 passed
✅ No PINs visible in source code
✅ Login/logout functioning properly
✅ Brute-force protection active
✅ All user roles working correctly
✅ Data persisting across sessions
✅ No console or PHP errors
✅ Mobile responsive design working

---

## 📞 Support Resources

If you need help:
1. Check `TROUBLESHOOTING.md` for common issues
2. Review `SECURITY-IMPLEMENTATION.md` for security details
3. Run `security-test.html` for diagnostics
4. Check server error logs (ask your hosting provider)
5. Review browser console (F12) for JavaScript errors

---

## 🎉 Congratulations!

If all checklist items are complete, your secure Family Expense Tracker is **LIVE** and ready to use!

**Remember**:
- 🔐 Change default PINs immediately
- 🔒 Use HTTPS in production
- 💾 Backup data regularly
- 👁️ Monitor login attempts
- 🔄 Keep system updated

---

## 📅 Deployment Log

Document your deployment for reference:

**Deployment Date**: _______________
**Hosting Provider**: _______________
**Domain/URL**: _______________
**PHP Version**: _______________
**SSL Enabled**: Yes [ ] No [ ]
**All Tests Passed**: Yes [ ] No [ ]
**Default PINs Changed**: Yes [ ] No [ ]

**Notes**:
_________________________________
_________________________________
_________________________________

---

*Version 2.0 - Secure Deployment*
*Last Updated: November 2024*
