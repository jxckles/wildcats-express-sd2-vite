import { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, redirectToLoginIfLoggedOut } from "../../config/firebase-config";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt, FaChartBar, FaClipboardList, FaCog } from "react-icons/fa";
import {LuTrello, LuHandPlatter, LuPlus} from "react-icons/lu";
import { CiImageOff } from "react-icons/ci";
import catLogo from "/new-mainlogo.svg"; 
import catProfile from "/cat_profile.svg"; 
import { ToastContainer } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";
import "./admin-page.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    image: "",
    price: 0,
    quantity: 0,
  });

  const navigate = useNavigate();

  redirectToLoginIfLoggedOut(navigate);

  const signUserOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };
  
  const openModal = () => {
    setNewMenuItem({
      name: "",
      image: "",
      price: 0,
      quantity: 0,
    });
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    // Optionally, reset the form fields when closing the modal
    setNewMenuItem({
      name: "",
      image: "",
      price: 0,
      quantity: 0,
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMenuItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addMenuItem(newMenuItem);
    closeModal(); // Close modal after submitting
  };

  const addMenuItem = (newItem) => {
    setMenuItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      // Sort the items alphabetically by name
      updatedItems.sort((a, b) => a.name.localeCompare(b.name));
      return updatedItems;
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMenuItem((prevState) => ({
        ...prevState,
        image: file, // Store the image file
      }));
    }
  };
  
  const handleDelete = (index) => {
    // Remove the item at the given index
    setMenuItems((prevItems) => {
      const updatedItems = prevItems.filter((_, i) => i !== index);
      return updatedItems;
    });
  };
  


// Add menu component
const renderAddmenu = () => (
  <div className="add-menu-container">
    <button onClick={openModal} className="add-menu-button">
      Add New Menu
    </button>

    {/* Modal for adding/editing item */}
    {isModalOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <h2>{newMenuItem._id ? "Edit Item" : "Add New Item"}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={newMenuItem.name}
              onChange={handleInputChange}
              placeholder="Item Name"
              required
            />
            <input
              type="number"
              name="price"
              value={newMenuItem.price}
              onChange={handleInputChange}
              placeholder="Price"
              min="0"
              step="0.01"
              required
            />
            <input
              type="number"
              name="quantity"
              value={newMenuItem.quantity}
              onChange={handleInputChange}
              placeholder="Quantity"
              min="0"
              step="1"
              required
            />
            <div className="file-input-container">
            <label htmlFor="image">Choose Image:</label>
            <input
              className="input-image"
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}  // Handle image change
              accept="image/*"
            />
          </div>

          {/* Show image preview */}
          {newMenuItem.image && (
            <div className="image-preview">
              <img
                src={URL.createObjectURL(newMenuItem.image)} // Create a preview URL for the image
                alt="Preview"
                className="image-preview-img"
              />
              <p>{newMenuItem.image.name}</p> {/* Display the image file name */}
            </div>
          )}

            {newMenuItem.image && (
              <p className="file-name">Selected file: {newMenuItem.image.name}</p>
            )}
            <div className="modal-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);

//Render menu items
const renderMenuItems = () => (
  <>
    <div className="menu-items">
    {menuItems.map((item, index) => (
      <div key={index} className="menu-item">
        <div className="menu-image-container">
        {item.image ? (
          <img
            src={URL.createObjectURL(item.image)}  // Preview the uploaded image
            alt={item.name}
            className="menu-image"
          />
        ) : (
          <div className="menu-image-placeholder"><CiImageOff className="no-image-icon"/></div>
        )}
        </div>
        <div className="menu-details">
          <div className="menu-name">{item.name}</div>
          <div className="menu-price">
            Php {Number(item.price).toFixed(2)}
          </div>
          <div className="menu-quantity">Quantity: {item.quantity}</div>
        </div>
        <div className="menu-actions">
          <button
            className="action-link"
            >
            edit
          </button>
          <button
            className="action-link"
            onClick={() => handleDelete(index)}
            >
            delete
          </button>
        </div>
      </div>
    ))}
   </div>
  </>
);



  // Render admin Page
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
          <img 
            src={catLogo} 
            alt="Wildcats Express Logo" 
            className="logo"       
          />
          <h1>Wildcats Express</h1>
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
                <h3>Welcome, Admin!</h3>
                <br/>
                <h2>Every customer counts. Let's serve them better today!</h2>
                <br/>
                <div>{renderAddmenu()}</div>
                <br/>
                <div>{renderMenuItems()}</div>
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

          <ToastContainer 
            position="top-center"
            autoClose={5500}
            hideProgressBar
            newestOnTop
            closeButton={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{ zIndex: 9999 }}  
          />
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminPage;