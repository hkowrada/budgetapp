# 🚀 Running PDF Manager Pro as Standalone App

This guide explains how to run PDF Manager Pro as a completely standalone application that works by simply double-clicking an HTML file.

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- The built version of the application

## 🔨 Building the Standalone Version

### Step 1: Build the Application

From the frontend directory:

```bash
cd /app/frontend
yarn build
```

This creates an optimized production build in the `/app/frontend/build/` directory.

### Step 2: Locate the Build Files

Navigate to:
```
/app/frontend/build/
```

You'll find:
- `index.html` - Main HTML file
- `static/` - Folder with CSS and JS files
- `asset-manifest.json` - Asset mapping file

## 💻 Method 1: Direct Use (Recommended)

### How to Use:

1. **Navigate to the build folder:**
   ```bash
   cd /app/frontend/build/
   ```

2. **Double-click `index.html`**
   - On Windows: Right-click → Open with → Your preferred browser
   - On Mac: Right-click → Open With → Your preferred browser
   - On Linux: Right-click → Open with → Your preferred browser

3. **The app opens in your browser and works immediately!**

### Important Notes:

- ✅ Works completely offline (no internet needed)
- ✅ All PDF operations are client-side
- ✅ No server required
- ✅ Your files never leave your device
- ⚠️ Some browsers may show security warnings for local files (this is normal)

## 📦 Method 2: Package as Single HTML File (Advanced)

For maximum portability, you can inline all assets into a single HTML file.

### Install inline-source tool:

```bash
npm install -g inline-source-cli
```

### Create single-file version:

```bash
cd /app/frontend/build
inline-source --root . index.html > pdf-manager-standalone.html
```

Now `pdf-manager-standalone.html` is a completely self-contained file that you can:
- Email to others
- Store on USB drive
- Open anywhere
- No additional files needed

## 🌐 Method 3: Local Web Server (Alternative)

If double-clicking doesn't work due to browser security settings:

### Option A: Python HTTP Server

```bash
cd /app/frontend/build
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

### Option B: Node.js serve

```bash
# Install serve globally
npm install -g serve

# Serve the build folder
cd /app/frontend/build
serve -s .
```

Then open the URL shown in the terminal.

### Option C: Live Server (VS Code Extension)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html` in the build folder
3. Select "Open with Live Server"

## 🔧 Troubleshooting

### Issue: "File not found" or blank page

**Cause:** Browser security restrictions on local files

**Solution 1:** Use a local web server (Method 3)

**Solution 2:** Configure browser to allow local files:

**Chrome/Edge:**
```bash
# Windows
chrome.exe --allow-file-access-from-files

# Mac
open -a "Google Chrome" --args --allow-file-access-from-files

# Linux
google-chrome --allow-file-access-from-files
```

**Firefox:**
1. Type `about:config` in address bar
2. Search for `privacy.file_unique_origin`
3. Set to `false`

### Issue: CORS errors in console

**Cause:** Cross-origin restrictions

**Solution:** Use local web server (Method 3) or single-file method (Method 2)

### Issue: Styles not loading

**Cause:** Relative paths may not resolve correctly

**Solution 1:** Ensure entire `build/` folder structure is intact:
```
build/
├── index.html
└── static/
    ├── css/
    └── js/
```

**Solution 2:** Use single-file version (Method 2)

## 📱 Mobile/Tablet Use

### On Mobile Devices:

1. **Transfer the build folder** to your device
2. **Use a file manager app** (e.g., Files on iOS, Files on Android)
3. **Locate index.html** and open with browser
4. **Alternatively:** Use a mobile web server app

### Recommended Mobile Browsers:
- iOS: Safari
- Android: Chrome, Firefox

## 🔄 Updating the App

To update your standalone version:

1. Make changes to the source code
2. Rebuild: `yarn build`
3. Replace old build folder with new one
4. Or create new single-file version

## 💾 Distribution

### Sharing with Others:

**Method 1: Share Entire Build Folder**
- Zip the entire `build/` folder
- Share via email, cloud storage, USB
- Recipient extracts and opens `index.html`

**Method 2: Share Single HTML File**
- Create single-file version (Method 2)
- Share just the `pdf-manager-standalone.html` file
- Recipient downloads and opens

### File Sizes:
- **Build folder:** ~350KB (compressed with gzip)
- **Single HTML file:** ~400KB
- Very lightweight and easy to share!

## 🔐 Privacy & Security

### Local File Advantages:
- ✅ No internet connection needed
- ✅ Works in airplane mode
- ✅ No data sent anywhere
- ✅ Complete privacy
- ✅ Fast - no network latency

### Security Considerations:
- App processes PDFs using JavaScript
- No external API calls
- No data collection
- Open source - inspect the code!

## 🎯 Use Cases

### Personal Use:
- Keep on desktop for quick PDF tasks
- Store on USB drive for portable use
- Use offline without internet

### Professional Use:
- Share with team members
- Include in software packages
- Deploy on internal networks
- Use in secure/offline environments

### Educational Use:
- Distribute to students
- Use in computer labs
- No installation required
- Works on any device

## 📊 Performance Notes

### Optimal Performance:
- Modern browser (released in last 2 years)
- 4GB+ RAM
- PDF files under 50MB

### Will Work But Slower:
- Older browsers (2-3 years old)
- 2GB RAM
- Large PDF files (50MB+)

### May Struggle:
- Very old browsers
- Low-end devices
- PDFs over 100MB
- Merging 10+ files at once

## 🆘 Support

### Common Questions:

**Q: Do I need internet?**
A: No! Works completely offline after initial download.

**Q: Can I modify the app?**
A: Yes! It's your code. Edit source and rebuild.

**Q: Is it safe?**
A: Yes! No data leaves your device. All processing is local.

**Q: Can I use on multiple devices?**
A: Yes! Copy the build folder to any device.

**Q: Will it work in 5 years?**
A: Likely yes, as long as browsers support modern web standards.

## 📚 Additional Resources

- **Main README:** `/app/README_PDF_MANAGER.md`
- **Build Guide:** `/app/frontend/README_BUILD.md`
- **User Guide:** `/app/frontend/USER_GUIDE.md`

---

**Success Checklist:**

- [ ] Built the application using `yarn build`
- [ ] Located the `build/` folder
- [ ] Opened `index.html` in browser
- [ ] Tested uploading a PDF
- [ ] Verified all features work
- [ ] Shared with others (if needed)

**You're all set! Enjoy your standalone PDF Manager Pro! 🎉**

---

*Made with Emergent AI Platform*
