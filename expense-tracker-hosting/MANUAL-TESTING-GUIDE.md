# 🧪 Manual Testing Guide - Secure Authentication System

## Overview
This guide will help you manually test the security implementation of your Family Expense Tracker to ensure everything is working correctly.

---

## Prerequisites
- Upload all files to your web hosting
- Set `data.json` permissions to 666
- Ensure PHP is enabled on your server
- Have access to browser developer tools (F12)

---

## Test Suite

### Test 1: ✅ Verify PINs Are Hidden from Source Code

**Objective**: Confirm that PINs are NOT visible in page source

**Steps**:
1. Open `index.html` in your browser
2. Right-click → "View Page Source" (or press Ctrl+U)
3. Search for "1234", "5678", or "0000" in the source code
4. Also search for "pin:" in the source code

**Expected Result**: 
- ❌ You should NOT find any actual PIN numbers in plain text
- ✅ You should see "🔒 Secure PIN Required" instead
- ✅ No hardcoded passwords in JavaScript

**Pass Criteria**: No PINs visible in source code

---

### Test 2: ✅ Test Successful Login

**Objective**: Verify that correct PINs allow login

**Steps**:
1. Open `index.html`
2. Click on "Harish" user card
3. Enter PIN: `1234`
4. Click "Login"

**Expected Result**:
- ✅ Login successful message appears
- ✅ Redirected to main dashboard
- ✅ "Welcome back, Harish!" notification shown
- ✅ User name "Harish" displayed in header

**Pass Criteria**: Successful login with correct PIN

---

### Test 3: ❌ Test Failed Login (Wrong PIN)

**Objective**: Verify that incorrect PINs are rejected

**Steps**:
1. Open `index.html`
2. Click on "Bhavani" user card
3. Enter wrong PIN: `9999`
4. Click "Login"

**Expected Result**:
- ❌ Error message: "Invalid PIN. X attempts remaining."
- ✅ PIN input fields cleared
- ✅ User remains on login page
- ✅ Remaining attempts count decreases

**Pass Criteria**: Login rejected with error message

---

### Test 4: 🔒 Test Brute-Force Protection

**Objective**: Verify rate limiting after multiple failed attempts

**Steps**:
1. Open `index.html`
2. Click on "Guest" user card
3. Enter wrong PIN: `1111` → Click Login
4. Repeat 5 times with wrong PINs

**Expected Result** (after 5th attempt):
- 🔒 Error message: "Too many failed attempts. Account locked for 15 minutes."
- ⏰ Cannot login even with correct PIN
- ✅ Lockout message displayed

**Pass Criteria**: Account locked after 5 failed attempts

---

### Test 5: ⏱️ Test Session Persistence

**Objective**: Verify that sessions persist across page reloads

**Steps**:
1. Login as any user with correct PIN
2. Wait for dashboard to load
3. Press F5 or refresh the page
4. Observe behavior

**Expected Result**:
- ✅ User remains logged in after refresh
- ✅ Dashboard loads without asking for PIN again
- ✅ Session restored automatically

**Pass Criteria**: Session persists after page reload

---

### Test 6: 🚪 Test Logout Functionality

**Objective**: Verify that logout destroys the session

**Steps**:
1. Login as any user
2. Wait for dashboard to load
3. Click "Logout" button
4. Confirm logout in popup
5. Refresh the page

**Expected Result**:
- ✅ Redirected to login page
- ✅ "Logged out successfully" message shown
- ✅ Refreshing page shows login screen (not dashboard)
- ✅ Session properly destroyed

**Pass Criteria**: Logout successful and session destroyed

---

### Test 7: ⏰ Test Session Timeout

**Objective**: Verify that session expires after 30 minutes of inactivity

**Steps**:
1. Login as any user
2. Leave the browser tab open
3. Do not interact with the app for 30+ minutes
4. Try to perform an action (e.g., add expense)

**Expected Result**:
- ⏰ After 30 minutes, session expires
- ✅ User prompted to login again
- ✅ Cannot perform actions without re-authentication

**Pass Criteria**: Session expires after 30 minutes

---

### Test 8: 👥 Test User Permissions

**Objective**: Verify that different users have different permissions

**Test 8A - Admin (Harish)**:
1. Login as Harish (PIN: 1234)
2. Check available buttons

**Expected Result**:
- ✅ "Add Expense" button enabled
- ✅ "Categories" button enabled
- ✅ "Salary" button enabled
- ✅ "Recurring" button enabled
- ✅ Can edit and delete expenses

**Test 8B - Contributor (Bhavani)**:
1. Logout and login as Bhavani (PIN: 5678)
2. Check available buttons

