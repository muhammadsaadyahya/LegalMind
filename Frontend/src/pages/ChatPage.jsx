import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  initializeSocket,
  disconnectSocket,
  addMessage,
  fetchChatMessages,
} from "../features/chatSlice";
import { fetchCases } from "./../features/casesSlice";

export function ChatPage() {
  const [text, setText] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const socketRef = useRef(null);
  const previousCaseIdRef = useRef(null);
  const messages = useSelector((state) => state.chat.messages);
  const participants = useSelector((state) => state.chat.participants);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const cases = useSelector((state) => state.cases.items);

  const filteredCases = cases;

  // Initialize socket connection
  useEffect(() => {
    dispatch(fetchCases());

    if (currentUser) {
      const socket = initializeSocket(currentUser._id);
      socketRef.current = socket;

      socket.on("newMessage", (message) => {
        dispatch(addMessage(message));
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [currentUser, dispatch]);

  // Join chat room when case is selected and leave previous room
  useEffect(() => {
    if (selectedCaseId && socketRef.current && currentUser) {
      const userId = currentUser.id || currentUser._id;

      // Leave previous chat room if exists
      if (
        previousCaseIdRef.current &&
        previousCaseIdRef.current !== selectedCaseId
      ) {
        socketRef.current.emit("leaveChat", {
          caseId: previousCaseIdRef.current,
          userId,
        });
      }
      // Fetch messages for the selected case
      dispatch(fetchChatMessages(selectedCaseId));

      // Join new chat room
      socketRef.current.emit("joinChat", { caseId: selectedCaseId, userId });
      previousCaseIdRef.current = selectedCaseId;
    }
  }, [selectedCaseId, currentUser, dispatch]);

  // Set initial selected case
  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id || cases[0]._id);
    }
  }, [cases]);

  const handleSend = () => {
    if (!text.trim() || !socketRef.current) return;

    const userId = currentUser?.id || currentUser?._id;
    socketRef.current.emit("sendMessage", {
      caseId: selectedCaseId,
      userId: userId,
      message: text,
    });

    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Messaging</h1>

      <div style={styles.content}>
        {/* Cases Sidebar */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Conversations</h3>
          <div style={styles.casesList}>
            {filteredCases.map((c) => {
              const caseId = c.id || c._id;
              return (
                <div
                  key={caseId}
                  onClick={() => setSelectedCaseId(caseId)}
                  style={{
                    ...styles.caseItem,
                    ...(selectedCaseId === caseId && styles.caseItemActive),
                  }}
                >
                  <div style={styles.caseName}>{c.title}</div>
                  <div style={styles.caseClient}>
                    {c.clientId?.fullName || c.client || "Client"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {selectedCase && (
            <>
              <div style={styles.chatHeader}>
                <div>
                  <h2 style={styles.chatTitle}>{selectedCase.title}</h2>
                  <p style={styles.chatSubtitle}>
                    {selectedCase.clientId.fullName}
                  </p>
                </div>
              </div>

              <div style={styles.messagesContainer}>
                {messages.map((m, index) => {
                  // Find sender from participants
                  const senderId =
                    typeof m.senderId === "string"
                      ? m.senderId
                      : m.senderId?._id;
                  const sender = participants.find((p) => p._id === senderId);
                  const isOwnMessage =
                    senderId === (currentUser?.id || currentUser?._id);
                  const senderName = sender?.fullName || "User";
                  const messageText = m.message || "";
                  const messageTime = m.sentAt;

                  return (
                    <div
                      key={m._id || m.id || index}
                      style={{
                        ...styles.message,
                        ...(isOwnMessage
                          ? styles.messageOwn
                          : styles.messageOther),
                      }}
                    >
                      <div style={styles.messageLabel}>
                        <strong>{senderName}</strong>{" "}
                        <span style={styles.messageTime}>
                          {new Date(messageTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={styles.messageText}>{messageText}</div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.composer}>
                <textarea
                  style={styles.input}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message... (Shift+Enter for new line)"
                  rows={3}
                />
                <button style={styles.sendButton} onClick={handleSend}>
                  Send Message
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "100%",
    margin: "0 auto",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    minHeight: "100vh",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "white",
    margin: "0 0 24px 0",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "24px",
    height: "calc(100vh - 150px)",
    maxWidth: "1600px",
    margin: "0 auto",
  },
  sidebar: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 16px 0",
  },
  casesList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
  },
  caseItem: {
    padding: "12px 14px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  caseItemActive: {
    background: "rgba(102, 126, 234, 0.2)",
    borderLeft: "4px solid #667eea",
    border: "1px solid rgba(102, 126, 234, 0.3)",
  },
  caseName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "white",
  },
  caseClient: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: "4px",
  },
  chatArea: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  chatHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(102, 126, 234, 0.1)",
  },
  chatTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "white",
    margin: "0 0 4px 0",
  },
  chatSubtitle: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.5)",
    margin: "0",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    background: "rgba(0, 0, 0, 0.2)",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "12px",
    maxWidth: "70%",
  },
  messageOwn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    alignSelf: "flex-end",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  messageOther: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    alignSelf: "flex-start",
  },
  messageLabel: {
    fontSize: "11px",
    opacity: 0.7,
    marginBottom: "6px",
    fontWeight: "600",
  },
  messageTime: {
    fontSize: "10px",
    opacity: 0.6,
  },
  messageText: {
    fontSize: "14px",
    lineHeight: "1.5",
  },
  typingIndicator: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.5)",
    fontStyle: "italic",
    padding: "10px 16px",
  },
  composer: {
    padding: "20px 24px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    gap: "14px",
    flexDirection: "column",
    background: "rgba(102, 126, 234, 0.05)",
  },
  input: {
    padding: "14px 16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    resize: "none",
    minHeight: "70px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "white",
  },
  sendButton: {
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.2s ease",
  },
};
