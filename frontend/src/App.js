import React, { useEffect, useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import CustomCursor from './components/CustomCursor';
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

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });

    // Parallax effect
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      document.querySelectorAll('.parallax').forEach(el => {
        const speed = el.dataset.speed || 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleParallax);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleParallax);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    submissions.push({
      ...formData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    
    alert('Thank you for reaching out! We will contact you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="App">
      <CustomCursor />
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="hero-elegant">
        <div className="subtle-glow"></div>
        <div className="hero-content">
          <div className="hero-badge fade-in-up">
            {siteData.hero.tagline}
          </div>
          <h1 className="display-hero fade-in-up animate-delay-1">
            Redefining <span className="gold-gradient">Rural India</span><br />
            Through Science & Technology
          </h1>
          <p className="hero-description fade-in-up animate-delay-2">{siteData.hero.description}</p>
          <div className="hero-buttons fade-in-up animate-delay-3">
            <a href="#contact" className="btn-primary" onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
            }}>
              {siteData.hero.cta}
            </a>
            <a href="#about" className="btn-secondary" onClick={(e) => {
              e.preventDefault();
              document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
            }}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="elegant-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">What Makes Us Different</span>
            <h2 className="display-medium">A Connected <span className="gold-gradient">Ecosystem</span></h2>
            <div className="elegant-line"></div>
            <p className="body-large section-description">
              Unlike conventional agritech platforms, AGLOUD operates as a connected ecosystem, not just a marketplace.
            </p>
          </div>
          
          <div className="grid-2">
            <div className="elegant-card reveal slide-in-left">
              <h3 className="heading-2 gold-gradient">{siteData.about.vision.title}</h3>
              <div className="elegant-line"></div>
              <p className="body-medium">{siteData.about.vision.description}</p>
            </div>
            <div className="elegant-card reveal slide-in-right">
              <h3 className="heading-2 gold-gradient">{siteData.about.mission.title}</h3>
              <div className="elegant-line"></div>
              <p className="body-medium">{siteData.about.mission.description}</p>
            </div>
          </div>

          <div className="elegant-card reveal fade-in-scale">
            <h3 className="heading-3 gold-text">Our Key Differentiators</h3>
            <div className="elegant-line"></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {siteData.about.differentiators.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ color: 'var(--gold-primary)', fontSize: '20px' }}>✦</span>
                  <p className="body-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section id="pillars" className="elegant-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Our Core Pillars</span>
            <h2 className="display-medium">Five <span className="gold-gradient">Interconnected</span> Technologies</h2>
            <div className="elegant-line"></div>
            <p className="body-large section-description">
              Driving rural innovation through integrated technological excellence
            </p>
          </div>
          <div className="grid-3">
            {siteData.corePillars.map((pillar, index) => {
              const IconComponent = iconMap[pillar.icon];
              return (
                <div key={pillar.id} className={`pillar-refined reveal fade-in-scale animate-delay-${index + 1}`}>
                  <div className="pillar-icon">
                    <IconComponent size={40} />
                  </div>
                  <h3 className="heading-3 pillar-title">{pillar.title}</h3>
                  <p className="pillar-description">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="elegant-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Our Ecosystem</span>
            <h2 className="display-medium">Unified <span className="gold-gradient">Innovation</span> Network</h2>
            <div className="elegant-line"></div>
            <p className="body-large section-description">
              AGLOUD connects multiple stakeholders through a unified innovation network
            </p>
          </div>
          <div className="refined-table reveal fade-in-up">
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
                    <td><strong style={{ color: 'var(--gold-primary)' }}>{item.stakeholder}</strong></td>
                    <td>{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="elegant-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Technology Stack</span>
            <h2 className="display-medium">Cutting-Edge <span className="gold-gradient">Technologies</span></h2>
            <div className="elegant-line"></div>
            <p className="body-large section-description">
              Powering rural transformation with advanced tech infrastructure
            </p>
          </div>
          <div className="grid-3">
            {siteData.technology.map((tech, index) => (
              <div key={index} className={`elegant-card reveal fade-in-up animate-delay-${(index % 3) + 1}`}>
                <h3 className="heading-3" style={{ color: 'var(--gold-primary)', marginBottom: '12px' }}>{tech.name}</h3>
                <p className="body-medium">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship Programs Section */}
      <section id="programs" className="elegant-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Flagship Programs</span>
            <h2 className="display-medium">Transforming <span className="gold-gradient">Rural India</span></h2>
            <div className="elegant-line"></div>
            <p className="body-large section-description">
              Innovative initiatives creating sustainable impact
            </p>
          </div>
          <div className="grid-4">
            {siteData.flagshipPrograms.map((program, index) => {
              const IconComponent = iconMap[program.icon];
              return (
                <div key={program.id} className={`pillar-refined reveal fade-in-scale animate-delay-${(index % 4) + 1}`}>
                  <div className="pillar-icon" style={{ width: '70px', height: '70px' }}>
                    <IconComponent size={32} />
                  </div>
                  <h3 className="heading-3 pillar-title" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)' }}>{program.name}</h3>
                  <p className="pillar-description">{program.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="elegant-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Leadership</span>
            <h2 className="display-medium">Meet Our <span className="gold-gradient">Visionaries</span></h2>
            <div className="elegant-line"></div>
            <p className="body-large section-description">
              The leaders driving AGLOUD's mission forward
            </p>
          </div>
          <div className="grid-3">
            {siteData.team.map((member, index) => (
              <div key={member.id} className={`team-refined reveal fade-in-scale animate-delay-${(index % 3) + 1}`}>
                <div className="team-avatar">
                  {member.name.split(' ')[0][0]}{member.name.split(' ')[1] ? member.name.split(' ')[1][0] : ''}
                </div>
                <h3 className="heading-3 team-name">{member.name}</h3>
                <p className="team-designation">{member.designation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="elegant-section contact-elegant">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Get In Touch</span>
            <h2 className="display-medium">Join the <span className="gold-gradient">Movement</span></h2>
            <div className="elegant-line"></div>
            <p className="body-large section-description">
              Connect with us to be part of rural innovation
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-form reveal fade-in-up">
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '32px' }}>Send Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Your Name</label>
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
                  <label htmlFor="email" className="form-label">Email Address</label>
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
                  <label htmlFor="message" className="form-label">Your Message</label>
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

            <div className="contact-info reveal fade-in-up animate-delay-1">
              <h3>Contact Information</h3>
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={24} />
                </div>
                <div className="contact-details">
                  <h4>Email</h4>
                  <a href={`mailto:${siteData.contact.email}`}>{siteData.contact.email}</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={24} />
                </div>
                <div className="contact-details">
                  <h4>Location</h4>
                  <p>{siteData.contact.location}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Youtube size={24} />
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
                  <Linkedin size={24} />
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
      <footer className="elegant-footer">
        <p className="footer-quote reveal fade-in-up">
          {siteData.message.quote}
        </p>
        <div className="footer-social reveal">
          <a href={siteData.contact.youtube} target="_blank" rel="noopener noreferrer" className="social-icon">
            <Youtube size={24} />
          </a>
          <a href={siteData.contact.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon">
            <Linkedin size={24} />
          </a>
        </div>
        <p className="footer-copyright reveal">
          © {new Date().getFullYear()} AGLOUD. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
