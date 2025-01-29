import { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase-config";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt, FaChartBar, FaClipboardList, FaCog } from "react-icons/fa";
import {LuTrello, LuHandPlatter, LuPlus} from "react-icons/lu";
import catLogo from "/new-mainlogo.svg"; 
import catProfile from "/cat_profile.svg"; 
import "./admin-page.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoClicked, setIsLogoClicked] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    setIsLogoClicked(true);
    setTimeout(() => setIsLogoClicked(false), 5000);
  };

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
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <motion.div 
      className="admin-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="header">
        <div className="logo-container">
          <motion.img 
            src={catLogo} 
            alt="Wildcats Express Logo" 
            className="logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoClick}
          />
          <motion.h1
            animate={{
              background: isLogoClicked 
                ? "linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)"
                : "none",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: isLogoClicked ? "transparent" : "white",
              backgroundSize: isLogoClicked ? "100% 100%" : "200% 100%",
              backgroundPosition: isLogoClicked ? "right center" : "left center"
            }}
            transition={{ duration: 4 }}
          >
            Wildcats Express
          </motion.h1>
        </div>

        <div className="profile-section" onClick={toggleDropdown}>
          <img
            src={catProfile}
            alt="Admin"
            className="profile-photo"
          />
          <span className="profile-name">Admin</span>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                className="dropdown-menu"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
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
          </AnimatePresence>
        </div>
      </div>

      <div className="sidebar">
        <nav>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTabChange("dashboard")}
            className={activeTab === "dashboard" ? "active" : ""}
          >
            <LuTrello className="dashboard-icon"/>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTabChange("addMenu")}
            className={activeTab === "addMenu" ? "active" : ""}
          >
            <LuPlus className="addmenu-icon" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTabChange("orders")}
            className={activeTab === "orders" ? "active" : ""}
          >
            <LuHandPlatter className="orders-icon" />
          </motion.button>
        </nav>
      </div>

      <div className="main-content-admin">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "dashboard" && (
              <motion.div 
                className="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2>Welcome, Admin!</h2>
                <br />
                <p>Every customer counts. Let's serve them better today!</p>
              </motion.div>
            )}
            {activeTab === "addMenu" && (
              <motion.div 
                className="add-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2>Add Menu</h2>
              </motion.div>
            )}
            {activeTab === "orders" && (
              <motion.div 
                className="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2>Orders</h2>
              </motion.div>
            )}
            {activeTab === "adminReports" && (
              <motion.div 
                className="admin-reports"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2>Admin Reports</h2>
              </motion.div>
            )}
            {activeTab === "analytics" && (
              <motion.div 
                className="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2>Analytics</h2>
              </motion.div>
            )}
            {activeTab === "settings" && (
              <motion.div 
                className="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2>Settings</h2>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminPage;