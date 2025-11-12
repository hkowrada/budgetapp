import React, { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { useToast } from '../hooks/use-toast';

export const Contact = ({ contact }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store in localStorage (simulating JSON storage)
    const submissions = JSON.parse(localStorage.getItem('agloud_contacts') || '[]');
    submissions.push({
      ...formData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('agloud_contacts', JSON.stringify(submissions));
    
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });
    
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section className="contact-section">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <h2 className="section-title">Join the Future of Rural Innovation</h2>
            <p className="contact-message">{contact.message}</p>
            
            <div className="contact-details">
              <div className="contact-detail-item">
                <Mail size={24} />
                <div>
                  <h4>Email</h4>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              </div>
              <div className="contact-detail-item">
                <MapPin size={24} />
                <div>
                  <h4>Location</h4>
                  <p>{contact.location}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="contact-form-card">
            <form onSubmit={handleSubmit} className="contact-form">
              <h3 className="form-title">Get in Touch</h3>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  placeholder="Tell us about your interest in AGLOUD..."
                  rows={5}
                />
              </div>
              <Button type="submit" className="btn-submit">
                Send Message
                <Send className="ml-2" size={18} />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};