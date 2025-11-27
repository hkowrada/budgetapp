# PDF Manager Pro - User Guide

## Introduction

PDF Manager Pro is a powerful, client-side PDF management tool that allows you to compress, merge, and manage PDF files entirely in your browser. No server uploads, no privacy concerns - everything happens on your device.

## Getting Started

### Opening the Application

**Option 1: Development Mode**
```bash
cd /app/frontend
yarn start
```
Then open http://localhost:3000

**Option 2: Production Build (Standalone)**
1. Build the application: `yarn build`
2. Navigate to `/app/frontend/build/`
3. Double-click `index.html` to open in your browser

## Features Overview

### 1. File Upload

**Drag & Drop:**
- Drag PDF files from your computer and drop them into the upload zone
- Multiple files can be dropped at once

**Click to Browse:**
- Click anywhere in the upload zone
- Select one or more PDF files from your file system

**File Requirements:**
- Only PDF files (.pdf) are accepted
- Multiple files can be uploaded simultaneously
- File size: Recommended under 50MB for optimal performance

### 2. Compress PDFs

**How to Compress:**
1. Upload your PDF file(s)
2. Locate the file card in the file list
3. Click the "Compress" button on the file card
4. The compressed PDF will automatically download

**What Happens:**
- The PDF is optimized to reduce file size
- Original quality is maintained as much as possible
- Typical savings: 10-40% depending on the PDF content
- Progress indication shows during compression

### 3. Merge Multiple PDFs

**How to Merge:**
1. Upload 2 or more PDF files
2. Select files by checking the checkbox on each file card
3. The action panel shows "X / Y selected"
4. Click "Merge Selected" button
5. The merged PDF downloads automatically with filename `merged-[timestamp].pdf`

**Important Notes:**
- Files are merged in the order they were selected
- All pages from all selected PDFs are included
- The merged file combines all pages sequentially

### 4. Page Management

**Access Page Manager:**
1. Upload a PDF file
2. Click the "Page Manager" tab (appears after files are uploaded)

**Delete Specific Pages:**
1. Select a PDF from the dropdown menu
2. The page grid displays all pages with thumbnails
3. Click on pages you want to delete (they'll be marked with a red overlay)
4. Click "Delete Selected" to remove the pages
5. Modified PDF downloads automatically as `edited-[filename].pdf`

**Page Manager Features:**
- Visual page thumbnails (numbered 1, 2, 3, etc.)
- Select/deselect individual pages
- "Select All" / "Deselect All" buttons
- Cannot delete all pages (must keep at least one)
- Selected pages show red overlay with trash icon

### 5. File Management

**View File Information:**
Each file card displays:
- File name (truncated if too long, hover for full name)
- File size (in KB/MB)
- Number of pages (loaded after PDF is processed)
- Selection status badge

**Delete Files:**
- Click the trash icon button on any file card
- File is immediately removed from the list
- No confirmation required

**Clear All Files:**
- Click "Clear All" button in the action panel
- Removes all uploaded files at once
- Useful for starting fresh

### 6. Selection & Batch Operations

**Selecting Files:**
- Click the checkbox on each file card
- Selected files show:
  - Blue ring border around the card
  - "Selected" badge
  - Highlighted appearance

**Selection Counter:**
- Displays "X / Y selected" in the action panel
- Shows how many files are selected vs total files
- Updates in real-time as you select/deselect

## Interface Guide

### Header
- **Logo:** PDF Manager Pro with ocean blue/teal gradient
- **Tagline:** "Compress • Merge • Manage"
- **GitHub Icon:** Links to repository (optional)

### Upload Zone
- Large dashed border area
- Upload icon with gradient background
- Clear instructions for drag & drop or click
- Status indicators: "PDF files only" and "Multiple files supported"

### File List View
- Grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Each card shows file details and actions
- Hover effects for better interactivity
- Checkbox for selection

### Action Panel
- Appears when files are uploaded
- Shows selection count
- Merge and Clear All buttons
- Responsive layout (stacks on mobile)

### Page Manager
- Dropdown to select PDF file
- Grid of page thumbnails
- Bulk selection controls
- Delete confirmation via visual feedback

## Tips & Best Practices

### Performance Tips
1. **File Size:** Keep PDFs under 50MB for best performance
2. **Multiple Files:** Process 5-10 files at a time for merging
3. **Large Documents:** Page management works best with PDFs under 100 pages
4. **Browser:** Use modern browsers (Chrome, Firefox, Safari, Edge)

### Compression Tips
1. **Already Compressed PDFs:** May not compress much further
2. **Image-Heavy PDFs:** Typically compress better
3. **Text-Only PDFs:** May not show significant size reduction
4. **Save Original:** Compression is non-reversible, keep your original

### Merging Tips
1. **Order Matters:** Files merge in selection order
2. **Check Pages:** Verify page count before merging
3. **File Names:** Merged file gets automatic timestamp
4. **Preview:** No preview available, download to view

### Page Deletion Tips
1. **Preview First:** Page numbers shown but no visual preview
2. **Cannot Undo:** Operation is immediate and non-reversible
3. **Multiple Pages:** Select all unwanted pages at once
4. **Keep One:** Must keep at least one page in the PDF

## Keyboard Shortcuts

Currently, the application is mouse/touch optimized. Keyboard shortcuts may be added in future versions.

## Privacy & Security

**100% Client-Side Processing:**
- All operations happen in your browser
- No files are uploaded to any server
- No data leaves your device
- Works offline (after initial load)

**Data Storage:**
- Files are temporarily stored in browser memory
- Cleared when you close the tab/browser
- No permanent storage on your device
- No tracking or analytics

## Troubleshooting

### "File not loading" Error
- **Solution:** File may be corrupted, try another PDF
- **Check:** Ensure file is a valid PDF format

### Compression Shows Minimal Savings
- **Reason:** PDF may already be optimized
- **Try:** Different PDFs may compress better

### Merge Button Disabled
- **Check:** Select at least 2 files
- **Verify:** Files have loaded successfully (page count shown)

### Page Manager Not Showing Pages
- **Wait:** Large PDFs take time to load
- **Check:** File is valid PDF with accessible pages

### Browser Freezes During Operation
- **Reason:** File too large or too many files
- **Solution:** Process fewer/smaller files at a time
- **Refresh:** Reload page and try again with smaller files

## Browser Compatibility

### Fully Supported
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### Mobile Browsers
- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Samsung Internet
- ⚠️ Some features may be slower on mobile

## FAQ

**Q: Can I use this offline?**
A: Yes! Once loaded, the app works completely offline.

**Q: Is there a file size limit?**
A: No hard limit, but files over 50MB may be slow to process.

**Q: Can I undo an operation?**
A: No, all operations are immediate and non-reversible. Keep originals!

**Q: Why is compression slow?**
A: Large files take time to process. Browser-based compression is slower than desktop software.

**Q: Can I merge more than 10 files?**
A: Yes, but consider performance. Merging many files may take time.

**Q: Does this work on phone/tablet?**
A: Yes! Fully responsive and works on all devices.

**Q: Do you collect my files?**
A: No! Everything happens locally in your browser. Zero uploads.

**Q: Can I save projects?**
A: No, files are cleared when you close the tab. Download your results!

## Support & Feedback

Built with ❤️ using:
- React for UI
- pdf-lib for PDF operations
- Tailwind CSS for styling
- Shadcn/UI for components

---

**Made with Emergent AI Platform**
