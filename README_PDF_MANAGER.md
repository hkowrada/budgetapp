# 📄 PDF Manager Pro

A comprehensive, client-side PDF management application built with React. Compress, merge, and manage PDF files entirely in your browser with zero server uploads.

![Made with Emergent](https://img.shields.io/badge/Made%20with-Emergent-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🗜️ PDF Compression
- Reduce PDF file sizes with smart compression
- Maintain quality while optimizing storage
- Process files directly in browser
- Download compressed files instantly

### 🔗 Merge Multiple PDFs
- Combine 2 or more PDF files into one
- Drag-and-drop file ordering
- Select specific files to merge
- Preserve all pages and content

### ✂️ Page Management
- View all pages in a PDF
- Select and delete unwanted pages
- Visual page thumbnails
- Bulk page operations

### 🎨 Modern UI/UX
- Beautiful ocean blue & teal gradient design
- Responsive design (mobile, tablet, desktop)
- Drag-and-drop file upload
- Real-time progress indicators
- Smooth animations and transitions

### 🔒 Privacy First
- **100% client-side processing**
- No server uploads
- No data collection
- Works completely offline
- Your files never leave your device

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and Yarn installed
- Modern web browser

### Installation

1. **Install dependencies:**
```bash
cd /app/frontend
yarn install
```

2. **Start development server:**
```bash
yarn start
```

3. **Open in browser:**
Navigate to `http://localhost:3000`

### Build for Production

```bash
cd /app/frontend
yarn build
```

The build creates a `build/` directory with optimized static files. Simply open `build/index.html` in any browser to run the standalone version.

## 📦 Project Structure

```
/app/frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   └── pdf/             # PDF-specific components
│   │       ├── Header.jsx
│   │       ├── FileUploadZone.jsx
│   │       ├── FileList.jsx
│   │       ├── FileCard.jsx
│   │       ├── ActionPanel.jsx
│   │       └── PageManager.jsx
│   ├── pages/
│   │   └── PDFManager.jsx   # Main application page
│   ├── lib/
│   │   └── utils.js         # Utility functions
│   ├── App.js               # App entry point
│   ├── index.css            # Global styles & design tokens
│   └── index.js             # React DOM render
├── public/
│   └── index.html
├── package.json
├── tailwind.config.js       # Tailwind configuration
├── README_BUILD.md          # Build instructions
└── USER_GUIDE.md           # Detailed user guide
```

## 🎨 Design System

### Color Scheme
- **Primary:** Ocean Blue (HSL: 205 85% 48%)
- **Secondary:** Deep Teal (HSL: 180 45% 45%)
- **Accent:** Vibrant Teal (HSL: 174 72% 56%)
- **Background:** Light gradient (HSL: 210 40% 98%)

### Typography
- **Headings:** Space Grotesk
- **Body:** Inter
- **Responsive scaling:** Mobile-first approach

### Components
- Built with Shadcn/UI primitives
- Custom variants for PDF operations
- Consistent spacing using 4px scale
- Hover effects and micro-animations

## 🛠️ Technology Stack

### Core
- **React 19.0** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling framework

### PDF Processing
- **pdf-lib** - PDF manipulation and creation
- **pdfjs-dist** - PDF rendering (optional)

### UI Components
- **Shadcn/UI** - Component library
- **Radix UI** - Accessible primitives
- **Lucide React** - Icon library

### File Handling
- **react-dropzone** - Drag & drop
- **file-saver** - File downloads

### State & Notifications
- **Sonner** - Toast notifications
- **React Hooks** - State management

## 📖 Usage

### Upload Files
1. Drag PDF files into the upload zone, or
2. Click the upload zone to browse files
3. Multiple files supported

### Compress a PDF
1. Upload a PDF file
2. Click "Compress" on the file card
3. Compressed file downloads automatically

### Merge PDFs
1. Upload 2 or more PDFs
2. Select files using checkboxes
3. Click "Merge Selected"
4. Merged PDF downloads automatically

### Delete Pages
1. Switch to "Page Manager" tab
2. Select a PDF from dropdown
3. Click pages to mark for deletion
4. Click "Delete Selected"
5. Modified PDF downloads

## 🔧 Configuration

### Environment Variables
No environment variables needed for standalone use. The app runs entirely client-side.

### Build Configuration
Modify `package.json` for build settings:
- `homepage`: Set base URL for deployment
- `build`: Customize build output directory

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ 90+ |
| Firefox | ✅ 88+ |
| Safari | ✅ 14+ |
| Edge | ✅ 90+ |
| Opera | ✅ 76+ |

Mobile browsers fully supported with responsive design.

## 📱 Responsive Breakpoints

- **Mobile:** 0-767px (1 column grid)
- **Tablet:** 768-1023px (2 column grid)
- **Desktop:** 1024px+ (3 column grid)

## 🎯 Performance

### Optimization
- Code splitting with React.lazy
- Minified production build
- Gzip compression enabled
- Tree shaking for smaller bundles

### Recommended Limits
- **File Size:** Up to 50MB per PDF
- **Merge Count:** Up to 10 files at once
- **Page Count:** Up to 100 pages for page management

## 🔐 Security & Privacy

### Client-Side Processing
All PDF operations happen in your browser using JavaScript:
1. Files loaded into browser memory
2. pdf-lib processes files locally
3. Results downloaded to your device
4. No network requests (except initial page load)

### Data Handling
- ✅ No server uploads
- ✅ No cloud storage
- ✅ No analytics tracking
- ✅ No cookies
- ✅ Works offline

## 📚 Documentation

- **[BUILD.md](README_BUILD.md)** - Detailed build instructions
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user documentation

## 🤝 Contributing

This project was built as a demonstration of client-side PDF processing. Feel free to fork and extend!

### Development Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 🐛 Known Issues

1. **Large Files:** Processing 100MB+ files may be slow
2. **Mobile Performance:** Complex operations slower on mobile
3. **Memory:** Very large PDFs may cause memory issues

## 🔮 Future Enhancements

Potential features for future versions:
- [ ] PDF rotation
- [ ] Page reordering
- [ ] Add watermarks
- [ ] Extract images
- [ ] PDF to image conversion
- [ ] Batch compression
- [ ] Dark mode toggle
- [ ] PDF metadata editing
- [ ] Password protection

## 📄 License

MIT License - Feel free to use in your projects

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev) - UI framework
- [pdf-lib](https://pdf-lib.js.org) - PDF manipulation
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Shadcn/UI](https://ui.shadcn.com) - Component library
- [Lucide](https://lucide.dev) - Icons

## 💬 Support

For issues or questions:
1. Check USER_GUIDE.md for usage help
2. Review troubleshooting section
3. Check browser console for errors

---

**Made with ❤️ using Emergent AI Platform**

*Last Updated: 2024*