**Expected Result**:
- ✅ "Add Expense" button enabled
- ❌ "Categories" button disabled
- ❌ "Salary" button disabled
- ❌ "Recurring" button disabled
- ❌ Cannot edit or delete expenses (Actions column hidden)

**Test 8C - Viewer (Guest)**:
1. Logout and login as Guest (PIN: 0000)
2. Check available buttons

**Expected Result**:
- ❌ ALL action buttons disabled
- ✅ Can only view data
- ❌ Cannot add, edit, or delete anything

**Pass Criteria**: Permissions correctly enforced for each role

---

### Test 9: 🔧 Test API Connectivity

**Objective**: Use the automated security test page

**Steps**:
1. Open `security-test.html` in your browser
2. Click "▶️ Run All Security Tests" button
3. Wait for all tests to complete
4. Review results

**Expected Result**:
- ✅ All 6 tests should pass
- ✅ Summary shows: "6 passed, 0 failed"
- ✅ Green checkmarks for each test

**Pass Criteria**: All automated tests pass

---

### Test 10: 🔍 Test Browser DevTools (Advanced)

**Objective**: Verify security in browser console

**Steps**:
1. Open `index.html`
2. Press F12 to open Developer Tools
3. Go to "Application" tab → "Cookies"
4. Look for PHP session cookie
5. Go to "Console" tab
6. Type: `document.cookie`

**Expected Result**:
- ✅ Session cookie exists with HttpOnly flag
- ✅ Cookie has SameSite=Strict
- ✅ Cannot access cookie via JavaScript (HttpOnly protection)
- ❌ No sensitive data in localStorage or sessionStorage

**Pass Criteria**: Session cookie properly secured

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot reach auth.php"
**Cause**: auth.php not uploaded or wrong location
**Solution**: 
- Upload auth.php to same folder as index.html
- Check file permissions (644 for PHP files)
- Verify PHP is enabled on your host

### Issue 2: Login always fails with correct PIN
**Cause**: User data not initialized
**Solution**:
- Delete `data.json` 
- Reload page - it will recreate with default users
- Try login again

### Issue 3: "Too many failed attempts" immediately
**Cause**: Previous test attempts stored
**Solution**:
- Delete `login_attempts.json` from server
- Wait 15 minutes for auto-reset
- Try login again

### Issue 4: Session doesn't persist
**Cause**: Cookies not being saved
**Solution**:
- Check if cookies are enabled in browser
- Verify .htaccess is active
- Check PHP session configuration

### Issue 5: Page shows errors
**Cause**: PHP errors or missing files
**Solution**:
- Check that ALL files are uploaded
- View browser console (F12) for errors
- Check server error logs

---

## 📊 Testing Checklist

Use this checklist to track your testing progress:

- [ ] Test 1: PINs hidden from source code ✅
- [ ] Test 2: Successful login works ✅
- [ ] Test 3: Failed login rejected ❌
- [ ] Test 4: Brute-force protection active 🔒
- [ ] Test 5: Session persists after reload ⏱️
- [ ] Test 6: Logout destroys session 🚪
- [ ] Test 7: Session timeout after 30 min ⏰
- [ ] Test 8A: Admin permissions work 👑
- [ ] Test 8B: Contributor permissions work 📝
- [ ] Test 8C: Viewer permissions work 👁️
- [ ] Test 9: Automated tests pass 🔧
- [ ] Test 10: Cookie security verified 🔍

---

## ✅ Final Verification

After completing all tests, verify:

1. **Security**: 
   - ✅ No PINs visible in page source
   - ✅ Passwords hashed in data.json
   - ✅ Rate limiting working

2. **Functionality**:
   - ✅ Login/logout working
   - ✅ Sessions persisting
   - ✅ Permissions enforced

3. **User Experience**:
   - ✅ Error messages clear
   - ✅ Login smooth and fast
   - ✅ Notifications working

---

## 🎯 Success Criteria

Your security implementation is **SUCCESSFUL** if:

✅ All 10 manual tests pass
✅ Automated security test shows 6/6 passed
✅ No PINs visible in source code
✅ Brute-force protection active
✅ Sessions working correctly
✅ User permissions enforced

---

## 📞 Need Help?

If tests are failing:
1. Check `SECURITY-IMPLEMENTATION.md` for detailed documentation
2. Review `TROUBLESHOOTING.md` for common issues
3. Verify all files are uploaded correctly
4. Check server PHP error logs

---

## 🎉 Congratulations!

If all tests pass, your Family Expense Tracker is now **SECURE** and ready for production use!

Remember:
- Change default PINs after deployment
- Use HTTPS in production
- Regularly backup your data.json
- Monitor login_attempts.json for suspicious activity

---

*Last Updated: Security Testing Guide v2.0*
