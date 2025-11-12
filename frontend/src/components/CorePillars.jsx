import React from 'react';
import { Sprout, Fish, Microscope, Brain, Leaf } from 'lucide-react';
import { Card } from './ui/card';

const iconMap = {
  Sprout: Sprout,
  Fish: Fish,
  Microscope: Microscope,
  Brain: Brain,
  Leaf: Leaf
};

export const CorePillars = ({ pillars }) => {
  return (
    <section className="core-pillars-section">
      <div className="container">
        <h2 className="section-title">Our Core Pillars</h2>
        <p className="section-subtitle">Five interconnected pillars driving rural innovation</p>
        
        <div className="pillars-grid">
          {pillars.map((pillar, index) => {
            const IconComponent = iconMap[pillar.icon];
            return (
              <Card key={pillar.id} className="pillar-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="pillar-icon-wrapper">
                  <div className="pillar-icon">
                    {IconComponent && <IconComponent size={40} strokeWidth={1.5} />}
                  </div>
                </div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-description">{pillar.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};