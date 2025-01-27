import { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase-config";
import { motion } from "framer-motion";
import { FaUserCircle, FaSignOutAlt, FaChartBar, FaClipboardList, FaCog, FaTachometerAlt, FaPlusCircle } from "react-icons/fa"; // Added new icons
import "./admin-page.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const signUserOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown state
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="header">
        <div className="logo-container">
          <img src="/src/svg/new-mainlogo.svg" alt="Wildcats Express Logo" className="logo" />
          <h1>Wildcats Express</h1>
        </div>

        {/* Profile Section with Dropdown */}
        <div className="profile-section" onClick={toggleDropdown}>
          <img
            src="./public/cat_profile.svg" // Replace with admin's profile photo
            alt="Admin"
            className="profile-photo"
          />
          <span className="profile-name">Admin</span>

          {/* Dropdown Menu with Animation */}
          {isDropdownOpen && (
            <motion.div
              className="dropdown-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="dropdown-item" onClick={() => handleTabChange("adminReports")}>
                <FaClipboardList /> Admin Reports
              </div>
              <div className="dropdown-item" onClick={() => handleTabChange("analytics")}>
                <FaChartBar /> Analytics
              </div>
              <div className="dropdown-item" onClick={() => handleTabChange("settings")}>
                <FaCog /> Settings
              </div>
              <div className="dropdown-item" onClick={signUserOut}>
                <FaSignOutAlt /> Sign Out
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <nav>
          <button
            onClick={() => handleTabChange("dashboard")}
            className={activeTab === "dashboard" ? "active" : ""}
          >
            <FaTachometerAlt className="dashboard-icon"/>
          </button>
          <button
            onClick={() => handleTabChange("addMenu")}
            className={activeTab === "addMenu" ? "active" : ""}
          >
            <FaPlusCircle className="addmenu-icon" />
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="main-content-admin">
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === "dashboard" ? (
            <div className="dashboard">
              <h2>Welcome, Admin!</h2>
              <p>Every customer counts. Let’s serve them better today!</p>
              {/* Dashboard content */}
            </div>
          ) : activeTab === "addMenu" ? (
            <div className="add-menu">
              <h2>Add Menu</h2>
              {/* Add Menu content */}
            </div>
          ) : activeTab === "adminReports" ? (
            <div className="admin-reports">
              <h2>Admin Reports</h2>
              {/* Admin Reports content */}
            </div>
          ) : activeTab === "analytics" ? (
            <div className="analytics">
              <h2>Analytics</h2>
              {/* Analytics content */}
            </div>
          ) : activeTab === "settings" ? (
            <div className="settings">
              <h2>Settings</h2>
              {/* Settings content */}
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;
