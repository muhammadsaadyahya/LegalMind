import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Card, ProgressBar, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiFolder,
  FiCheckCircle,
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiActivity,
} from "react-icons/fi";
import { BsGraphUp, BsLightning, BsBell, BsStars } from "react-icons/bs";
import { mockReminders, mockActivityLog, mockCases } from "../mockData";
import { fetchCases } from "../features/casesSlice";

export function LawyerDashboard() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const cases = useSelector((state) => state.cases.items);

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  const currentUserId = currentUser?.id || currentUser?._id;
  const myCases =
    currentUser?.role === "client"
      ? cases.filter((c) => (c.clientId?._id || c.clientId) === currentUserId)
      : cases.filter((c) => (c.lawyerId?._id || c.lawyerId) === currentUserId);

  const upcomingReminders = mockReminders
    .filter((r) => !r.completed)
    .slice(0, 5);
  const recentActivity = mockActivityLog.slice(0, 8);

  const stats = {
    activeCases: myCases.filter((c) => c.status !== "Closed").length,
    closedCases: myCases.filter((c) => c.status === "Closed").length,
    totalAmount:
      myCases.length * (2500 + Math.floor(Math.random() * 201) - 100),
    pendingDeadlines: myCases.filter((c) => c.status !== "Closed").length,
  };

  const statsData = [
    {
      icon: <FiFolder size={28} />,
      value: stats.activeCases,
      label: "Active Cases",
      color: "#667eea",
      bgGradient:
        "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
    },
    {
      icon: <FiCheckCircle size={28} />,
      value: stats.closedCases,
      label: "Closed Cases",
      color: "#10b981",
      bgGradient:
        "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)",
    },
    {
      icon: <FiDollarSign size={28} />,
      value: `$${stats.totalAmount.toLocaleString()}`,
      label: "Total Value",
      color: "#f59e0b",
      bgGradient:
        "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%)",
    },
    {
      icon: <FiClock size={28} />,
      value: stats.pendingDeadlines,
      label: "Pending Deadlines",
      color: "#ef4444",
      bgGradient:
        "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(248, 113, 113, 0.2) 100%)",
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      "In Progress": "#ffffff",
      Discovery: "#f59e0b",
      Closed: "#fff",
      "On Hold": "#ffffff",
    };
    return colors[status] || "#6b7280";
  };

  const getReminderIcon = (type) => {
    const icons = {
      hearing: "⚖️",
      deadline: "📌",
      meeting: "👥",
      mediation: "🤝",
    };
    return icons[type] || "📅";
  };

  return (
    <div style={styles.pageWrapper}>
      <Container fluid className="py-4" style={{ maxWidth: "1600px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Row className="mb-4">
            <Col>
              <div style={styles.welcomeSection}>
                <div>
                  <h1 style={styles.welcomeTitle}>
                    Welcome back,{" "}
                    {currentUser?.name?.split(" ")[1] || "Counselor"}!
                    <BsStars style={{ marginLeft: "12px", color: "#fbbf24" }} />
                  </h1>
                  <p style={styles.welcomeSubtitle}>
                    {currentUser?.specialization} • Here's your daily overview
                  </p>
                </div>
                <div style={styles.dateDisplay}>
                  <FiCalendar style={{ marginRight: "8px" }} />
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </Col>
          </Row>
        </motion.div>

        {/* Stats Grid */}
        <Row className="mb-4">
          {statsData.map((stat, index) => (
            <Col lg={3} md={6} className="mb-3" key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card style={styles.statCard}>
                  <Card.Body className="d-flex align-items-center gap-4">
                    <div
                      style={{
                        ...styles.statIcon,
                        background: stat.bgGradient,
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <div style={styles.statValue}>{stat.value}</div>
                      <div style={styles.statLabel}>{stat.label}</div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Main Content */}
        <Row>
          {/* Cases Section */}
          <Col lg={8} className="mb-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card style={styles.sectionCard}>
                <Card.Header style={styles.sectionHeader}>
                  <div className="d-flex align-items-center">
                    <BsGraphUp className="me-2" size={20} />
                    <span>My Active Cases</span>
                  </div>
                  <Badge style={styles.headerBadge}>
                    {myCases.length} Total
                  </Badge>
                </Card.Header>
                <Card.Body style={{ padding: "20px" }}>
                  <Row>
                    {myCases.slice(0, 4).map((c, index) => {
                      const caseProgress = c.progress || 25;
                      const caseAmount =
                        c.amount || Math.floor(Math.random() * 5000) + 2000;

                      return (
                        <Col md={6} key={c._id || c.id} className="mb-3">
                          <motion.div
                            whileHover={{ scale: 1.02, y: -3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div style={styles.caseCard}>
                              <div style={styles.caseHeader}>
                                <h5 style={styles.caseTitle}>{c.title}</h5>
                                <Badge
                                  style={{
                                    ...styles.statusBadge,
                                    background: `${getStatusColor(c.status)}20`,
                                    color: getStatusColor(c.status),
                                    border: `1px solid ${getStatusColor(
                                      c.status
                                    )}40`,
                                  }}
                                >
                                  {c.status}
                                </Badge>
                              </div>
                              <p style={styles.caseClient}>
                                {c.clientId?.fullName || c.client}
                              </p>
                              <div style={styles.progressSection}>
                                <div style={styles.progressInfo}>
                                  <span>Progress</span>
                                  <span style={styles.progressPercent}>
                                    {caseProgress}%
                                  </span>
                                </div>
                                <ProgressBar
                                  now={caseProgress}
                                  style={styles.progressBar}
                                  variant="info"
                                />
                              </div>
                              <div style={styles.caseFooter}>
                                <span>
                                  <FiCalendar size={12} />{" "}
                                  {c.nextHearing || "No hearing"}
                                </span>
                                <span style={styles.caseAmount}>
                                  ${caseAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* Right Sidebar */}
          <Col lg={4}>
            {/* Reminders */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-4"
            >
              <Card style={styles.sectionCard}>
                <Card.Header style={styles.sectionHeader}>
                  <div className="d-flex align-items-center">
                    <BsBell className="me-2" size={20} />
                    <span>Upcoming Reminders</span>
                  </div>
                </Card.Header>
                <Card.Body style={{ padding: "16px" }}>
                  {upcomingReminders.map((r, index) => (
                    <motion.div
                      key={r.id}
                      whileHover={{ x: 5 }}
                      style={styles.reminderItem}
                    >
                      <div style={styles.reminderIcon}>
                        {getReminderIcon(r.type)}
                      </div>
                      <div style={styles.reminderContent}>
                        <div style={styles.reminderTitle}>{r.title}</div>
                        <div style={styles.reminderDate}>{r.date}</div>
                      </div>
                      <Badge
                        style={{
                          background:
                            r.priority === "high"
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(245, 158, 11, 0.2)",
                          color: r.priority === "high" ? "#ef4444" : "#f59e0b",
                          fontSize: "10px",
                          padding: "4px 8px",
                        }}
                      >
                        {r.priority}
                      </Badge>
                    </motion.div>
                  ))}
                </Card.Body>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card style={styles.sectionCard}>
                <Card.Header style={styles.sectionHeader}>
                  <div className="d-flex align-items-center">
                    <FiActivity className="me-2" size={20} />
                    <span>Recent Activity</span>
                  </div>
                </Card.Header>
                <Card.Body style={{ padding: "16px" }}>
                  {recentActivity.slice(0, 5).map((a, index) => (
                    <motion.div
                      key={a.id}
                      whileHover={{ x: 5 }}
                      style={styles.activityItem}
                    >
                      <div style={styles.activityDot}></div>
                      <div style={styles.activityContent}>
                        <div style={styles.activityText}>
                          <strong>{a.action}</strong>: {a.detail}
                        </div>
                        <div style={styles.activityMeta}>
                          {a.user} •{" "}
                          {new Date(a.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
  welcomeSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
  },
  welcomeSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "16px",
    margin: 0,
  },
  dateDisplay: {
    background: "rgba(255, 255, 255, 0.08)",
    padding: "12px 20px",
    borderRadius: "12px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  statIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "white",
    lineHeight: "1.2",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "14px",
    fontWeight: "500",
  },
  sectionCard: {
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    overflow: "hidden",
  },
  sectionHeader: {
    background: "rgba(255, 255, 255, 0.05)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "16px 20px",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBadge: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontSize: "12px",
    padding: "6px 12px",
  },
  caseCard: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    height: "100%",
    transition: "all 0.3s ease",
  },
  caseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    gap: "12px",
  },
  caseTitle: {
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    margin: 0,
    flex: 1,
  },
  statusBadge: {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "600",
  },
  caseClient: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "13px",
    marginBottom: "16px",
  },
  progressSection: {
    marginBottom: "16px",
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
  },
  progressPercent: {
    color: "#667eea",
    fontWeight: "700",
  },
  progressBar: {
    height: "6px",
    borderRadius: "3px",
    background: "rgba(255, 255, 255, 0.1)",
  },
  caseFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.5)",
  },
  caseAmount: {
    color: "#10b981",
    fontWeight: "700",
  },
  reminderItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  reminderIcon: {
    fontSize: "24px",
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
  },
  reminderDate: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "11px",
  },
  activityItem: {
    display: "flex",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activityDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    marginTop: "6px",
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "13px",
    marginBottom: "4px",
  },
  activityMeta: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: "11px",
  },
};

export default LawyerDashboard;
