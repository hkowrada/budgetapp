import React from 'react';
import { Users, FlaskConical, Building2, TrendingUp, Landmark } from 'lucide-react';

const stakeholderIcons = {
  'Farmers': Users,
  'Researchers': FlaskConical,
  'Businesses & Pharma': Building2,
  'Investors & NGOs': TrendingUp,
  'Governments': Landmark
};

export const Stakeholders = ({ stakeholders }) => {
  return (
    <section className="stakeholders-section">
      <div className="container">
        <h2 className="section-title">Our Ecosystem</h2>
        <p className="section-subtitle">Connecting multiple stakeholders through unified innovation</p>
        
        <div className="stakeholders-grid">
          {stakeholders.map((stakeholder, index) => {
            const IconComponent = stakeholderIcons[stakeholder.role];
            return (
              <div key={index} className="stakeholder-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stakeholder-icon">
                  {IconComponent && <IconComponent size={28} />}
                </div>
                <h4 className="stakeholder-role">{stakeholder.role}</h4>
                <p className="stakeholder-description">{stakeholder.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};