import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export const Hero = ({ content }) => {
  return (
    <section className="hero-section">
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
          <Button className="btn-hero-primary">
            Explore Innovation
            <ArrowRight className="ml-2" size={20} />
          </Button>
          <Button variant="outline" className="btn-hero-secondary">
            Join the Movement
          </Button>
        </div>
      </div>
      <div className="hero-gradient-overlay"></div>
    </section>
  );
};