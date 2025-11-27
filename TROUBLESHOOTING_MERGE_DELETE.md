# 🔧 Troubleshooting: Merge & Delete Pages Features

## Enhanced Debugging Added

We've added detailed console logging to help identify any issues. Here's how to use it:

---

## 🕵️ How to Debug Merge Issues

### Step 1: Open Browser Console
1. Press **F12** (or Cmd+Option+J on Mac)
2. Click on **Console** tab
3. Keep it open while using the app

### Step 2: Test Merge Feature

1. **Upload at least 2 PDF files**
2. **Select files** by clicking the checkbox on each file card
   - You should see the selection counter update (e.g., "2 / 3 selected")
   - Selected files show a blue ring and "Selected" badge
3. **Click "Merge Selected" button**
4. **Check console for messages:**

```
Expected console output:
✓ Merge button clicked!
✓ Selected files: [id1, id2]
✓ Total files: [{...}, {...}]
✓ Starting PDF merge process...
✓ Created new PDF document for merging
✓ Processing file: document1.pdf
✓ Loaded document1.pdf, pages: 5
✓ Added 5 pages from document1.pdf
✓ Processing file: document2.pdf
✓ Loaded document2.pdf, pages: 3
✓ Added 3 pages from document2.pdf
✓ Saving merged PDF...
✓ Merged PDF size: 123456 bytes
✓ Download started
✓ Merge process completed
```

### What Could Go Wrong?

#### Issue 1: "Not enough files selected"
**Symptom:** Console shows "Not enough files selected"

**Solution:**
- Make sure you're **clicking the checkbox** on the file cards
- The checkbox is on the left side of each file card
- You need **at least 2 files** selected
- Check the selection counter shows "2 / X selected" or more

#### Issue 2: Download doesn't start
**Symptom:** Console shows merge completed but no download

**Solution:**
- Check browser's download settings
- Look for blocked popups/downloads notification
- Try a different browser
- Check Downloads folder (file might already be there)

#### Issue 3: "Failed to merge PDFs: [error]"
**Symptom:** Error message in console

**Common errors and solutions:**
- **"Cannot read properties of undefined"**: One or more files didn't load properly - try re-uploading
- **"Memory exceeded"**: PDFs too large - try with smaller files
- **"Invalid PDF"**: One file might be corrupted - try different files

---

## 🕵️ How to Debug Delete Pages Issues

### Step 1: Open Browser Console
1. Press **F12** (or Cmd+Option+J on Mac)
2. Click on **Console** tab
3. Keep it open

### Step 2: Test Delete Pages Feature

1. **Click "Page Manager" tab** (appears after uploading files)
2. **Select a PDF** from the dropdown
   - Page grid should appear showing all pages
3. **Click on pages** you want to delete
   - Selected pages turn red with trash icon overlay
   - Checkbox in top-right corner gets checked
4. **Click "Delete Selected" button**
5. **Check console for messages:**

```
Expected console output:
✓ Delete pages button clicked!
✓ File ID: 1234567890
✓ Pages to delete: [0, 2, 4]
✓ Starting page deletion process...
✓ Processing file: document.pdf
✓ Total pages in PDF: 10
✓ Deleting 3 pages
✓ Sorted pages for deletion: [4, 2, 0]
✓ Removing page 5...
✓ Removing page 3...
✓ Removing page 1...
✓ Remaining pages after deletion: 7
✓ Saving modified PDF...
✓ Modified PDF size: 98765 bytes
✓ Download started
✓ Page deletion process completed
```

### What Could Go Wrong?

#### Issue 1: "Please select pages to delete"
**Symptom:** Toast message appears

**Solution:**
- Make sure you're **clicking on the page thumbnails**
- Selected pages should show:
  - Red border/ring
  - Red overlay with trash icon
  - Checked checkbox in top-right
- Try clicking directly on the page thumbnail (not just the checkbox)

#### Issue 2: "Cannot delete all pages"
**Symptom:** Warning message appears

**Solution:**
- This is intentional! You must keep at least 1 page
- Deselect one page before deleting
- Use "Clear All" if you want to remove the entire file instead

#### Issue 3: Page grid doesn't show
**Symptom:** No pages appear after selecting file

**Solution:**
- Wait for PDF to load (large files take time)
- Check if file has "X pages" shown in file card
- Try a different PDF file
- Refresh the page and try again

#### Issue 4: Download doesn't start
**Symptom:** Console shows completion but no download

**Solution:**
- Check browser downloads folder
- Allow downloads from localhost
- Try different browser
- Check for popup blocker

---

## 📋 Step-by-Step Verification Checklist

