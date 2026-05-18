import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/custom.css";

import { AuthPage } from "./pages/AuthPage";
import { Navbar } from "./components/Navbar";
import { LawyerDashboard } from "./pages/LawyerDashboard";
import { CaseManager } from "./pages/CaseManager";
import { DocumentsPage } from "./pages/DocumentsPage";
import { RAGSearch } from "./pages/RAGSearch";
import { ChatPage } from "./pages/ChatPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AIAssistant } from "./pages/AIAssistant";
import { CasePredictor } from "./pages/CasePredictor";
import { SettingsPage } from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";

// Protected App Component (after login)
function MainApp() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [particles, setParticles] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 5,
      }));
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        // console.log(currentUser);
        return currentUser?.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <LawyerDashboard />
        );
      case "cases":
        return <CaseManager />;
      case "documents":
        return <DocumentsPage />;
      case "rag":
        return <RAGSearch />;
      case "chat":
        return <ChatPage />;
      case "users":
        return <AdminDashboard />;
      case "analytics":
        return <AdminDashboard />;
      case "ai-assistant":
        return <AIAssistant />;
      case "case-predictor":
        return <CasePredictor />;
      case "settings":
        return <SettingsPage />;
      default:
        return <LawyerDashboard />;
    }
  };

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-40px) translateX(-10px) rotate(180deg);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-20px) translateX(5px) rotate(270deg);
            opacity: 0.5;
          }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(102, 126, 234, 0.6);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Premium Particle Background */}
      <div style={styles.particleContainer}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              ...styles.particle,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div style={styles.orbContainer}>
        <div style={{ ...styles.orb, ...styles.orb1 }} />
        <div style={{ ...styles.orb, ...styles.orb2 }} />
        <div style={{ ...styles.orb, ...styles.orb3 }} />
      </div>

      <Navbar onNavigation={setCurrentPage} currentPage={currentPage} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={styles.pageWrapper}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Main App with Router
export default function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/auth"
          element={
            isAuthenticated ? <Navigate to="/app" replace /> : <AuthPage />
          }
        />
        <Route
          path="/app"
          element={
            isAuthenticated ? <MainApp /> : <Navigate to="/auth" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

const styles = {
  app: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    backgroundSize: "400% 400%",
    animation: "gradient 20s ease infinite",
    minHeight: "100vh",
    color: "#f8fafc",
    position: "relative",
    overflow: "hidden",
  },
  particleContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0,
    overflow: "hidden",
  },
  particle: {
    position: "absolute",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "50%",
    animation: "float linear infinite",
    opacity: 0.4,
  },
  orbContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.15,
  },
  orb1: {
    width: "600px",
    height: "600px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    top: "-200px",
    right: "-200px",
    animation: "float 30s ease-in-out infinite",
  },
  orb2: {
    width: "400px",
    height: "400px",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    bottom: "-100px",
    left: "-100px",
    animation: "float 25s ease-in-out infinite reverse",
  },
  orb3: {
    width: "300px",
    height: "300px",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    top: "40%",
    left: "30%",
    animation: "float 35s ease-in-out infinite",
  },
  pageWrapper: {
    position: "relative",
    zIndex: 1,
  },
};
