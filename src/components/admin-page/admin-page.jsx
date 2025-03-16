import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { redirectToLoginIfLoggedOut, handleLogout, db } from "../../config/firebase-config";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence, color } from "framer-motion";
import { FaSignOutAlt, FaChartBar, FaClipboardList, FaCog } from "react-icons/fa";
import { FaArrowRightToBracket } from "react-icons/fa6";
import {LuTrello, LuHandPlatter, LuPlus,} from "react-icons/lu";
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
    category: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  //admin reports
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  //Sample mock data for AdminReports
    // Sample data - replace with your actual data
    const orderReport = [
      {
        orderNumber: '22-5714-674',
        dateOrdered: '7/16/2024, 1:22:16 AM',
        status: 'Completed',
        product: 'Fried Chicken',
        quantity: '1x',
        totalPrice: '₱50.00'
      },
      // Add more orders as needed
    ];

  // Sample mock data for Orders
  const [orders, setOrders] = useState([
    {
      orderNumber: '19-4566-878',
      name: 'James Bond',
      totalAmount: '₱100.00',
      products: 'Fried Chicken, Burger, Rice',
      status: 'Pending',
      paymentMode: 'Cash'
    },
    {
      orderNumber: '20-3454-654',
      name: 'Steve Harvey',
      totalAmount: '₱200.00',
      products: 'Pasta, Salad',
      status: 'Pending',
      paymentMode: 'G-Cash'
    },
    {
      orderNumber: '21-7784-123',
      name: 'Clark Kent',
      totalAmount: '₱150.00',
      products: 'Fried Chicken, Fries, Soda',
      status: 'Pending',
      paymentMode: 'Cash'
    }
  ]);

  // Handle change in status
  const handleStatusChange = (index, value) => {
    const updatedOrders = [...orders];
    updatedOrders[index].status = value;
    setOrders(updatedOrders); // Update the state with new status
  };


  const handleDownloadReport = () => {
    // Implement your download logic here
    console.log('Downloading report...');
  };


  useEffect(() => {
    const menuRef = collection(db, "menu");

    const unsubscribe = onSnapshot(menuRef, (querySnapshot) => {
        const menuList = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          _id: doc.id,
        }));
        setMenuItems(menuList);
    }, (error) => {
        console.error("Error fetching menu items:", error);
        toast.error("Failed to fetch menu items.");
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
      category: "",
    });
    setIsModalOpen(true);
  };
  
  // Modal for editing menu
  const openEditModal = (item) => {
    setNewMenuItem({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: null, // No need to set an image since it won't be edited
      _id: item._id,
      imageURL: item.imageURL, // Keep the current image URL for display
      category: item.category,
    });
    setIsModalOpen(true);
  };
  
  //dont touch this function
  const openAddModal = () => {
    setNewMenuItem({
      name: "",
      price: "",
      quantity: "",
      image: null,
      _id: null,
      imageURL: "",
      category: "",
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
      category: "",
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
  
  
  /*
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
  }; // Dont touch this handleSubmit function (yet)*/


  //handle submit with edit menu without changing the current image
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let imageURL = null;
      let publicID = null;
  
      // For editing, the imageURL and publicID are already set. No need to upload a new image.
      if (newMenuItem.image) {
        // Logic for uploading an image (if provided)
        const formData = new FormData();
        formData.append("file", newMenuItem.image);
        formData.append("upload_preset", "wildcats_express_menu");
        formData.append("cloud_name", "dxbkzby8x");
  
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
        imageURL = cloudinaryData.secure_url;
        publicID = cloudinaryData.public_id;
      }
  
      const menuRef = collection(db, 'menu');
      const menuItemData = {
        name: newMenuItem.name,
        price: parseFloat(newMenuItem.price),
        quantity: Number(newMenuItem.quantity),
        imageURL: imageURL || newMenuItem.imageURL, // Keep current image URL for edits
        publicID: publicID || "",
        category: newMenuItem.category,
      };
  
      if (newMenuItem._id) {
        // If _id exists, update the existing menu item
        const menuDocRef = doc(db, 'menu', newMenuItem._id);
        await updateDoc(menuDocRef, menuItemData);
        toast.success("Menu item updated successfully.");
      } else {
        // If no _id, add a new menu item
        await addDoc(menuRef, menuItemData);
        toast.success("New menu item added successfully.");
      }
  
      closeModal(); // Close modal after saving
    } catch (error) {
      console.error("Error uploading menu item: ", error);
      toast.error("Failed to add menu item.");
    }
  };
  

  // can be delete, was use for mock adding and deletion of items
  const addMenuItem = (newItem) => {
    setMenuItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      updatedItems.sort((a, b) => a.name.localeCompare(b.name));
      return updatedItems;
    });
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
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
  
  
  
    // can be delete, was use for mock adding and deletion of items
  const handleDelete = async (id) => {
    if (!id) {
      console.error("Invalid menu item ID.");
      return;
    }
  
    // Set the item to delete and open the confirmation modal
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDeleteItem = async () => {
    if (!itemToDelete) {
      console.error("No item selected for deletion.");
      return;
    }
  
    try {
      const menuDocRef = doc(db, "menu", itemToDelete);
      await deleteDoc(menuDocRef);
  
      setMenuItems((prevItems) => prevItems.filter((item) => item._id !== itemToDelete));
      setItemToDelete(null);
  
      toast.success("Menu item deleted successfully.", {
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item. Please try again.", {
        autoClose: 5000,
      });
    } finally {
      setIsDeleteModalOpen(false); // Close the modal after attempting deletion
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
        <div className="modal-overlay-menu">
          <div className="modal-menu">
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
              <input
                type="text"
                name="category"
                value={newMenuItem.category}
                onChange={handleInputChange}
                placeholder="Category"
                required
              />
              {!newMenuItem._id && (
                <div className="file-input-container">
                  <label htmlFor="image">Choose Image:</label>
                  <input
                    className="input-image"
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              )}
              {newMenuItem.image && (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(newMenuItem.image)} // Create a preview URL for the image
                    alt="Preview"
                    className="image-preview-img"
                  />
                  <p>{newMenuItem.image.name}</p>
                </div>
              )}

              <div className="modal-actions-menu">
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
              className="action-link-edit"
              onClick={() => openEditModal(item)} // Open the modal with the selected item's data
              >
              Edit
            </button>
            <button
              className="action-link-delete"
              onClick={() => confirmDelete(item._id)}
              >
              Delete
            </button>
            {isDeleteModalOpen && (
              <div className="modal-overlay-delete">
                <div className="modal-delete">
                  <p>Are you sure you want to delete this menu item?</p>
                  <div className="modal-actions-delete">
                    <button
                      onClick={() => confirmDeleteItem()} // Call the confirm delete function
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setItemToDelete(null); // Reset the selected item
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
    </>
  );

  //render dashboard
  //static layout only
  //Backend please change logic for integration
  const renderDashboard = () => {
    return (
      <div className="dashboard-container-admin">
        
        <div className="orders-wrapper">
          {/* Order Line Section */}
          <div className="order-line-container">
            <h3>Order Line</h3>
            <br/>
            <div className="order-cards">

              
              {/* Static Order 1 */}
              <div className="order-card">
                <div className="order-card-header">
                <div className="school-id">19-4566-878</div>
                <div className="order-id">Order #1</div>
                </div>
                <div className="order-details">
                  <p>James Bond</p>
                  <div className="order-status">
                    <span><p>In Progress</p></span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: "90%" }}></div>
                    </div>
                    <span className="progress-percentage">90%</span>
                  </div>
                </div>
              </div>

              {/* Static Order 2 */}
              <div className="order-card">
                <div className="order-card-header">
                  <div className="school-id">20-3454-654</div>
                  <div className="order-id">Order #2</div>                  
                </div>
                <div className="order-details">
                  <p>Steve Harvey</p>
                  <div className="order-status">
                    <span><p>In Progress</p></span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: "50%" }}></div>
                    </div>
                    <span className="progress-percentage">50%</span>
                  </div>
                </div>
              </div>

              {/* Static Order 3 */}
              <div className="order-card">
                <div className="order-card-header">
                  <div className="school-id">19-4566-878</div>
                  <div className="order-id">Order #3</div>
                </div>
                <div className="order-details">
                  <p>Clark Johnson</p>
                  <div className="order-status">
                    <span><p>In Progress</p></span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: "68%" }}></div>
                    </div>
                    <span className="progress-percentage">68%</span>
                  </div>
                </div>
              </div>

              {/* Static Order 4 */}
              <div className="order-card">
                <div className="order-card-header">
                  <div className="school-id">22-4535-765</div>
                  <div className="order-id">Order #4</div>                    
                </div>
                <div className="order-details">
                  <p>Steve Rogers</p>
                  <div className="order-status">
                    <span><p>In Progress</p></span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: "30%" }}></div>
                    </div>
                    <span className="progress-percentage">30%</span>
                  </div>
                </div>
              </div>
    
            </div>
          </div>
    
          {/* Current Order Section */}
          <div className="current-order-container">
            <h3>Current Order</h3>
            <br/>
            <div className="current-order-card">
              <h4>Recipient: Dave Miller</h4>
              <p>School ID:</p>
              <p>#123456789</p>
              <br/>
              <div className="current-order-card-bottom">
                <span>Order#: 4</span>
                <span>Items: 8</span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Popular Picks Section */}
        <div className="popular-picks-container">
          <h2>Popular Picks</h2>
          <br/>
          <div className="popular-picks">
          <div className="pick">
            <div className="pick-name-price">
              <span className="pick-name">Fried Chicken</span>
              <span className="pick-price">50.00</span>
            </div>
          </div>

          <div className="pick">
            <div className="pick-name-price">
              <span className="pick-name">Bulalo</span>
              <span className="pick-price">100.00</span>
            </div>
          </div>

          <div className="pick">
            <div className="pick-name-price">
              <span className="pick-name">Longganisa</span>
              <span className="pick-price">80.00</span>
            </div>
          </div>

          <div className="pick">
            <div className="pick-name-price">
              <span className="pick-name">Rice</span>
              <span className="pick-price">10.00</span>
            </div>
          </div>

          </div>
        </div>
      </div>
    );
  };
  

  // Render Orders
  const renderOrder = () =>{
    return (
      <div className="orders-modal">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Name</th>
              <th>Total Amount</th>
              <th>Products</th>
              <th>Status</th>
              <th>Mode of Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.orderNumber}>
                <td>{order.orderNumber}</td>
                <td>{order.name}</td>
                <td>{order.totalAmount}</td>
                <td>{order.products}</td>
                <td>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(index, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready to Pickup">Ready to Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>{order.paymentMode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  // Render Admin Reports
  const renderAdminReports = () => {

    return(
    <>                  
  <div className="search-container">
    <input
      type="text"
      placeholder="Search by Order Number, Date, Status, or Product"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <div className="filters-section">
    <span className="filters-label">Filters</span>
    <select 
      value={selectedDay}
      onChange={(e) => setSelectedDay(e.target.value)}
    >
      <option value="">Day</option>
      {/* Add day options 1-31 */}
      {Array.from({ length: 31 }, (_, i) => (
        <option key={i + 1} value={i + 1}>{i + 1}</option>
      ))}
    </select>

    <select 
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
    >
      <option value="">Month</option>
      <option value="1">January</option>
      <option value="2">February</option>
      <option value="3">March</option>
      <option value="4">April</option>
      <option value="5">May</option>
      <option value="6">June</option>
      <option value="7">July</option>
      <option value="8">August</option>
      <option value="9">September</option>
      <option value="10">October</option>
      <option value="11">November</option>
      <option value="12">December</option>
    </select>

    <select 
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
    >
      <option value="">Year</option>
      <option value="2025">2025</option>
      <option value="2026">2026</option>
      <option value="2026">2027</option>
      <option value="2028">2028</option>
      <option value="2029">2029</option>
      <option value="2030">2030</option>
      <option value="2031">2031</option>
      <option value="2032">2032</option>
      <option value="2033">2033</option>
      <option value="2034">2034</option>
      <option value="2035">2035</option>
      {/* Add other years */}
    </select>

    <button 
      className="download-button"
      onClick={handleDownloadReport}
    >
      Download Report
    </button>
  </div>

  <div className="table-container">
    <table>
      <thead>
        <tr>
          <th>Order Number</th>
          <th>Date Ordered</th>
          <th>Status</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Total Price</th>
        </tr>
      </thead>
      <tbody>
        {orderReport.map((orderReport) => (
          <tr key={orderReport.orderNumber}>
            <td>{orderReport.orderNumber}</td>
            <td>{orderReport.dateOrdered}</td>
            <td>
              <span className={`status-badge ${orderReport.status.toLowerCase()}`}>
                {orderReport.status}
              </span>
            </td>
            <td>{orderReport.product}</td>
            <td>{orderReport.quantity}</td>
            <td>{orderReport.totalPrice}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
    </>
    );
  };

  //Render Settings
  const renderSettings = () => {
    return (
      <>
        <div className="settings-modal">
          
          <div className="settings-content">
            <label>Email:</label>
            <input type="email" placeholder="Enter new email" />
  
            <label>Password:</label>
            <input type="password" placeholder="Enter new password" />

            <label>Confirm Password:</label>
            <input type="password" placeholder="Confirm new password" />
  
            <button className="save-btn">Save Changes</button>
          </div>
        </div>
      </>
    );
  };
  

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
            <h1>    
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                Wildcats Express
              </Link>
              </h1>
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
                  <div className="dropdown-item"  onClick={() => navigate("/pos-page")}>
                    <FaArrowRightToBracket /> Customer 
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
                  <h3>Welcome, Admin!</h3>
                  <br/>
                  <h2>Every customer counts. Let's serve them better today!</h2>
                  <div>{renderDashboard()}</div>
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
                  <br/>
                  <div>{renderOrder()}</div>
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
                  <br/>
                  <div>{renderAdminReports()}</div>
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
                  <br />
                  <div>{renderSettings()}</div>
                </motion.div>
              )}
              {activeTab === "pos-page" && (
                <motion.div 
                  className="pos-page"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2>Backend please redirect this to /pos-page</h2>
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