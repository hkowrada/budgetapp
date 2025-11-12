import React, { useEffect, useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import { siteData } from './data/mock';
import { 
  Sprout, 
  Droplets, 
  Microscope, 
  Brain, 
  Leaf,
  Home,
  Factory,
  Fish,
  TrendingUp,
  Mail,
  MapPin,
  Youtube,
  Linkedin
} from 'lucide-react';

const iconMap = {
  Sprout,
  Droplets,
  Microscope,
  Brain,
  Leaf,
  Home,
  Factory,
  Fish,
  TrendingUp
};

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store in localStorage as JSON
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    submissions.push({
      ...formData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.network-card, .pillar-card, .team-card').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <p className="hero-tagline">{siteData.hero.tagline}</p>
          <h1 className="hero-headline">{siteData.hero.headline}</h1>
          <p className="hero-description">{siteData.hero.description}</p>
          <a href="#contact" className="btn-primary" onClick={(e) => {
            e.preventDefault();
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
          }}>
            {siteData.hero.cta}
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <h2 className="section-title">What Makes AGLOUD Different</h2>
          <p className="section-subtitle">
            Unlike conventional agritech platforms, AGLOUD operates as a connected ecosystem, not just a marketplace.
          </p>
          
          <div className="grid-2" style={{ marginBottom: '48px' }}>
            <div className="network-card">
              <h3 className="heading-2">{siteData.about.vision.title}</h3>
              <p className="body-medium">{siteData.about.vision.description}</p>
            </div>
            <div className="network-card">
              <h3 className="heading-2">{siteData.about.mission.title}</h3>
              <p className="body-medium">{siteData.about.mission.description}</p>
            </div>
          </div>

          <div className="network-card">
            <h3 className="heading-3" style={{ marginBottom: '16px' }}>Our Key Differentiators</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {siteData.about.differentiators.map((item, index) => (
                <li key={index} style={{ 
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                  paddingLeft: '24px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: 'var(--brand-dark)'
                  }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section id="pillars" className="section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="container">
          <h2 className="section-title">Our Core Pillars</h2>
          <p className="section-subtitle">
            Five interconnected technologies driving rural innovation
          </p>
          <div className="grid-3">
            {siteData.corePillars.map((pillar) => {
              const IconComponent = iconMap[pillar.icon];
              return (
                <div key={pillar.id} className="pillar-card">
                  <div className="pillar-icon">
                    <IconComponent size={32} />
                  </div>
                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-description">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="section">
        <div className="container">
          <h2 className="section-title">Our Ecosystem</h2>
          <p className="section-subtitle">
            AGLOUD connects multiple stakeholders through a unified innovation network
          </p>
          <div className="ecosystem-table">
            <table>
              <thead>
                <tr>
                  <th>Stakeholder</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {siteData.ecosystem.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.stakeholder}</strong></td>
                    <td>{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="container">
          <h2 className="section-title">Technology Stack</h2>
          <p className="section-subtitle">
            Cutting-edge technologies powering rural transformation
          </p>
          <div className="grid-3">
            {siteData.technology.map((tech, index) => (
              <div key={index} className="network-card">
                <h3 className="heading-3" style={{ marginBottom: '8px' }}>{tech.name}</h3>
                <p className="body-medium">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship Programs Section */}
      <section id="programs" className="section">
        <div className="container">
          <h2 className="section-title">Our Flagship Programs</h2>
          <p className="section-subtitle">
            Innovative initiatives transforming rural India
          </p>
          <div className="grid-4">
            {siteData.flagshipPrograms.map((program) => {
              const IconComponent = iconMap[program.icon];
              return (
                <div key={program.id} className="pillar-card">
                  <div className="pillar-icon">
                    <IconComponent size={32} />
                  </div>
                  <h3 className="pillar-title">{program.name}</h3>
                  <p className="pillar-description">{program.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="container">
          <h2 className="section-title">Our Team</h2>
          <p className="section-subtitle">
            Meet the leaders driving AGLOUD's vision
          </p>
          <div className="grid-3">
            {siteData.team.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-avatar">
                  {member.name.split(' ')[0][0]}{member.name.split(' ')[1] ? member.name.split(' ')[1][0] : ''}
                </div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-designation">{member.designation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Join the future of rural innovation
          </p>
          <div className="contact-content">
            <div className="contact-form">
              <h3 className="heading-3" style={{ marginBottom: '24px' }}>Send us a message</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-textarea"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Send Message
                </button>
              </form>
            </div>

            <div className="contact-info">
              <h3>Contact Information</h3>
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={20} />
                </div>
                <div className="contact-details">
                  <h4>Email</h4>
                  <a href={`mailto:${siteData.contact.email}`}>{siteData.contact.email}</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={20} />
                </div>
                <div className="contact-details">
                  <h4>Location</h4>
                  <p>{siteData.contact.location}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Youtube size={20} />
                </div>
                <div className="contact-details">
                  <h4>YouTube</h4>
                  <a href={siteData.contact.youtube} target="_blank" rel="noopener noreferrer">
                    @agloud
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Linkedin size={20} />
                </div>
                <div className="contact-details">
                  <h4>LinkedIn</h4>
                  <a href={siteData.contact.linkedin} target="_blank" rel="noopener noreferrer">
                    AGLOUD Company
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-message">
            {siteData.message.quote}
          </p>
          <div className="footer-social">
            <a href={siteData.contact.youtube} target="_blank" rel="noopener noreferrer" className="social-link">
              <Youtube size={24} />
            </a>
            <a href={siteData.contact.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
              <Linkedin size={24} />
            </a>
          </div>
          <p className="footer-copyright">
            © {new Date().getFullYear()} AGLOUD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
