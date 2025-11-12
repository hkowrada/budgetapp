# AGLOUD Website - Deployment Guide

## 🚀 Quick Overview

This is a modern React-based website for AGLOUD - India's First Rural Innovation Platform. The website is built with React and compiles to static files that can be uploaded to any hosting provider including Hostinger.

## 📋 What's Included

- **Dark Theme** with premium gold accents (#D3FF62)
- **Fully Responsive** design (mobile, tablet, desktop, TV-ready)
- **JSON-based Data Management** (no database required)
- **Contact Form** with localStorage submission
- **All Sections**: Hero, Vision/Mission, Core Pillars, Programs, Stakeholders, Tech Stack, Contact, Footer
- **Smooth Animations** and hover effects
- **Professional Logo** placeholder (easily replaceable)

## 🏗️ Tech Stack

- React 19
- Tailwind CSS
- Shadcn UI Components
- Lucide React Icons
- Fast, optimized, production-ready

## 📦 Building for Production

### Step 1: Build the Website

Run this command in the `/app/frontend` directory:

```bash
cd /app/frontend
yarn build
```

This creates a `build` folder with all compiled static files ready for upload.

### Step 2: Files to Upload

After building, you'll have a `build` folder containing:

```
build/
├── index.html          # Main HTML file
├── static/
│   ├── css/           # Compiled CSS
│   ├── js/            # Compiled JavaScript
│   └── media/         # Images and fonts
├── manifest.json       # PWA manifest
└── asset-manifest.json # Asset mapping
```

## 🌐 Uploading to Hostinger

### Method 1: Using File Manager (Recommended)

1. Log in to your Hostinger account
2. Go to **File Manager** in your hosting control panel
3. Navigate to `public_html` directory
4. **Delete** any existing files in `public_html`
5. **Upload** all contents from the `build` folder
6. Make sure `index.html` is in the root of `public_html`
7. Visit your domain - website should be live!

### Method 2: Using FTP

1. Use an FTP client (FileZilla, Cyberduck, etc.)
2. Connect to your Hostinger FTP:
   - Host: Your domain or server IP
   - Username: Your FTP username
   - Password: Your FTP password
3. Navigate to `public_html` directory
4. Upload all contents from the `build` folder
5. Done!

## 🎨 Customizing Content

### Updating Text Content

All website content is stored in a single JSON file:
**Location**: `/app/frontend/src/data/content.json`

Edit this file to change:
- Hero section text
- Vision & Mission statements
- Core Pillars descriptions
- Program details
- Contact information

After editing, rebuild with `yarn build`.

### Replacing the Logo

The logo is currently an SVG placeholder. To replace it:

1. **Option A - Direct SVG Edit**:
   - Edit the logo SVG in `/app/frontend/src/components/Hero.jsx`
   - Edit footer logo in `/app/frontend/src/components/Footer.jsx`

2. **Option B - Use Image File**:
   - Place your logo image in `/app/frontend/public/`
   - Update the Hero and Footer components to use:
     ```jsx
     <img src="/your-logo.png" alt="AGLOUD Logo" />
     ```

### Updating Colors

Colors are defined in `/app/frontend/src/App.css`:

```css
:root {
  --gold-primary: #D3FF62;     /* Main brand color */
  --bg-dark: #0A0A0A;          /* Background */
  --bg-card: #1A1A1A;          /* Card backgrounds */
  /* ... more colors */
}
```

Change these values to match your exact brand colors.

## 📱 Testing Responsiveness

The website is optimized for:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1440px+
- **TV Displays**: 1920px+

Test your website on different devices after deployment.

## 🔧 Contact Form Setup

The contact form currently stores submissions in browser localStorage. To collect actual submissions:

### Option 1: Email Integration (Recommended for Hostinger)

Add a PHP backend file `contact.php` in your `public_html`:

```php
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];
    
    $to = "connect@agloud.in";
    $subject = "New Contact Form Submission from AGLOUD Website";
    $body = "Name: $name\nEmail: $email\nMessage: $message";
    
    mail($to, $subject, $body);
    echo json_encode(["success" => true]);
}
?>
```

Then update the form submission in Contact.jsx to POST to this file.

### Option 2: Third-Party Forms

Use services like:
- Formspree (formspree.io)
- Google Forms
- Typeform

## 🚨 Important Notes

1. **File Permissions**: Ensure uploaded files have proper read permissions (644 for files, 755 for directories)
2. **.htaccess**: For React Router, add this to your `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

3. **SSL Certificate**: Enable HTTPS in Hostinger for secure connections
4. **Domain Setup**: Point your domain to Hostinger nameservers if not already done

## 🎯 Performance Tips

- The website is already optimized for fast loading
- Enable Hostinger's caching features for even better speed
- Enable Gzip compression in your hosting settings
- Use Hostinger's CDN if available

## 📞 Support

For website content updates or technical assistance:
- Email: connect@agloud.in
- Edit content via `/app/frontend/src/data/content.json`

## ✅ Checklist Before Going Live

- [ ] Build the production files (`yarn build`)
- [ ] Test the website locally
- [ ] Upload all files from `build` folder to `public_html`
- [ ] Replace placeholder logo with your actual logo
- [ ] Update contact email in content.json
- [ ] Test contact form
- [ ] Check mobile responsiveness
- [ ] Enable SSL certificate
- [ ] Test on different browsers
- [ ] Share with team for feedback

---

## 🏆 Your Website is Ready!

Once uploaded, your AGLOUD website will be live at your domain with:
- Fast loading times
- Beautiful dark design with gold accents
- Full mobile responsiveness
- Professional appearance
- Easy content management via JSON

**Need to update content?** Edit the JSON file and rebuild!
**Need to change design?** Edit the CSS and rebuild!

Good luck with your launch! 🌾🚀
