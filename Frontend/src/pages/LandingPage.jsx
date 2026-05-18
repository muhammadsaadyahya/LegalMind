import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("frontend");
  const [email, setEmail] = useState("");
  const [mapLocation, setMapLocation] = useState({ lat: 0, lng: 0, name: "" });
  const navigate = useNavigate();

  // Random locations around the world
  const randomLocations = [
    { lat: 40.7128, lng: -74.006, name: "New York, USA" },
    { lat: 51.5074, lng: -0.1278, name: "London, UK" },
    { lat: 48.8566, lng: 2.3522, name: "Paris, France" },
    { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" },
    { lat: -33.8688, lng: 151.2093, name: "Sydney, Australia" },
    { lat: 55.7558, lng: 37.6173, name: "Moscow, Russia" },
    { lat: 28.6139, lng: 77.209, name: "New Delhi, India" },
    { lat: 39.9042, lng: 116.4074, name: "Beijing, China" },
    { lat: -23.5505, lng: -46.6333, name: "São Paulo, Brazil" },
    { lat: 30.0444, lng: 31.2357, name: "Cairo, Egypt" },
    { lat: 31.5497, lng: 74.3436, name: "Lahore, Pakistan" },
    { lat: 25.2048, lng: 55.2708, name: "Dubai, UAE" },
  ];

  useEffect(() => {
    // Set random location on component mount
    const randomIndex = Math.floor(Math.random() * randomLocations.length);
    setMapLocation(randomLocations[randomIndex]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing! We'll contact you at ${email}`);
    setEmail("");
  };

  const features = [
    {
      icon: "🔍",
      title: "AI-Powered Legal Search",
      description:
        "Ask complex questions about your case files using natural language. Our RAG system provides precise, context-aware answers instantly.",
    },
    {
      icon: "📄",
      title: "Document Summarizer",
      description:
        "Generate concise summaries of lengthy legal documents, contracts, and case files in seconds.",
    },
    {
      icon: "🎯",
      title: "Case Outcome Predictor",
      description:
        "Machine learning model that analyzes historical data to provide probabilistic predictions of case outcomes.",
    },
    {
      icon: "💬",
      title: "AI-Assisted Chat",
      description:
        "Real-time communication between lawyers and clients with AI suggestions for templates and next steps.",
    },
    {
      icon: "📊",
      title: "Case Tracker",
      description:
        "Visual dashboard for tracking case progress with automated reminders and deadline notifications.",
    },
    {
      icon: "🔒",
      title: "Secure Document Management",
      description:
        "Role-based access control with secure cloud storage for all legal documents and case files.",
    },
  ];

  const teamMembers = [
    { name: "Muhammad Talha Amin", id: "22L-6737", role: "Developer" },
    { name: "Muhammad Saad Yahya", id: "22L-6774", role: "Developer" },
    { name: "Saifullah Tanvir", id: "Advisor", role: "Project Advisor" },
  ];

  const techStack = {
    frontend: [
      {
        name: "React",
        description: "Frontend framework for building user interfaces",
      },
      {
        name: "Redux Toolkit",
        description: "State management for React applications",
      },
      { name: "Bootstrap", description: "CSS framework for responsive design" },
      { name: "Framer Motion", description: "Animation library for React" },
    ],
    backend: [
      { name: "Node.js", description: "Backend runtime environment" },
      { name: "Express.js", description: "Backend web application framework" },
      { name: "MongoDB", description: "NoSQL database for document storage" },
      {
        name: "TypeScript",
        description: "Type-safe JavaScript for robust code",
      },
    ],
    ai: [
      {
        name: "Python",
        description: "AI/ML microservices and data processing",
      },
      {
        name: "LangChain",
        description: "RAG system framework for document querying",
      },
      { name: "ChromaDB", description: "Vector database for semantic search" },
      { name: "OpenAI", description: "Large language model integration" },
    ],
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">⚖️</span>
            <h1>LegalMind</h1>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#team">Team</a>
            </li>
            <li>
              <a href="#tech">Technology</a>
            </li>
            <li>
              <a href="#contact" className="cta-button">
                Get Early Access
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Revolutionizing Legal Practice with AI</h1>
          <p className="hero-subtitle">
            An intelligent platform for secure document management, AI-powered
            legal insights, and collaborative case tracking.
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/auth")}
              className="primary-button"
            >
              Request Demo
            </button>
            <a href="#features" className="secondary-button">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
            </div>
            <div className="preview-content">
              <div className="preview-sidebar">
                <div className="sidebar-item active">📋 Dashboard</div>
                <div className="sidebar-item">🔍 Legal Search</div>
                <div className="sidebar-item">📄 Documents</div>
                <div className="sidebar-item">💬 Chat</div>
                <div className="sidebar-item">📊 Analytics</div>
              </div>
              <div className="preview-main">
                <div className="preview-card">
                  <h4>AI Legal Assistant</h4>
                  <p>Ask me anything about your case...</p>
                </div>
                <div className="preview-stats">
                  <div className="stat">
                    <h5>Active Cases</h5>
                    <p>12</p>
                  </div>
                  <div className="stat">
                    <h5>Documents</h5>
                    <p>156</p>
                  </div>
                  <div className="stat">
                    <h5>AI Queries</h5>
                    <p>47 Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Powerful Features for Modern Legal Practice</h2>
          <p>Designed to enhance productivity and improve client engagement</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Project */}
      <section id="about" className="about-section">
        <div className="about-content">
          <h2>About LegalMind</h2>
          <p>
            LegalMind addresses significant inefficiencies in the legal industry
            by providing a unified system for managing vast volumes of
            documents, conducting exhaustive research, and maintaining
            transparent client communication.
          </p>
          <div className="about-details">
            <div className="detail">
              <h4>Problem Statement</h4>
              <p>
                Legal professionals manually sift through thousands of pages,
                limiting time for high-value strategic work and client
                interaction.
              </p>
            </div>
            <div className="detail">
              <h4>Our Solution</h4>
              <p>
                AI-augmented platform that allows users to "converse" with
                documents, getting precise, context-aware answers instantly.
              </p>
            </div>
            <div className="detail">
              <h4>Target Users</h4>
              <p>
                Lawyers, Clients, and Administrators - each with tailored
                dashboards and tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="section-header">
          <h2>Our Team</h2>
          <p>National University Of Computer and Emerging Sciences, Lahore</p>
        </div>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h3>{member.name}</h3>
              <p className="team-id">{member.id}</p>
              <p className="team-role">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech" className="tech-section">
        <div className="section-header">
          <h2>Technology Stack</h2>
          <p>Built with modern, scalable technologies</p>
        </div>
        <div className="tech-tabs">
          <button
            className={`tab-button ${activeTab === "frontend" ? "active" : ""}`}
            onClick={() => setActiveTab("frontend")}
          >
            Frontend
          </button>
          <button
            className={`tab-button ${activeTab === "backend" ? "active" : ""}`}
            onClick={() => setActiveTab("backend")}
          >
            Backend
          </button>
          <button
            className={`tab-button ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            AI/ML
          </button>
        </div>
        <div className="tech-grid">
          {techStack[activeTab].map((tech, index) => (
            <div key={index} className="tech-card">
              <h3>{tech.name}</h3>
              <p>{tech.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scope Section */}
      <section className="scope-section">
        <div className="scope-content">
          <div className="scope-column">
            <h3>In Scope</h3>
            <ul className="scope-list">
              <li>✓ Fully functional web application with responsive design</li>
              <li>
                ✓ All core AI features (RAG Search, Summarizer, Predictor)
              </li>
              <li>✓ Secure user authentication for three roles</li>
              <li>✓ Secure file upload to cloud storage</li>
              <li>✓ Administrative panel for platform management</li>
            </ul>
          </div>
          <div className="scope-column">
            <h3>Out of Scope</h3>
            <ul className="scope-list out-scope">
              <li>✗ Native mobile applications (responsive web only)</li>
              <li>✗ Financial modules (billing, payments)</li>
              <li>✗ External legal database integration</li>
              <li>✗ Certified legal advice (assistance tool only)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="contact-section">
        <div className="contact-content">
          <h2>Get Early Access</h2>
          <p>Be among the first to experience the future of legal technology</p>
          <form onSubmit={handleSubmit} className="subscribe-form">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="primary-button">
              Subscribe
            </button>
          </form>
          <p className="disclaimer">
            LegalMind is an assistance tool and will not provide certified legal
            advice.
          </p>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="map-section">
        <div className="section-header">
          <h2>Our Global Reach</h2>
          <p>
            Serving legal professionals worldwide - Currently viewing:{" "}
            {mapLocation.name}
          </p>
        </div>
        <div className="map-container">
          {mapLocation.lat !== 0 && (
            <iframe
              title="Google Maps Location"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: "12px" }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${mapLocation.lat},${mapLocation.lng}&zoom=12`}
            />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">⚖️</span>
            <h2>LegalMind</h2>
          </div>
          <p className="footer-institution">
            National University Of Computer and Emerging Sciences
            <br />
            Department of Computer Science, Lahore, Pakistan
          </p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
          <p className="copyright">© 2024 LegalMind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
