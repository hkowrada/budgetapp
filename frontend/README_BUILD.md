# PDF Manager Pro - Build Instructions

## Overview
PDF Manager Pro is a comprehensive client-side PDF management application that allows you to compress, merge, delete pages, and manage multiple PDF files entirely in your browser.

## Features
- **Compress PDFs** - Reduce file size with smart compression
- **Merge Multiple PDFs** - Combine multiple PDF files into one
- **Page Management** - Delete unwanted pages from PDFs
- **Drag & Drop** - Easy file upload with drag and drop
- **Client-Side Processing** - All operations happen in your browser, no server needed

## Building for Standalone Use

### 1. Build the Production Version

```bash
cd /app/frontend
yarn build
```

This creates an optimized production build in the `build/` directory.

### 2. Make it Work Standalone

The build creates static HTML, CSS, and JavaScript files. To make it work as a double-click application:

#### Option A: Using the Build Folder Directly
1. After building, navigate to `/app/frontend/build/`
2. Open `index.html` in your web browser
3. The application will work entirely client-side

#### Option B: Create a Single HTML Package
For maximum portability, you can package everything into a single HTML file using inline assets.

Install the required tool:
```bash
npm install -g inline-source-cli
```

Then inline all assets:
```bash
cd /app/frontend/build
inline-source --root . index.html > pdf-manager-standalone.html
```

Now `pdf-manager-standalone.html` is a single file containing everything.

### 3. Double-Click to Run

Simply double-click `index.html` (or the standalone version) and it will open in your default browser.

## Technical Details

### Dependencies
- **pdf-lib** - PDF manipulation library
- **react-dropzone** - File upload handling
- **file-saver** - File download functionality
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

### File Size Limitations
The application processes PDFs entirely in the browser using JavaScript. Very large PDFs (>50MB) may take longer to process depending on your device's capabilities.

## Development

### Start Development Server
```bash
cd /app/frontend
yarn start
```

### Install Dependencies
```bash
cd /app/frontend
yarn install
```

## Usage Guide

1. **Upload Files**: Drag and drop PDF files or click to browse
2. **Select Files**: Check boxes to select multiple files for merging
3. **Compress**: Click "Compress" on any file to reduce its size
4. **Merge**: Select 2+ files and click "Merge Selected"
5. **Manage Pages**: Switch to "Page Manager" tab to delete specific pages
6. **Download**: All operations automatically download the result

## Privacy & Security

All PDF processing happens **entirely in your browser**. No files are uploaded to any server. Your PDFs never leave your device, ensuring complete privacy and security.

## License

Built with Emergent AI Platform

---

**Note**: This is a client-side application. It works completely offline once loaded. The backend server is not required for PDF operations.
