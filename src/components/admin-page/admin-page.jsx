import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { redirectToLoginIfLoggedOut, handleLogout, db } from "../../config/firebase-config";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt, FaChartBar, FaClipboardList, FaCog } from "react-icons/fa";
import {LuTrello, LuHandPlatter, LuPlus} from "react-icons/lu";
import { CiImageOff } from "react-icons/ci";
import catLogo from "/new-mainlogo.svg"; 
import catProfile from "/cat_profile.svg"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./admin-page.css";

const AdminPage = () => {
  const navigate = useNavigate();
  const loading = redirectToLoginIfLoggedOut(navigate);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    price: 0,
    quantity: 0,
    image: null,
    _id: null,
    imageURL: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const menuRef = collection(db, "menu");

    const unsubscribe = onSnapshot(menuRef, (querySnapshot) => {
      const menuList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        _id: doc.id,
      }));
      setMenuItems(menuList);
    });
  
    return () => unsubscribe();
  }, []);
   

  if (loading) {
    return <div>Loading...</div>; // Prevent UI from showing unless logged in
  }

  // Open Modal
  const openModal = () => {
    setNewMenuItem({
      name: "",
      price: "",
      quantity: "",
      image: null,
      _id: null,
      imageURL: "",
    });
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
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
  
  // Dont touch this function (yet)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let imageURL = null;
      let publicID = null;
      
      console.log("Checking if image is selected:", newMenuItem.image);
  
      if (newMenuItem.image) {
        console.log("Preparing to upload image to Cloudinary...");
  
        const formData = new FormData();
        formData.append("file", newMenuItem.image);
        formData.append("upload_preset", "wildcats_express_menu");
        formData.append("cloud_name", "dxbkzby8x");
  
        console.log("Uploading image to Cloudinary...");
        const cloudinaryRes = await fetch(
          "https://api.cloudinary.com/v1_1/dxbkzby8x/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        
        if (!cloudinaryRes.ok) {
          throw new Error("Cloudinary upload failed");
        }

        const cloudinaryData = await cloudinaryRes.json();
        console.log("Cloudinary Response:", cloudinaryData);
    
        imageURL = cloudinaryData.secure_url;
        publicID = cloudinaryData.public_id;
        
        console.log("Image URL:", imageURL);
        console.log("Image Public ID:", publicID);
      } else {
        console.log("No image selected.");
      }
  
      const menuRef = collection(db, 'menu');
      console.log("Preparing data for Firestore:", {
        name: newMenuItem.name,
        price: newMenuItem.price,
        quantity: newMenuItem.quantity,
        imageURL: imageURL || "",
        publicID: publicID || "",
      });
  
      const menuItemData = {
        name: newMenuItem.name,
        price: parseFloat(newMenuItem.price),
        quantity: Number(newMenuItem.quantity),
        imageURL: imageURL || "",
        publicID: publicID || "",
      };
  
      if (newMenuItem._id) {
        console.log("Updating existing menu item:", newMenuItem._id);
        const menuDocRef = doc(db, 'menu', newMenuItem._id);
        await updateDoc(menuDocRef, menuItemData);
        console.log("Menu item updated successfully.");
        toast.success("Menu item updated successfully.", {
          autoClose: 5000,
        });
      } else {
        console.log("Adding new menu item.");
        await addDoc(menuRef, menuItemData);
        console.log("New menu item added successfully.");
        toast.success("New menu item added successfully.", {
          autoClose: 5000,
        });
      }
      console.log("Closing modal...");
      closeModal();
    } catch (error) {
      console.error("Error uploading menu item: ", error);
      toast.error("Failed to add menu item", {
        autoClose: 5000,
      });
    }
  }; // Dont touch this handleSubmit function (yet)

  // ???
  const addMenuItem = (newItem) => {
    setMenuItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      updatedItems.sort((a, b) => a.name.localeCompare(b.name));
      return updatedItems;
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max file size
        toast.error("Image file is too large. Max size is 5MB.");
        return;
      }
      setNewMenuItem((prevState) => ({
        ...prevState,
        image: file,
      }));
    }
  };
  
  const handleDelete = async (id) => {
    if (!id) {
      console.error("Invalid menu item ID.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      const menuDocRef = doc(db, "menu", id);
      await deleteDoc(menuDocRef);

      setMenuItems((prevItems) => prevItems.filter((item) => item._id !== id));

      toast.success("Menu item deleted successfully.", {
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item. Please try again.", {
        autoClose: 5000,
      });
    }
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
      {menuItems.map((item) => (
        <div key={item._id} className="menu-item">
          <div className="menu-image-container">
          {item.imageURL ? (
            <img
              src={item.imageURL}  // Preview the uploaded image
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
              onClick={() => handleDelete(item._id)}
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
    <>
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

            <AnimatePresence mode="sync">
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
                  <div className="dropdown-item"  onClick={() => handleLogout(navigate)}>
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
          </AnimatePresence>
          
        </div>
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
    </>
  );
};

export default AdminPage;