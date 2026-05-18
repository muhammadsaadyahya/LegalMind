import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Navbar as BSNavbar,
  Nav,
  Button,
  Dropdown,
  Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiHome,
  FiFolder,
  FiFileText,
  FiSearch,
  FiMessageSquare,
  FiUsers,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiCpu,
  FiTrendingUp,
  FiBell,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";
import { BsRobot, BsGraphUp, BsLightning, BsStars } from "react-icons/bs";
import { logout } from "../features/authSlice";
import { mockNotifications } from "../mockData";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export function Navbar({ onNavigation, currentPage }) {
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null);

  // Fetch avatar with authorization header
  useEffect(() => {
    const fetchAvatar = async () => {
      if (
        !currentUser?.avatar ||
        currentUser.avatar === "default-avatar-url.jpg"
      ) {
        console.log("⏭️ Skipping avatar fetch - using default");
        setAvatarBlobUrl(null);
        return;
      }

      const userId = currentUser._id || currentUser.id;
      const avatarUrl = `${API_BASE_URL}/api/users/${userId}/avatar`;

      console.log("=== FETCHING AVATAR ===");
      console.log("Avatar URL:", avatarUrl);
      console.log("User ID:", userId);
      console.log("Avatar Value:", currentUser.avatar);

      try {
        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);

        const response = await axios.get(avatarUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        });

        console.log("✅ Avatar fetched successfully");
        console.log("Response type:", response.data.type);
        console.log("Response size:", response.data.size);

        const blobUrl = URL.createObjectURL(response.data);
        setAvatarBlobUrl(blobUrl);
        setAvatarError(false);
      } catch (error) {
        console.error("❌ Avatar fetch failed:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        setAvatarError(true);
        setAvatarBlobUrl(null);
      }
    };

    fetchAvatar();

    // Cleanup blob URL on unmount or when user changes
    return () => {
      if (avatarBlobUrl) {
        URL.revokeObjectURL(avatarBlobUrl);
      }
    };
  }, [currentUser]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navItems = {
    lawyer: [
      { key: "dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
      { key: "cases", label: "Cases", icon: <FiFolder size={18} /> },
      { key: "documents", label: "Documents", icon: <FiFileText size={18} /> },
      { key: "rag", label: "RAG Search", icon: <FiSearch size={18} /> },
      { key: "chat", label: "Chat", icon: <FiMessageSquare size={18} /> },
      {
        key: "ai-assistant",
        label: "AI Assistant",
        icon: <BsRobot size={18} />,
        badge: "AI",
        isNew: true,
      },
      {
        key: "case-predictor",
        label: "Case Predictor",
        icon: <BsGraphUp size={18} />,
        badge: "NEW",
        isNew: true,
      },
    ],
    client: [
      { key: "dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
      { key: "cases", label: "My Cases", icon: <FiFolder size={18} /> },
      { key: "chat", label: "Messages", icon: <FiMessageSquare size={18} /> },
      {
        key: "ai-assistant",
        label: "AI Assistant",
        icon: <BsRobot size={18} />,
        badge: "AI",
        isNew: true,
      },
    ],
    admin: [
      { key: "dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
      { key: "users", label: "Users", icon: <FiUsers size={18} /> },
      { key: "cases", label: "Cases", icon: <FiFolder size={18} /> },
    ],
  };

  const items = navItems[currentUser?.role] || navItems.client;

  // Get notifications for current user role
  const userNotifications = mockNotifications[currentUser?.role] || [];
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <BSNavbar expand="lg" style={styles.navbar} sticky="top">
      <Container fluid style={{ maxWidth: "1600px" }}>
        {/* Brand */}
        <BSNavbar.Brand
          style={styles.brand}
          onClick={() => onNavigation("dashboard")}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.brandWrapper}
          >
            <div style={styles.brandIcon}>
              <BsStars size={24} />
            </div>
            <div>
              <span style={styles.brandText}>LegalMind</span>
              <span style={styles.brandTag}>PRO</span>
            </div>
          </motion.div>
        </BSNavbar.Brand>

        {/* Mobile Toggle */}
        <BSNavbar.Toggle
          aria-controls="navbar-nav"
          style={styles.toggle}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <FiMenu size={24} color="white" />
        </BSNavbar.Toggle>

        {/* Navigation */}
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="mx-auto" style={styles.navContainer}>
            {items.map((item) => (
              <motion.div
                key={item.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Nav.Link
                  onClick={() => onNavigation(item.key)}
                  style={{
                    ...styles.navLink,
                    ...(currentPage === item.key ? styles.navLinkActive : {}),
                  }}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span style={styles.navLabel}>{item.label}</span>
                  {item.isNew && (
                    <Badge
                      style={{
                        ...styles.navBadge,
                        background:
                          item.badge === "AI"
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      }}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {currentPage === item.key && (
                    <motion.div
                      layoutId="activeTab"
                      style={styles.activeIndicator}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Nav.Link>
              </motion.div>
            ))}
          </Nav>

          {/* Right Section */}
          <div style={styles.rightSection}>
            {/* Notifications */}
            <Dropdown align="end">
              <Dropdown.Toggle as="div" style={{ cursor: "pointer" }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button variant="link" style={styles.iconButton}>
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <Badge
                        pill
                        bg="danger"
                        style={{
                          position: "absolute",
                          top: "-2px",
                          right: "-2px",
                          fontSize: "10px",
                          minWidth: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              </Dropdown.Toggle>

              <Dropdown.Menu style={styles.notificationMenu}>
                <div style={styles.notificationHeader}>
                  <span style={styles.notificationTitle}>Notifications</span>
                  {unreadCount > 0 && (
                    <Badge bg="primary">{unreadCount} new</Badge>
                  )}
                </div>
                <Dropdown.Divider style={styles.dropdownDivider} />
                <div style={styles.notificationList}>
                  {userNotifications.length > 0 ? (
                    userNotifications.map((notif) => (
                      <Dropdown.Item
                        key={notif.id}
                        style={{
                          ...styles.notificationItem,
                          background: notif.read
                            ? "transparent"
                            : "rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <div style={styles.notificationIcon}>{notif.icon}</div>
                        <div style={styles.notificationContent}>
                          <div style={styles.notificationItemTitle}>
                            {notif.title}
                          </div>
                          <div style={styles.notificationMessage}>
                            {notif.message}
                          </div>
                          <div style={styles.notificationTime}>
                            {new Date(notif.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {notif.priority === "high" && (
                          <Badge bg="danger" style={{ fontSize: "10px" }}>
                            !
                          </Badge>
                        )}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <div style={styles.noNotifications}>No notifications</div>
                  )}
                </div>
              </Dropdown.Menu>
            </Dropdown>

            {/* User Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle as="div" style={styles.userDropdown}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  style={styles.userWrapper}
                >
                  <div style={styles.userAvatar}>
                    {!currentUser?.avatar ||
                    currentUser.avatar === "default-avatar-url.jpg" ||
                    avatarError ||
                    !avatarBlobUrl ? (
                      "👤"
                    ) : (
                      <img
                        src={avatarBlobUrl}
                        alt="User Avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "10px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <div style={styles.userInfo}>
                    <span style={styles.userName}>{currentUser?.name}</span>
                    <span style={styles.userRole}>{currentUser?.role}</span>
                  </div>
                </motion.div>
              </Dropdown.Toggle>

              <Dropdown.Menu style={styles.dropdownMenu}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropdownAvatar}>
                    {!currentUser?.avatar ||
                    currentUser.avatar === "default-avatar-url.jpg" ||
                    avatarError ||
                    !avatarBlobUrl ? (
                      "👤"
                    ) : (
                      <img
                        src={avatarBlobUrl}
                        alt="User Avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "12px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div style={styles.dropdownName}>{currentUser?.name}</div>
                    <div style={styles.dropdownEmail}>{currentUser?.email}</div>
                  </div>
                </div>
                <Dropdown.Divider style={styles.dropdownDivider} />
                <Dropdown.Item
                  style={styles.dropdownItem}
                  onClick={() => onNavigation("settings")}
                >
                  <FiSettings size={16} className="me-2" />
                  Settings
                </Dropdown.Item>
                <Dropdown.Item style={styles.dropdownItem}>
                  <FiHelpCircle size={16} className="me-2" />
                  Help Center
                </Dropdown.Item>
                <Dropdown.Divider style={styles.dropdownDivider} />
                <Dropdown.Item
                  onClick={handleLogout}
                  style={styles.dropdownItemLogout}
                >
                  <FiLogOut size={16} className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

const styles = {
  navbar: {
    background: "rgba(15, 12, 41, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
    padding: "12px 24px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  brand: {
    cursor: "pointer",
  },
  brandWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  brandText: {
    fontSize: "22px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  brandTag: {
    fontSize: "10px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    marginLeft: "8px",
    verticalAlign: "super",
  },
  toggle: {
    border: "none",
    padding: "8px",
  },
  navContainer: {
    display: "flex",
    gap: "4px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "12px",
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    position: "relative",
  },
  navLinkActive: {
    color: "white",
    background: "rgba(102, 126, 234, 0.2)",
  },
  navIcon: {
    display: "flex",
    alignItems: "center",
  },
  navLabel: {
    whiteSpace: "nowrap",
  },
  navBadge: {
    fontSize: "9px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
    marginLeft: "4px",
    color: "white",
  },
  activeIndicator: {
    position: "absolute",
    bottom: "0",
    left: "50%",
    transform: "translateX(-50%)",
    width: "30px",
    height: "3px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "3px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  iconButton: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255, 255, 255, 0.7)",
    position: "relative",
    padding: 0,
    textDecoration: "none",
  },
  notificationDot: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#ef4444",
    border: "2px solid rgba(15, 12, 41, 0.95)",
  },
  userDropdown: {
    cursor: "pointer",
  },
  userWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "6px 12px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "1.2",
  },
  userRole: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "11px",
    textTransform: "capitalize",
  },
  dropdownMenu: {
    background: "rgba(30, 30, 50, 0.98)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "8px",
    marginTop: "12px",
    minWidth: "240px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    marginBottom: "8px",
  },
  dropdownAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  dropdownName: {
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
  },
  dropdownEmail: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "12px",
  },
  dropdownDivider: {
    borderColor: "rgba(255, 255, 255, 0.1)",
    margin: "8px 0",
  },
  dropdownItem: {
    color: "rgba(255, 255, 255, 0.8)",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  dropdownItemLogout: {
    color: "#f87171",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  notificationMenu: {
    background: "rgba(30, 30, 50, 0.98)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "0",
    marginTop: "12px",
    minWidth: "380px",
    maxWidth: "400px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  notificationTitle: {
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
  },
  notificationList: {
    maxHeight: "400px",
    overflowY: "auto",
  },
  notificationItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "background 0.2s",
  },
  notificationIcon: {
    fontSize: "24px",
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationItemTitle: {
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  notificationMessage: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "13px",
    lineHeight: "1.4",
    marginBottom: "6px",
  },
  notificationTime: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "11px",
  },
  noNotifications: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "14px",
    textAlign: "center",
    padding: "40px 20px",
  },
};

export default Navbar;
