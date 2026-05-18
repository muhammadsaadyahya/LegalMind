import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiUserCheck,
  FiLogIn,
  FiUserPlus,
  FiCheckCircle,
} from "react-icons/fi";
import { BsStars, BsShieldCheck, BsLightning } from "react-icons/bs";
import { loginUser, registerUser } from "../features/authSlice";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("lawyer@gmail.com");
  const [password, setPassword] = useState("123");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      if (result) {
        setRole(result.userObj.role);
        navigate("/app");
      }
    } catch (err) {
      setError(err || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const registerData = { name, email, password, role };
      if (role === "lawyer" && bio) {
        registerData.bio = bio;
      }
      await dispatch(registerUser(registerData)).unwrap();
      setIsLogin(true);
      setEmail("");
      setPassword("");
      setName("");
      setBio("");
    } catch (err) {
      setError(err || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (demoEmail, demoPassword) => {
    setError("");
    setLoading(true);
    try {
      const result = await dispatch(
        loginUser({ email: demoEmail, password: demoPassword }),
      ).unwrap();
      if (result) {
        navigate("/app");
      }
    } catch (err) {
      setError(err || "Demo login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Assistant",
      desc: "Get instant legal insights",
    },
    { icon: "📊", title: "Case Prediction", desc: "ML-based outcome analysis" },
    {
      icon: "📁",
      title: "Document Management",
      desc: "Organize all your files",
    },
    { icon: "💬", title: "Real-time Chat", desc: "Communicate with clients" },
  ];

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4); }
          50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.7); }
        }
      `}</style>

      {/* Background Elements */}
      <div style={styles.orbContainer}>
        <div style={{ ...styles.orb, ...styles.orb1 }} />
        <div style={{ ...styles.orb, ...styles.orb2 }} />
        <div style={{ ...styles.orb, ...styles.orb3 }} />
      </div>

      <Container fluid style={styles.container}>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col lg={10} xl={8}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card style={styles.mainCard}>
                <Row className="g-0">
                  {/* Left Side - Branding */}
                  <Col md={5} style={styles.brandingSide}>
                    <div style={styles.brandingContent}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div style={styles.logoWrapper}>
                          <div style={styles.logo}>
                            <BsStars size={32} />
                          </div>
                          <div>
                            <h1 style={styles.brandName}>LegalMind</h1>
                            <Badge style={styles.proBadge}>PRO</Badge>
                          </div>
                        </div>

                        <h2 style={styles.tagline}>
                          Intelligent Legal Case Management
                        </h2>
                        <p style={styles.description}>
                          Transform your legal practice with AI-powered tools,
                          predictive analytics, and seamless collaboration.
                        </p>

                        <div style={styles.featuresList}>
                          {features.map((feature, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              style={styles.featureItem}
                            >
                              <span style={styles.featureIcon}>
                                {feature.icon}
                              </span>
                              <div>
                                <div style={styles.featureTitle}>
                                  {feature.title}
                                </div>
                                <div style={styles.featureDesc}>
                                  {feature.desc}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </Col>

                  {/* Right Side - Form */}
                  <Col md={7} style={styles.formSide}>
                    <div style={styles.formContent}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 style={styles.formTitle}>
                          {isLogin ? "Welcome Back!" : "Create Account"}
                        </h3>
                        <p style={styles.formSubtitle}>
                          {isLogin
                            ? "Sign in to continue to your dashboard"
                            : "Join thousands of legal professionals"}
                        </p>

                        <Form onSubmit={isLogin ? handleLogin : handleRegister}>
                          {!isLogin && (
                            <Form.Group className="mb-3">
                              <div style={styles.inputWrapper}>
                                <FiUser style={styles.inputIcon} />
                                <Form.Control
                                  type="text"
                                  placeholder="Full Name"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  style={styles.input}
                                  required
                                />
                              </div>
                            </Form.Group>
                          )}

                          <Form.Group className="mb-3">
                            <div style={styles.inputWrapper}>
                              <FiMail style={styles.inputIcon} />
                              <Form.Control
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                              />
                            </div>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <div style={styles.inputWrapper}>
                              <FiLock style={styles.inputIcon} />
                              <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                              />
                            </div>
                          </Form.Group>

                          {!isLogin && (
                            <Form.Group className="mb-3">
                              <Form.Label style={styles.roleLabel}>
                                I am a
                              </Form.Label>
                              <div style={styles.roleSelector}>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setRole("client")}
                                  style={{
                                    ...styles.roleButton,
                                    ...(role === "client" &&
                                      styles.roleButtonActive),
                                  }}
                                >
                                  <span style={styles.roleIcon}>👨‍💼</span>
                                  <div style={styles.roleText}>
                                    <div style={styles.roleTitle}>Client</div>
                                    <div style={styles.roleDesc}>
                                      Seeking legal services
                                    </div>
                                  </div>
                                  {role === "client" && (
                                    <FiCheckCircle style={styles.checkIcon} />
                                  )}
                                </motion.button>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setRole("lawyer")}
                                  style={{
                                    ...styles.roleButton,
                                    ...(role === "lawyer" &&
                                      styles.roleButtonActive),
                                  }}
                                >
                                  <span style={styles.roleIcon}>👩‍⚖️</span>
                                  <div style={styles.roleText}>
                                    <div style={styles.roleTitle}>Lawyer</div>
                                    <div style={styles.roleDesc}>
                                      Legal professional
                                    </div>
                                  </div>
                                  {role === "lawyer" && (
                                    <FiCheckCircle style={styles.checkIcon} />
                                  )}
                                </motion.button>
                              </div>
                            </Form.Group>
                          )}

                          {!isLogin && role === "lawyer" && (
                            <Form.Group className="mb-3">
                              <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Brief bio (specialization, experience, etc.)"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                style={{
                                  ...styles.input,
                                  paddingLeft: "16px",
                                  minHeight: "80px",
                                  resize: "vertical",
                                }}
                              />
                            </Form.Group>
                          )}

                          <Button type="submit" style={styles.submitButton}>
                            {isLogin ? (
                              <>
                                <FiLogIn className="me-2" />
                                Sign In
                              </>
                            ) : (
                              <>
                                <FiUserPlus className="me-2" />
                                Create Account
                              </>
                            )}
                          </Button>
                          {error && (
                            <div style={{ color: "red", marginTop: "10px" }}>
                              {error}
                            </div>
                          )}
                        </Form>

                        {isLogin && (
                          <div style={styles.demoSection}>
                            <p style={styles.demoTitle}>
                              <BsLightning className="me-1" />
                              Quick Demo Access
                            </p>
                            <div style={styles.demoButtons}>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  demoLogin("lawyer@gmail.com", "123")
                                }
                                style={{
                                  ...styles.demoButton,
                                  background:
                                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                                }}
                              >
                                👩‍⚖️ Lawyer
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  demoLogin("client@gmail.com", "123")
                                }
                                style={{
                                  ...styles.demoButton,
                                  background:
                                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                }}
                              >
                                👨‍💼 Client
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  demoLogin("admin1@example.com", "123")
                                }
                                style={{
                                  ...styles.demoButton,
                                  background:
                                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                }}
                              >
                                👤 Admin
                              </motion.button>
                            </div>
                          </div>
                        )}

                        <p style={styles.toggleText}>
                          {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}
                          <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            style={styles.toggleButton}
                          >
                            {isLogin ? "Create one" : "Sign in"}
                          </button>
                        </p>
                      </motion.div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    backgroundSize: "400% 400%",
    animation: "gradient 20s ease infinite",
    position: "relative",
    overflow: "hidden",
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
    opacity: 0.2,
  },
  orb1: {
    width: "500px",
    height: "500px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    top: "-150px",
    right: "-150px",
    animation: "float 20s ease-in-out infinite",
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
    left: "20%",
    animation: "float 30s ease-in-out infinite",
  },
  container: {
    position: "relative",
    zIndex: 1,
    padding: "20px",
  },
  mainCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
  },
  brandingSide: {
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
    padding: "0",
  },
  brandingContent: {
    padding: "48px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
  },
  logo: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
  },
  brandName: {
    fontSize: "28px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    display: "inline",
  },
  proBadge: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "4px",
    marginLeft: "8px",
    verticalAlign: "super",
  },
  tagline: {
    fontSize: "24px",
    fontWeight: "700",
    color: "white",
    marginBottom: "16px",
    lineHeight: "1.3",
  },
  description: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "15px",
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  featureIcon: {
    fontSize: "24px",
  },
  featureTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  featureDesc: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "12px",
  },
  formSide: {
    background: "rgba(255, 255, 255, 0.03)",
  },
  formContent: {
    padding: "48px",
  },
  formTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "white",
    marginBottom: "8px",
  },
  formSubtitle: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "15px",
    marginBottom: "32px",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255, 255, 255, 0.4)",
    zIndex: 1,
  },
  input: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "14px",
    padding: "14px 16px 14px 48px",
    color: "white",
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
    marginTop: "8px",
    transition: "all 0.3s ease",
  },
  demoSection: {
    marginTop: "32px",
    padding: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  demoTitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  demoButtons: {
    display: "flex",
    gap: "10px",
  },
  demoButton: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
  },
  toggleText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "14px",
    marginTop: "24px",
  },
  toggleButton: {
    background: "none",
    border: "none",
    color: "#667eea",
    fontWeight: "700",
    marginLeft: "8px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  roleLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "12px",
    display: "block",
  },
  roleSelector: {
    display: "flex",
    gap: "12px",
  },
  roleButton: {
    flex: 1,
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    position: "relative",
  },
  roleButtonActive: {
    background: "rgba(102, 126, 234, 0.15)",
    border: "2px solid #667eea",
    boxShadow: "0 0 20px rgba(102, 126, 234, 0.3)",
  },
  roleIcon: {
    fontSize: "32px",
  },
  roleText: {
    flex: 1,
    textAlign: "left",
  },
  roleTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: "16px",
    marginBottom: "2px",
  },
  roleDesc: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "12px",
  },
  checkIcon: {
    color: "#667eea",
    fontSize: "20px",
  },
};

export default AuthPage;
