import React from 'react';
import { Cpu, Cloud, Network, Smartphone, Database } from 'lucide-react';

const techIcons = [Cpu, Database, Network, Cloud, Smartphone];

export const TechStack = ({ techStack }) => {
  return (
    <section className="tech-stack-section">
      <div className="container">
        <h2 className="section-title">Technology Stack</h2>
        <p className="section-subtitle">Powered by cutting-edge innovation</p>
        
        <div className="tech-grid">
          {techStack.map((tech, index) => {
            const IconComponent = techIcons[index];
            return (
              <div key={index} className="tech-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="tech-icon">
                  {IconComponent && <IconComponent size={24} />}
                </div>
                <p className="tech-text">{tech}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};