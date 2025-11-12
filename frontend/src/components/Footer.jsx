import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import { SocialLinks } from './SocialLinks';

export const Footer = ({ contact }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon-small">
                <svg viewBox="0 0 100 100" className="logo-svg-small">
                  <circle cx="35" cy="35" r="30" fill="none" stroke="#D3FF62" strokeWidth="4"/>
                  <path d="M 35 35 Q 50 20, 70 35" fill="none" stroke="#D3FF62" strokeWidth="4"/>
                  <circle cx="60" cy="45" r="20" fill="none" stroke="#D3FF62" strokeWidth="3"/>
                </svg>
              </div>
              <span className="footer-logo-text">AGLOUD</span>
            </div>
            <p className="footer-tagline">India's First Rural Innovation Platform</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h4 className="footer-heading">Innovation Areas</h4>
              <ul>
                <li><a href="#pillars">Smart Agriculture</a></li>
                <li><a href="#pillars">Aquaculture</a></li>
                <li><a href="#pillars">Biotech & Nanotech</a></li>
                <li><a href="#pillars">AI & IoT</a></li>
                <li><a href="#pillars">Carbon Sustainability</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-heading">Programs</h4>
              <ul>
                <li><a href="#programs">Smart Village Project</a></li>
                <li><a href="#programs">GreenHouse 24x7</a></li>
                <li><a href="#programs">BlueProtein</a></li>
                <li><a href="#programs">Carbon+</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-heading">Contact</h4>
              <ul className="footer-contact">
                <li>
                  <Mail size={16} />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>{contact.location}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AGLOUD. All rights reserved.</p>
          <p className="footer-motto">Transforming soil and water into abundant resources</p>
        </div>
      </div>
    </footer>
  );
};