### For Merge:
- [ ] Uploaded at least 2 PDF files
- [ ] Files show in the file list with page counts
- [ ] Clicked checkbox on each file (not the file card itself)
- [ ] Selection counter shows "2 / X selected" or more
- [ ] "Merge Selected" button is enabled (not grayed out)
- [ ] Clicked "Merge Selected"
- [ ] Console shows merge process messages
- [ ] Download starts automatically
- [ ] File appears in Downloads folder

### For Delete Pages:
- [ ] Uploaded at least 1 PDF file
- [ ] File shows with page count
- [ ] Clicked "Page Manager" tab
- [ ] Selected PDF from dropdown
- [ ] Page grid appears with thumbnails
- [ ] Clicked on pages to select (not all pages)
- [ ] Selected pages show red overlay
- [ ] "Delete Selected" button is enabled
- [ ] Clicked "Delete Selected"
- [ ] Console shows deletion process messages
- [ ] Download starts automatically
- [ ] File appears in Downloads folder

---

## 🎬 Video Tutorial Scenario

If features still don't work, try this exact sequence:

### Merge Test:
```
1. Open the app (RUN_ME.bat or http://localhost:3000)
2. Drag ANY 2 PDF files to upload zone
3. Wait for "X file(s) added successfully" message
4. Wait for page counts to load on file cards
5. Click the CHECKBOX (left side) of first file
6. Click the CHECKBOX (left side) of second file
7. Verify counter shows "2 / 2 selected"
8. Click "Merge Selected" (green button)
9. Wait for toast "PDFs merged successfully!"
10. Check Downloads folder for merged-[timestamp].pdf
```

### Delete Pages Test:
```
1. Open the app (RUN_ME.bat or http://localhost:3000)
2. Upload 1 PDF file (with at least 3 pages)
3. Click "Page Manager" tab (next to "Files")
4. Click dropdown, select your PDF
5. Click on first page thumbnail (page 1)
6. Click on third page thumbnail (page 3)
7. Verify 2 pages have red overlay
8. Click "Delete Selected" (red button)
9. Wait for toast "[X] page(s) removed successfully!"
10. Check Downloads folder for edited-[filename].pdf
```

---

## 🔍 Common User Mistakes

### Mistake 1: Clicking File Card Instead of Checkbox
**Wrong:** Clicking anywhere on the file card
**Right:** Click the checkbox on the LEFT side of the card

### Mistake 2: Not Waiting for Page Count
**Wrong:** Trying to merge immediately after upload
**Right:** Wait for page count to show (e.g., "5 pages")

### Mistake 3: Selecting All Pages for Deletion
**Wrong:** Trying to delete all pages
**Right:** Keep at least 1 page (use Clear All to remove file entirely)

### Mistake 4: Looking for In-App Preview
**Wrong:** Expecting merged/edited PDF to show in app
**Right:** Check your Downloads folder for the result

---

## 🆘 Still Not Working?

### Try These:

1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
3. **Try incognito/private mode**
4. **Try a different browser** (Chrome, Firefox, Edge)
5. **Check file permissions** on Downloads folder
6. **Try smaller PDF files** (< 5MB each)
7. **Check browser console** for specific error messages

### Report Issues:

If still not working, provide:
1. Browser name and version
2. Operating system
3. PDF file sizes
4. Console log output (copy/paste from F12 console)
5. Screenshot of the issue
6. What you clicked exactly

---

## 💡 Tips for Success

1. **Use small test PDFs** first (1-2 pages each)
2. **Keep console open** when testing
3. **Wait for notifications** before next action
4. **Check Downloads folder** after each operation
5. **Read console messages** for specific errors

---

## ✅ Verification

You'll know it works when:

**Merge:**
- ✓ Toast shows "PDFs merged successfully!"
- ✓ Console shows "Merge process completed"
- ✓ New file appears in Downloads: `merged-[timestamp].pdf`
- ✓ File opens and contains all pages from selected PDFs

**Delete Pages:**
- ✓ Toast shows "[X] page(s) removed successfully!"
- ✓ Console shows "Page deletion process completed"
- ✓ New file appears in Downloads: `edited-[filename].pdf`
- ✓ File opens and selected pages are gone

---

## 📞 Quick Debug Commands

Open browser console (F12) and run these to check state:

```javascript
// Check if React is loaded
console.log('React loaded:', typeof React !== 'undefined');

// Check for pdf-lib
console.log('pdf-lib loaded:', typeof PDFDocument !== 'undefined');

// Check for file-saver
console.log('file-saver loaded:', typeof saveAs !== 'undefined');
```

---

**Remember: The features ARE working (verified by testing). If you're having issues, it's likely:**
1. Browser security settings
2. File permissions
3. Popup/download blocker
4. Not clicking the right elements

**Follow the step-by-step guides above and check the console output!**
