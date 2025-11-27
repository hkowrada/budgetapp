# 🚀 Local Laptop Setup Guide

## Quick Start - Downloaded from GitHub

You've downloaded the ZIP and extracted it. Here's how to run it on your laptop:

---

## ⚡ FASTEST METHOD - Use Pre-Built Version (No Setup Needed!)

If the `build` folder exists in your download:

### Windows:
1. Navigate to: `frontend/build/`
2. Double-click `index.html`
3. It opens in your browser - Done! 🎉

### Mac:
1. Navigate to: `frontend/build/`
2. Right-click `index.html` → Open With → Your browser (Chrome/Safari/Firefox)
3. Done! 🎉

### Linux:
1. Navigate to: `frontend/build/`
2. Right-click `index.html` → Open With → Your browser
3. Or terminal: `xdg-open frontend/build/index.html`
4. Done! 🎉

**That's it! The app works completely offline.**

---

## 🛠️ METHOD 2 - Run Development Server (Recommended for Developers)

If you want to modify the code or the build folder doesn't exist:

### Step 1: Install Prerequisites

#### Install Node.js (if not already installed)
- Download from: https://nodejs.org/
- Choose LTS version (recommended)
- Version required: Node.js 16 or higher

**Check if installed:**
```bash
node --version
npm --version
```

#### Install Yarn (Optional but Recommended)
```bash
npm install -g yarn
```

---

### Step 2: Navigate to Frontend Folder

Open terminal/command prompt and navigate to the extracted folder:

**Windows (Command Prompt):**
```cmd
cd C:\path\to\extracted\folder\frontend
```

**Mac/Linux (Terminal):**
```bash
cd /path/to/extracted/folder/frontend
```

---

### Step 3: Install Dependencies

**Using Yarn (Recommended):**
```bash
yarn install
```

**OR using NPM:**
```bash
npm install
```

This takes 2-5 minutes. Wait for it to complete.

---

### Step 4: Start Development Server

**Using Yarn:**
```bash
yarn start
```

**OR using NPM:**
```bash
npm start
```

**What happens:**
- Server starts at http://localhost:3000
- Browser opens automatically
- App is ready to use! 🎉

---

## 📦 METHOD 3 - Build Your Own Production Version

If you want to create a fresh build:

### Step 1-3: Same as Method 2 (Install Node.js, navigate, install dependencies)

### Step 4: Build
```bash
yarn build
```
OR
```bash
npm run build
```

### Step 5: Use the Build
The `build` folder is created. Now use **METHOD 1** (double-click index.html)

---

## 🔧 Troubleshooting

### Issue: "node: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "yarn: command not found"
**Solution:** Either:
- Install yarn: `npm install -g yarn`
- OR use npm instead: `npm install` and `npm start`

### Issue: Port 3000 already in use
**Solution:** 
- Close other apps using port 3000
- OR the app will ask to use port 3001 automatically

### Issue: Dependencies installation fails
**Solution:**
1. Delete `node_modules` folder
2. Delete `package-lock.json` or `yarn.lock`
3. Run `yarn install` or `npm install` again

### Issue: Blank page when double-clicking index.html
**Solution:** 
Try one of these methods:

**Method A - Use Local Server (Python):**
```bash
cd frontend/build
python -m http.server 8080
```
Then open: http://localhost:8080

**Method B - Use Local Server (Node):**
```bash
npm install -g serve
cd frontend/build
serve -s .
```

**Method C - Browser Setting (Chrome):**
Start Chrome with flag:
```bash
chrome.exe --allow-file-access-from-files
```

### Issue: "Cannot find module" errors
**Solution:** Make sure you're in the `frontend` folder, not root folder:
```bash
cd frontend
yarn install
```

---

## 📁 Folder Structure

After extraction, you should see:
```
your-folder/
├── frontend/              ← YOU NEED TO BE HERE
│   ├── build/            ← Pre-built version (if exists)
│   ├── src/              ← Source code
│   ├── public/
│   ├── package.json      ← Dependencies list
│   └── node_modules/     ← Created after yarn install
├── backend/              ← Not needed for PDF Manager
└── README files
```

**Important:** Always navigate to `frontend` folder before running commands!

---

## 🎯 Which Method Should I Use?

### Use METHOD 1 (Pre-built) if:
- ✅ You just want to use the app
- ✅ You don't want to install anything
- ✅ You want it to work immediately
- ✅ Build folder exists in your download

### Use METHOD 2 (Dev Server) if:
- ✅ You want to modify the code
- ✅ You're a developer
- ✅ You want to see changes live
- ✅ Build folder doesn't exist

### Use METHOD 3 (Build) if:
- ✅ You modified the code
- ✅ You want to share with others
- ✅ You want the fastest version

---

## 💡 Pro Tips

### Tip 1: Check if Build Exists
Before installing anything, check if `frontend/build/index.html` exists. If yes, just double-click it!

### Tip 2: Use Modern Browser
For best experience, use:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Tip 3: Works Offline
Once you open it, it works completely offline. No internet needed!

### Tip 4: Share with Others
To share the app:
1. If using pre-built: Just zip the `frontend/build` folder and share
2. Recipient extracts and double-clicks `index.html`

### Tip 5: Mobile Testing
Want to test on phone?
1. Start dev server: `yarn start`
2. Find your computer's IP (ipconfig on Windows, ifconfig on Mac/Linux)
3. Open `http://YOUR_IP:3000` on phone

---

## 🆘 Quick Commands Reference

```bash
# Navigate to frontend
cd frontend

# Install dependencies
yarn install
# or
npm install

# Start development server
yarn start
# or
npm start

# Build for production
yarn build
# or
npm run build

# Check versions
node --version
npm --version
yarn --version
```

---

## ✅ Success Checklist

After following the steps, you should see:

- [ ] Node.js installed (check with `node --version`)
- [ ] Navigated to `frontend` folder
- [ ] Ran `yarn install` or `npm install` successfully
- [ ] Ran `yarn start` or `npm start`
- [ ] Browser opened at http://localhost:3000
- [ ] PDF Manager Pro interface visible
- [ ] Can upload and manage PDFs

---

## 📞 Still Having Issues?

### Check These:
1. Are you in the `frontend` folder? (not root folder)
2. Did `yarn install` or `npm install` complete without errors?
3. Is Node.js version 16 or higher?
4. Is port 3000 available?
5. Did you wait for installation to complete?

### Common Mistakes:
- ❌ Running commands from root folder instead of `frontend/`
- ❌ Not installing Node.js first
- ❌ Interrupting `yarn install` before it completes
- ❌ Using old Node.js version (< 16)

---

## 🎉 You're All Set!

Once running, you can:
- ✅ Upload PDFs (drag & drop)
- ✅ Compress PDFs
- ✅ Merge multiple PDFs
- ✅ Delete pages from PDFs
- ✅ All processing happens locally (private & secure)

**Enjoy your PDF Manager Pro!** 🚀

---

## 📚 Additional Resources

- **User Guide:** See `USER_GUIDE.md` for how to use features
- **Build Guide:** See `README_BUILD.md` for advanced build options
- **Standalone Setup:** See `STANDALONE_SETUP.md` for distribution

---

**Made with ❤️ using Emergent AI Platform**
