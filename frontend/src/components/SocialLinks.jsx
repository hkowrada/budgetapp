import React from 'react';
import { Youtube, Linkedin, Mail, MapPin } from 'lucide-react';

export const SocialLinks = ({ className = '' }) => {
  const socialLinks = [
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@agloud',
      icon: Youtube,
      color: '#FF0000'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/agloud/',
      icon: Linkedin,
      color: '#0A66C2'
    },
    {
      name: 'Email',
      url: 'mailto:connect@agloud.in',
      icon: Mail,
      color: '#D3FF62'
    }
  ];

  return (
    <div className={`social-links ${className}`}>
      {socialLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label={social.name}
            style={{ '--hover-color': social.color }}
          >
            <IconComponent size={20} />
          </a>
        );
      })}
    </div>
  );
};