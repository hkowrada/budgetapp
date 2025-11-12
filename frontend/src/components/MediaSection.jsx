import React from 'react';
import { Play } from 'lucide-react';
import { Card } from './ui/card';

export const MediaSection = () => {
  return (
    <section className="media-section" id="media">
      <div className="container">
        <h2 className="section-title">See AGLOUD in Action</h2>
        <p className="section-subtitle">Discover how we're transforming rural India</p>
        
        <div className="media-grid">
          {/* YouTube Video Embed */}
          <Card className="media-card video-card">
            <div className="video-embed-container">
              <a 
                href="https://www.youtube.com/@agloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="video-placeholder"
              >
                <div className="video-play-button">
                  <Play size={48} fill="#D3FF62" color="#000000" />
                </div>
                <div className="video-overlay">
                  <h3>Watch Our Story</h3>
                  <p>Learn about AGLOUD's mission to revolutionize rural innovation</p>
                </div>
              </a>
            </div>
          </Card>

          {/* Stats Cards */}
          <Card className="media-card stats-card">
            <div className="stat-item">
              <div className="stat-number">1st</div>
              <div className="stat-label">Rural Innovation Platform in India</div>
            </div>
          </Card>

          <Card className="media-card stats-card">
            <div className="stat-item">
              <div className="stat-number">7+</div>
              <div className="stat-label">Technologies Integrated</div>
            </div>
          </Card>

          <Card className="media-card stats-card">
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Sustainable & Carbon Positive</div>
            </div>
          </Card>
        </div>

        {/* CTA Banner */}
        <div className="cta-banner">
          <h3>Join the Innovation Movement</h3>
          <p>Be part of India's rural transformation journey</p>
          <div className="cta-buttons">
            <a 
              href="https://www.youtube.com/@agloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-cta-primary"
            >
              Watch on YouTube
            </a>
            <a 
              href="https://www.linkedin.com/company/agloud/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-cta-secondary"
            >
              Follow on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};