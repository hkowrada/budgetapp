import React, { useEffect } from "react";
import "./App.css";
import { Hero } from "./components/Hero";
import { VisionMission } from "./components/VisionMission";
import { CorePillars } from "./components/CorePillars";
import { Programs } from "./components/Programs";
import { Stakeholders } from "./components/Stakeholders";
import { TechStack } from "./components/TechStack";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import contentData from "./data/content.json";

function App() {
  useEffect(() => {
    // Add scroll animation class to elements
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.pillar-card, .program-card, .stakeholder-item, .tech-item');
    animateElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
      <Hero content={contentData.hero} />
      <VisionMission vision={contentData.vision} mission={contentData.mission} />
      <CorePillars pillars={contentData.corePillars} />
      <Programs programs={contentData.programs} />
      <Stakeholders stakeholders={contentData.stakeholders} />
      <TechStack techStack={contentData.techStack} />
      <Contact contact={contentData.contact} />
      <Footer contact={contentData.contact} />
      <Toaster />
    </div>
  );
}

export default App;
