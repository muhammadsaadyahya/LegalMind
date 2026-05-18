import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, updateUserAvatar } from "../features/authSlice";

export function SettingsPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateUserProfile(profileData)).unwrap();
      alert("Profile updated successfully");
    } catch (error) {
      alert("Failed to update profile: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      alert("Please select an image");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      await dispatch(updateUserAvatar(formData)).unwrap();
      alert("Avatar updated successfully");
      setAvatarFile(null);
    } catch (error) {
      alert("Failed to update avatar: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>

      <div style={styles.content}>
        {/* Profile Settings */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile Information</h2>
          <form onSubmit={handleProfileUpdate} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Avatar Settings */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile Picture</h2>
          <form onSubmit={handleAvatarUpdate} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Upload New Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                style={styles.fileInput}
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Uploading..." : "Update Picture"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "white",
    marginBottom: "24px",
  },
  content: {
    maxWidth: "800px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "white",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "white",
    fontSize: "14px",
  },
  fileInput: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "white",
    fontSize: "14px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "fit-content",
  },
};
