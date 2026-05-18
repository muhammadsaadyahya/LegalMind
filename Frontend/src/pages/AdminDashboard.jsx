import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Card, Badge, Table } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiActivity,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { mockUsers, mockCases } from "../mockData";
import { fetchCases } from "../features/casesSlice";
import { fetchUsers, deleteUser } from "../features/usersSlice";

export function AdminDashboard() {
  const dispatch = useDispatch();
  const cases = useSelector((state) => state.cases.items);
  const users = useSelector((state) => state.users.items);

  useEffect(() => {
    dispatch(fetchCases());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        alert("User deleted successfully");
      } catch (error) {
        alert("Failed to delete user: " + error);
      }
    }
  };

  const stats = {
    totalUsers: users.length,
    lawyers: users.filter((u) => u.role === "lawyer").length,
    clients: users.filter((u) => u.role === "client").length,
    totalCases: cases.length,
    activeCases: cases.filter((c) => c.status !== "Closed").length,
    closedCases: cases.filter((c) => c.status === "Closed").length,
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalUsers}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👨‍⚖️</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.lawyers}</div>
              <div style={styles.statLabel}>Lawyers</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👨‍💼</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.clients}</div>
              <div style={styles.statLabel}>Clients</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📋</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalCases}</div>
              <div style={styles.statLabel}>Total Cases</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.activeCases}</div>
              <div style={styles.statLabel}>Active Cases</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✓</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.closedCases}</div>
              <div style={styles.statLabel}>Closed Cases</div>
            </div>
          </div>
        </div>

        <div style={styles.mainContent}>
          {/* Users Table */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Users</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>{u.fullName || u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                      <td>
                        <span style={styles.statusBadge}>Active</span>
                      </td>
                      <td>
                        <button
                          style={{
                            ...styles.actionButton,
                            color: "white",
                            background: "#ef4444",
                            borderColor: "#ef4444",
                          }}
                          onClick={() => handleDeleteUser(u._id || u.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cases Overview */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Cases Overview</h2>
            <div style={styles.caseStatsGrid}>
              <div style={styles.caseStatCard}>
                <div style={styles.caseStatValue}>
                  {cases.filter((c) => c.status === "In Progress").length}
                </div>
                <div style={styles.caseStatLabel}>In Progress</div>
              </div>
              <div style={styles.caseStatCard}>
                <div style={styles.caseStatValue}>
                  {cases.filter((c) => c.status === "Discovery").length}
                </div>
                <div style={styles.caseStatLabel}>Discovery</div>
              </div>
              <div style={styles.caseStatCard}>
                <div style={styles.caseStatValue}>
                  {cases.filter((c) => c.status === "On Hold").length}
                </div>
                <div style={styles.caseStatLabel}>On Hold</div>
              </div>
              <div style={styles.caseStatCard}>
                <div style={styles.caseStatValue}>
                  {cases.filter((c) => c.status === "Closed").length}
                </div>
                <div style={styles.caseStatLabel}>Closed</div>
              </div>
            </div>

            <div style={{ overflowX: "auto", marginTop: "16px" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Case Title</th>
                    <th>Client</th>
                    <th>Lawyer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c._id || c.id}>
                      <td>{c.title}</td>
                      <td>{c.clientId?.fullName || c.client}</td>
                      <td>{c.lawyerId?.fullName || c.lawyer}</td>
                      <td>
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: getStatusColor(c.status),
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>{c.amount || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    "In Progress": "#60a5fa",
    Discovery: "#facc15",
    Closed: "#22c55e",
    "On Hold": "#f97316",
  };
  return colors[status] || "#94a3b8";
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    padding: "20px 0",
  },
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "white",
    margin: "0 0 32px 0",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    gap: "16px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
  },
  statIcon: {
    fontSize: "40px",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  statLabel: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: "4px",
    fontWeight: "600",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "white",
    margin: "0 0 20px 0",
  },
  caseStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "20px",
  },
  caseStatCard: {
    background: "rgba(255, 255, 255, 0.03)",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    textAlign: "center",
  },
  caseStatValue: {
    fontSize: "28px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  caseStatLabel: {
    fontSize: "12px",
    color: "#a5b4fc",
    marginTop: "6px",
    fontWeight: "700",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  },
  actionButton: {
    padding: "6px 12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "11px",
    marginRight: "6px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
    transition: "all 0.2s ease",
  },
};
