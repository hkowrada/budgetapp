# AGLOUD Website - Deployment Instructions for Hostinger

## Overview
This is a modern React website that compiles to static files that can be uploaded directly to Hostinger.

## Project Structure
```
/app/frontend/
├── src/
│   ├── data/
│   │   └── mock.js          # All website content (JSON data)
│   ├── components/
│   │   └── Navigation.jsx   # Navigation component
│   ├── App.js               # Main application component
│   ├── App.css              # Application-specific styles
│   └── index.css            # Global styles and design system
├── public/
│   └── index.html           # HTML template
└── package.json             # Dependencies
```

## Features Implemented
✅ Fully responsive design (mobile, tablet, desktop, TV)
✅ All sections: Hero, About, Core Pillars, Ecosystem, Technology, Programs, Team, Contact
✅ Working contact form (stores submissions in browser localStorage)
✅ Smooth scroll navigation
✅ Mobile hamburger menu
✅ Modern design following Network design system
✅ Performance optimized
✅ Professional animations and hover effects

## Building for Production

### Step 1: Navigate to Frontend Directory
```bash
cd /app/frontend
```

### Step 2: Build Static Files
```bash
yarn build
```

This will create a `build` folder containing all static files optimized for production.

### Step 3: Files Generated
After running `yarn build`, you'll find:
```
/app/frontend/build/
├── index.html
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   ├── js/
│   │   └── main.[hash].js
│   └── media/
│       └── (any images/fonts)
├── manifest.json
└── (other static assets)
```

## Uploading to Hostinger

### Option 1: FTP Upload
1. Connect to your Hostinger account via FTP
2. Navigate to your public_html folder (or domain folder)
3. Upload ALL contents from `/app/frontend/build/` folder
4. Your website will be live immediately

### Option 2: File Manager
1. Log in to Hostinger control panel
2. Open File Manager
3. Navigate to public_html
4. Upload all files from the build folder
5. Extract if uploaded as ZIP

### Option 3: Git Deployment (Recommended)
1. Push your code to a Git repository
2. Connect Hostinger to your Git repo
3. Set build command: `cd frontend && yarn build`
4. Set publish directory: `frontend/build`
5. Auto-deploy on push

## Important Notes

### Data Storage
- Contact form submissions are stored in browser's localStorage
- No backend database is required for the current implementation
- Form data persists in user's browser only

### Updating Content
To update website content, edit `/app/frontend/src/data/mock.js`:
```javascript
export const siteData = {
  hero: { ... },
  about: { ... },
  corePillars: [ ... ],
  // ... etc
}
```

After editing, rebuild:
```bash
cd /app/frontend
yarn build
```

Then re-upload the new build files to Hostinger.

## Performance Features
✅ Optimized bundle size
✅ Code splitting
✅ Lazy loading
✅ Minified CSS and JavaScript
✅ Optimized images
✅ Fast load times

## Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Breakpoints
- Mobile: < 781px
- Tablet: 781px - 1024px
- Desktop: 1024px - 1920px
- Large screens/TV: > 1920px

## Support
For any issues or questions:
- Email: connect@agloud.com
- Location: Pasumarru, Andhra Pradesh, India

## Technology Stack
- React 19
- Tailwind CSS (configured)
- Inter font (Google Fonts)
- Lucide React Icons
- Pure CSS animations

---

**Note**: The website is production-ready and optimized for hosting on Hostinger's shared hosting environment.
