import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { SocialLinks } from './SocialLinks';

export const Hero = ({ content }) => {
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
  };

  return (
    <section className="hero-section" id="hero">
      <div className="hero-content">
        <div className="hero-logo-container">
          <div className="hero-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 100 100" className="logo-svg">
                <circle cx="35" cy="35" r="30" fill="none" stroke="#D3FF62" strokeWidth="4"/>
                <path d="M 35 35 Q 50 20, 70 35" fill="none" stroke="#D3FF62" strokeWidth="4"/>
                <circle cx="60" cy="45" r="20" fill="none" stroke="#D3FF62" strokeWidth="3"/>
              </svg>
            </div>
            <h1 className="logo-text">AGLOUD</h1>
          </div>
        </div>
        <h2 className="hero-tagline">{content.tagline}</h2>
        <p className="hero-subtitle">{content.subtitle}</p>
        <p className="hero-description">{content.description}</p>
        <div className="hero-cta">
          <Button 
            className="btn-hero-primary"
            onClick={() => scrollToSection('pillars')}
          >
            Explore Innovation
            <ArrowRight className="ml-2" size={20} />
          </Button>
          <Button 
            variant="outline" 
            className="btn-hero-secondary"
            onClick={() => scrollToSection('contact')}
          >
            Join the Movement
          </Button>
        </div>
        <SocialLinks className="hero-social" />
      </div>
      <div className="hero-gradient-overlay"></div>
    </section>
  );
};