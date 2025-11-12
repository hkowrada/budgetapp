import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Vision', id: 'vision' },
    { name: 'Pillars', id: 'pillars' },
    { name: 'Programs', id: 'programs' },
    { name: 'Ecosystem', id: 'ecosystem' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo" onClick={() => scrollToSection('hero')}>
          <div className="nav-logo-icon">
            <svg viewBox="0 0 100 100" className="nav-logo-svg">
              <circle cx="35" cy="35" r="30" fill="none" stroke="#D3FF62" strokeWidth="4"/>
              <path d="M 35 35 Q 50 20, 70 35" fill="none" stroke="#D3FF62" strokeWidth="4"/>
              <circle cx="60" cy="45" r="20" fill="none" stroke="#D3FF62" strokeWidth="3"/>
            </svg>
          </div>
          <span className="nav-logo-text">AGLOUD</span>
        </div>

        {/* Desktop Menu */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="nav-link"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="mobile-menu-link"
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};