import React from 'react';
import { Card } from './ui/card';

export const VisionMission = ({ vision, mission }) => {
  return (
    <section className="vision-mission-section" id="vision">
      <div className="container">
        <div className="vm-grid">
          <Card className="vm-card vision-card">
            <div className="vm-card-inner">
              <h3 className="vm-title">{vision.title}</h3>
              <p className="vm-content">{vision.content}</p>
            </div>
          </Card>
          
          <Card className="vm-card mission-card">
            <div className="vm-card-inner">
              <h3 className="vm-title">{mission.title}</h3>
              <p className="vm-content">{mission.content}</p>
              <ul className="mission-points">
                {mission.points.map((point, index) => (
                  <li key={index} className="mission-point">
                    <span className="mission-bullet"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};