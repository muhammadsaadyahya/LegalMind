import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  FiSend,
  FiTrash2,
  FiMessageSquare,
  FiCpu,
  FiZap,
  FiBookOpen,
  FiClock,
} from "react-icons/fi";
import { BsRobot, BsLightbulb, BsStars } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import {
  addMessage,
  setLoading,
  askAI,
  loadChatHistory,
  clearChatHistory,
} from "../features/aiAssistantSlice";

export function AIAssistant() {
  const dispatch = useDispatch();
  const { messages, isLoading, suggestions } = useSelector(
    (state) => state.aiAssistant
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    dispatch(loadChatHistory());
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    dispatch(
      addMessage({
        role: "user",
        content: userMessage,
      })
    );

    // Simulate AI thinking
    dispatch(setLoading(true));

    dispatch(askAI(userMessage));
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    dispatch(clearChatHistory());
  };

  return (
    <div style={styles.pageWrapper}>
      <Container fluid className="py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Row className="mb-4">
            <Col>
              <div style={styles.header}>
                <div style={styles.headerIcon}>
                  <BsRobot size={32} />
                </div>
                <div>
                  <h1 style={styles.title}>AI Legal Assistant</h1>
                  <p style={styles.subtitle}>
                    <BsStars className="me-2" />
                    Powered by Advanced Legal AI • Available 24/7
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </motion.div>

        <Row>
          {/* Main Chat Area */}
          <Col lg={8} className="mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card style={styles.chatCard}>
                {/* Chat Header */}
                <Card.Header style={styles.chatHeader}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div style={styles.statusDot}></div>
                      <span style={styles.statusText}>AI Assistant Online</span>
                    </div>
                    <Button
                      variant="link"
                      onClick={handleClearChat}
                      style={styles.clearButton}
                    >
                      <FiTrash2 className="me-2" />
                      Clear Chat
                    </Button>
                  </div>
                </Card.Header>

                {/* Messages Area */}
                <Card.Body style={styles.messagesArea}>
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={styles.emptyState}
                    >
                      <div style={styles.emptyIcon}>
                        <FiMessageSquare size={48} />
                      </div>
                      <h4 style={styles.emptyTitle}>Start a Conversation</h4>
                      <p style={styles.emptyText}>
                        Ask me anything about legal procedures, case analysis,
                        document review, or legal research.
                      </p>
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          style={{
                            ...styles.messageWrapper,
                            justifyContent:
                              message.role === "user"
                                ? "flex-end"
                                : "flex-start",
                          }}
                        >
                          {message.role === "assistant" && (
                            <div style={styles.avatarWrapper}>
                              <BsRobot size={20} />
                            </div>
                          )}
                          <div
                            style={{
                              ...styles.messageBubble,
                              ...(message.role === "user"
                                ? styles.userMessage
                                : styles.assistantMessage),
                            }}
                          >
                            <div style={styles.messageContent}>
                              {message.content.split("\n").map((line, i) => (
                                <React.Fragment key={i}>
                                  {line.startsWith("**") &&
                                  line.endsWith("**") ? (
                                    <strong>{line.replace(/\*\*/g, "")}</strong>
                                  ) : line.startsWith("- ") ? (
                                    <div style={styles.listItem}>
                                      • {line.substring(2)}
                                    </div>
                                  ) : (
                                    line
                                  )}
                                  {i <
                                    message.content.split("\n").length - 1 && (
                                    <br />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                            <div style={styles.messageTime}>
                              <FiClock size={12} className="me-1" />
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                          </div>
                          {message.role === "user" && (
                            <div style={styles.userAvatarWrapper}>👤</div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={styles.typingIndicator}
                    >
                      <div style={styles.avatarWrapper}>
                        <BsRobot size={20} />
                      </div>
                      <div style={styles.typingBubble}>
                        <div style={styles.typingDots}>
                          <span
                            style={{ ...styles.dot, animationDelay: "0s" }}
                          ></span>
                          <span
                            style={{ ...styles.dot, animationDelay: "0.2s" }}
                          ></span>
                          <span
                            style={{ ...styles.dot, animationDelay: "0.4s" }}
                          ></span>
                        </div>
                        <span style={styles.typingText}>AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </Card.Body>

                {/* Input Area */}
                <Card.Footer style={styles.inputArea}>
                  <Form onSubmit={handleSendMessage} className="d-flex gap-3">
                    <Form.Control
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about your legal case..."
                      style={styles.input}
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      style={styles.sendButton}
                      disabled={!input.trim() || isLoading}
                    >
                      {isLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FiSend size={20} />
                      )}
                    </Button>
                  </Form>
                </Card.Footer>
              </Card>
            </motion.div>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Quick Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card style={styles.sideCard} className="mb-4">
                <Card.Header style={styles.sideCardHeader}>
                  <BsLightbulb className="me-2" />
                  Quick Suggestions
                </Card.Header>
                <Card.Body style={styles.sideCardBody}>
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={styles.suggestionButton}
                    >
                      <FiZap style={styles.suggestionIcon} />
                      <span>{suggestion}</span>
                    </motion.button>
                  ))}
                </Card.Body>
              </Card>
            </motion.div>

            {/* Capabilities Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card style={styles.sideCard}>
                <Card.Header style={styles.sideCardHeader}>
                  <FiCpu className="me-2" />
                  AI Capabilities
                </Card.Header>
                <Card.Body style={styles.sideCardBody}>
                  <div style={styles.capabilityList}>
                    {[
                      {
                        icon: "📋",
                        title: "Case Analysis",
                        desc: "Deep analysis of case merits",
                      },
                      {
                        icon: "📚",
                        title: "Legal Research",
                        desc: "Precedent and statute lookup",
                      },
                      {
                        icon: "📝",
                        title: "Document Review",
                        desc: "Contract and agreement analysis",
                      },
                      {
                        icon: "⚖️",
                        title: "Risk Assessment",
                        desc: "Evaluate litigation risks",
                      },
                      {
                        icon: "💡",
                        title: "Strategy Suggestions",
                        desc: "Tactical recommendations",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        style={styles.capabilityItem}
                      >
                        <span style={styles.capabilityIcon}>{item.icon}</span>
                        <div>
                          <div style={styles.capabilityTitle}>{item.title}</div>
                          <div style={styles.capabilityDesc}>{item.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card.Body>
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
    padding: "20px 0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "10px",
  },
  headerIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "4px",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "14px",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  chatCard: {
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "24px",
    overflow: "hidden",
    height: "calc(100vh - 200px)",
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    background: "rgba(255, 255, 255, 0.05)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "16px 24px",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#10b981",
    marginRight: "10px",
    boxShadow: "0 0 10px #10b981",
    animation: "pulse 2s infinite",
  },
  statusText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    fontWeight: "500",
  },
  clearButton: {
    color: "rgba(255, 255, 255, 0.6)",
    textDecoration: "none",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: "10px",
    transition: "all 0.2s ease",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
    padding: "40px",
  },
  emptyIcon: {
    width: "100px",
    height: "100px",
    borderRadius: "30px",
    background: "rgba(102, 126, 234, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#667eea",
    marginBottom: "24px",
  },
  emptyTitle: {
    color: "white",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "16px",
    maxWidth: "400px",
  },
  messageWrapper: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  avatarWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    flexShrink: 0,
  },
  userAvatarWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "16px 20px",
    borderRadius: "20px",
  },
  userMessage: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderBottomRightRadius: "6px",
  },
  assistantMessage: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f8fafc",
    borderBottomLeftRadius: "6px",
  },
  messageContent: {
    fontSize: "15px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  listItem: {
    marginLeft: "8px",
    marginBottom: "4px",
  },
  messageTime: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  typingBubble: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "16px 20px",
    borderRadius: "20px",
    borderBottomLeftRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#667eea",
    animation: "bounce 1.4s infinite ease-in-out both",
  },
  typingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "14px",
  },
  inputArea: {
    background: "rgba(255, 255, 255, 0.05)",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "20px 24px",
  },
  input: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.08)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "16px 20px",
    color: "#f8fafc",
    fontSize: "15px",
  },
  sendButton: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  sideCard: {
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    overflow: "hidden",
  },
  sideCardHeader: {
    background: "rgba(255, 255, 255, 0.05)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "16px 20px",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
  },
  sideCardBody: {
    padding: "16px",
  },
  suggestionButton: {
    width: "100%",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "14px 16px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
    transition: "all 0.2s ease",
  },
  suggestionIcon: {
    color: "#667eea",
    flexShrink: 0,
  },
  capabilityList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  capabilityItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  capabilityIcon: {
    fontSize: "24px",
  },
  capabilityTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  capabilityDesc: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "12px",
  },
};

// Add keyframes for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AIAssistant;
