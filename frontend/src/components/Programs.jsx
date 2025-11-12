import React from 'react';
import { Card } from './ui/card';
import { Target, Sprout, Waves, TreePine } from 'lucide-react';

const programIcons = {
  'smart-village': Target,
  'greenhouse': Sprout,
  'blue-protein': Waves,
  'carbon-plus': TreePine
};

export const Programs = ({ programs }) => {
  return (
    <section className="programs-section">
      <div className="container">
        <h2 className="section-title">Our Flagship Programs</h2>
        <p className="section-subtitle">Transforming rural ecosystems through targeted initiatives</p>
        
        <div className="programs-grid">
          {programs.map((program, index) => {
            const IconComponent = programIcons[program.id];
            return (
              <Card key={program.id} className="program-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="program-icon">
                  {IconComponent && <IconComponent size={32} />}
                </div>
                <h3 className="program-title">{program.title}</h3>
                <p className="program-description">{program.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};