import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Technology', href: '#technology' },
    { name: 'Programs', href: '#programs' },
    { name: 'Team', href: '#team' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="network-header">
        <div className="nav-wrapper">
          <a href="#home" className="network-logo" onClick={handleNavClick}>
            <img 
              src="https://customer-assets.emergentagent.com/job_65e6e754-d23c-4d26-9f24-cf537fa4f9cb/artifacts/4g57b1ph_logooo-removebg-preview.png" 
              alt="AGLOUD Logo" 
              className="logo-image"
            />
            <span>AGLOUD</span>
          </a>
          <nav className="network-nav">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="network-nav-link"
                onClick={handleNavClick}
              >
                {link.name}
              </a>
            ))}
          </nav>
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      <div className={`mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="mobile-nav-link"
            onClick={handleNavClick}
          >
            {link.name}
          </a>
        ))}
      </div>
    </>
  );
};

export default Navigation;
