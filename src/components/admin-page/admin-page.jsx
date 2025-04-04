import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { redirectToLoginIfLoggedOut, handleLogout, auth, db } from "../../config/firebase-config";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence, color } from "framer-motion";
import { FaSignOutAlt, FaUserPlus , FaClipboardList, FaCog } from "react-icons/fa";
import { FaArrowRightToBracket } from "react-icons/fa6";
import {LuTrello, LuHandPlatter, LuPlus,} from "react-icons/lu";
import { CiImageOff } from "react-icons/ci";
import catLogo from "/new-mainlogo.svg"; 
import catProfile from "/cat_profile.svg"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./admin-page.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminPage = () => {
  const navigate = useNavigate();
  const loading = redirectToLoginIfLoggedOut(navigate);

  // Register customer states
  const [customerType, setCustomerType] = useState('student');
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    schoolId: '',
    name: '',
    courseYear: '',
    department: '',
    gradesTeaching: [],
    yearsTeaching: [],
    position: '',
    staffDepartment: '',
    staffPosition: ''
  });

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    if (checked) {
      setFormData(prev => ({
        ...prev,
        [name]: [...prev[name], value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: prev[name].filter(item => item !== value)
      }));
    }
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    const newCustomer = {
      type: customerType,
      schoolId: formData.schoolId,
      name: formData.name,
      ...(customerType === 'student' && {
        courseYear: formData.courseYear
      }),
      ...(customerType === 'faculty' && {
        department: formData.department,
        gradesTeaching: formData.gradesTeaching,
        yearsTeaching: formData.yearsTeaching,
        position: formData.position
      }),
      ...(customerType === 'staff' && {
        department: formData.staffDepartment,
        position: formData.staffPosition
      })
    };

    setCustomers([...customers, newCustomer]);
    // Reset form
    setFormData({
      schoolId: '',
      name: '',
      courseYear: '',
      department: '',
      gradesTeaching: [],
      yearsTeaching: [],
      position: '',
      staffDepartment: '',
      staffPosition: ''
    });
  };


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

  // for Admin reports
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
        totalPrice: '₱50.00',
      },
      {
        orderNumber: '23-1234-567',
        dateOrdered: '3/15/2025, 10:45:00 AM',
        status: 'Cancelled',
        product: 'Burger',
        quantity: '2x',
        totalPrice: '₱150.00',
      },
      {
        orderNumber: '24-9876-543',
        dateOrdered: '3/30/2025, 2:30:00 PM',
        status: 'Completed',
        product: 'Pizza',
        quantity: '1x',
        totalPrice: '₱200.00',
      },
      {
        orderNumber: '25-4567-890',
        dateOrdered: '2/28/2025, 5:15:00 PM',
        status: 'Pending',
        product: 'Pasta',
        quantity: '3x',
        totalPrice: '₱300.00',
      },
      {
        orderNumber: '26-6543-210',
        dateOrdered: '1/10/2025, 8:00:00 AM',
        status: 'Completed',
        product: 'Steak',
        quantity: '1x',
        totalPrice: '₱500.00',
      },
      {
        orderNumber: '27-7890-123',
        dateOrdered: '12/25/2024, 6:00:00 PM',
        status: 'Cancelled',
        product: 'Salad',
        quantity: '2x',
        totalPrice: '₱100.00',
      },
      {
        orderNumber: '28-3456-789',
        dateOrdered: '11/11/2024, 11:11:11 AM',
        status: 'Completed',
        product: 'Soda',
        quantity: '5x',
        totalPrice: '₱75.00',
      },
      {
        orderNumber: '29-1122-334',
        dateOrdered: '3/30/2025, 4:45:00 PM',
        status: 'Completed',
        product: 'Rice',
        quantity: '10x',
        totalPrice: '₱100.00',
      },
    ];

  // Sample mock data for Orders
  const [orders, setOrders] = useState([]);

  // For Tracking Password Changes
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Filter Completed or Cancelled transactions
  const completedOrCancelledOrders = orders.filter(
    (order) => order.status === "Completed" || order.status === "Cancelled"
  );

  // Function to toggle the modal
  const toggleTransactionModal = () => {
    setIsTransactionModalOpen(!isTransactionModalOpen);
  };

  // Render the modal
  const renderTransactionModal = () => {
    if (!orders || orders.length === 0) {
      return <p>No past transactions available.</p>; // Handle empty state
    }
  
    const completedOrCancelledOrders = orders.filter(
      (order) => order.status === "Completed" || order.status === "Cancelled"
    );
  
    return (
      isTransactionModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Past Transactions</h2>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Name</th>
                  <th>Date Ordered</th>
                  <th>Total Amount</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {completedOrCancelledOrders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td>{order.orderNumber}</td>
                    <td>{order.name || "N/A"}</td>
                    <td>{order.dateTime || "N/A"}</td>
                    <td>{order.totalAmount ? `₱${order.totalAmount.toFixed(2)}` : "N/A"}</td>
                    <td>
                      {order.items?.map((item, idx) => (
                        <div key={idx}>{item.name} (x{item.quantity})</div>
                      )) || "N/A"}
                    </td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.paymentMethod || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="close-modal-button" onClick={toggleTransactionModal}>
              Close
            </button>
          </div>
        </div>
      )
    );
  };

  // Handle Save Password
  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      const user = auth.currentUser; // Get the currently logged-in user
      if (!user) {
        toast.error("No user is currently logged in.");
        return;
      }

      // Reauthenticate the user with the old password
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Check if the new password is the same as the old password
      const newCredential = EmailAuthProvider.credential(user.email, newPassword);
      try {
        await reauthenticateWithCredential(user, newCredential);
        toast.error("New password cannot be the same as the current password.");
        return;
      } catch {
          console.log("Password is new.");
      }

      // Update the user's password
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully!\nPlease log in again.");
      setTimeout(() => {
        handleLogout(navigate); // Logout the user after changing the password
      }, 3000);
    } catch (error) {
      console.error("Error updating password:", error.message);
      toast.error(<> Failed to update password: <br /> {error.message} </>);
    }
  };

  // Handle change in status
  const handleStatusChange = async (index, value) => {
    const updatedOrders = [...orders];
    const orderToUpdate = updatedOrders[index];
    orderToUpdate.status = value;

    try {
      const orderDocRef = doc(db, "orders", orderToUpdate.orderNumber);

      if (value === "Cancelled" || value === "Completed") {
        // Update the status in Firestore
        await updateDoc(orderDocRef, { status: value });

        // Schedule deletion after 24 hours (1 day)
        setTimeout(async () => {
          try {
            // Check if the order still exists and has the same status
            const orderSnapshot = await getDoc(orderDocRef);
            if (
              orderSnapshot.exists() &&
              (orderSnapshot.data().status === "Cancelled" || orderSnapshot.data().status === "Completed")
            ) {
              await deleteDoc(orderDocRef); // Remove the order from Firestore
              setOrders((prevOrders) =>
                prevOrders.filter((order) => order.orderNumber !== orderToUpdate.orderNumber)
              ); // Update local state
              toast.success(`Order with status '${value}' removed after 24 hours.`);
            }
          } catch (error) {
            console.error(`Error removing ${value} order after 24 hours:`, error);
          }
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

        toast.success(`Order status updated to '${value}'. It will be removed after 24 hours.`);
      } else {
        // Update the status in Firestore
        await updateDoc(orderDocRef, { status: value });
        toast.success("Order status updated successfully.");
      }

      setOrders(updatedOrders); // Update the local state
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status.");
    }
  };

  // For Login succes Toast
  useEffect(() => {
    const hasLoggedIn = sessionStorage.getItem("hasLoggedIn");
    if (hasLoggedIn === "true") {
      setTimeout(() => {
        toast.success("Login successful!");
      }, 500); 
      sessionStorage.removeItem("hasLoggedIn");
    }
  }, []);

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

  useEffect(() => {
    const ordersRef = collection(db, "orders");

    const unsubscribe = onSnapshot(
      ordersRef,
      (querySnapshot) => {
        const fetchedOrders = querySnapshot.docs
          .map((doc) => ({
            ...doc.data(),
            orderNumber: doc.id, // Use Firestore document ID as the order number
          }))
          .filter((order) => order.orderNumber !== "order"); // Exclude the document named "order"

        setOrders(fetchedOrders); // Update the orders state
      },
      (error) => {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders.");
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
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
  const renderOrder = () => {
    if (!orders || orders.length === 0) {
      return <p>No orders available.</p>; // Handle empty state
    }
  
    // Exclude orders with status "Cancelled" or "Completed"
    const filteredOrders = orders.filter(
      (order) => order.status !== "Cancelled" && order.status !== "Completed"
    );
  
    return (
      <div className="orders-modal">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Name</th>
              <th>Date Ordered</th>
              <th>Total Amount</th>
              <th>Items</th>
              <th>Status</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order.orderNumber}>
                <td>{order.orderNumber}</td>
                <td>{order.name || "N/A"}</td>
                <td>{order.dateTime || "N/A"}</td>
                <td>{order.totalAmount ? `₱${order.totalAmount.toFixed(2)}` : "N/A"}</td>
                <td>
                  {order.items?.map((item, idx) => (
                    <div key={idx}>{item.name} (x{item.quantity})</div>
                  )) || "N/A"}
                </td>
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
                <td>{order.paymentMethod || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  // Render Admin Reports
  const renderAdminReports = () => {
    if (!orders || orders.length === 0) {
      return <p>No data available for Admin Reports.</p>; // Handle empty state
    }
  
    const filteredReports = orders.filter((report) => {
      const matchesSearchTerm =
        report.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.dateTime?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.items?.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
  
      const matchesDay = selectedDay
        ? report.dateTime.split("/")[1].padStart(2, "0") === selectedDay
        : true;
  
      const matchesMonth = selectedMonth
        ? report.dateTime.split("/")[0].padStart(2, "0") === selectedMonth
        : true;
  
      const matchesYear = selectedYear
        ? report.dateTime.split("/")[2].split(",")[0] === selectedYear
        : true;
  
      return matchesSearchTerm && matchesDay && matchesMonth && matchesYear;
    });
  
    const handleDownloadReport = () => {
      try {
        const doc = new jsPDF();
        doc.text("Admin Reports", 14, 10);
  
        doc.autoTable({
          head: [["Order Number", "Date Ordered", "Status", "Items", "Quantity", "Total Price"]],
          body: filteredReports.map((report) => [
            report.orderNumber,
            report.dateTime,
            report.status,
            report.items
              ?.map((item) => `${item.name} (x${item.quantity})`)
              .join(", "),
            report.items?.reduce((sum, item) => sum + item.quantity, 0),
            report.totalAmount,
          ]),
        });
  
        doc.save("admin-reports.pdf");
        toast.success("Report downloaded successfully!");
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to download the report. Please try again.");
      }
    };
  
    return (
      <>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Order Number, Date, Status, or Item"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
  
        <div className="filters-section">
          <span className="filters-label">Filters</span>
          <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {i + 1}
              </option>
            ))}
          </select>
  
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="">Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
  
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">Year</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={2025 + i} value={String(2025 + i)}>
                {2025 + i}
              </option>
            ))}
          </select>
  
          <button className="download-button" onClick={handleDownloadReport}>
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
                <th>Items</th>
                <th>Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.orderNumber}>
                  <td>{report.orderNumber}</td>
                  <td>{report.dateTime}</td>
                  <td>
                    <span className={`status-badge ${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    {report.items?.map((item, idx) => (
                      <div key={idx}>{item.name} (x{item.quantity})</div>
                    ))}
                  </td>
                  <td>
                    {report.items?.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td>{report.totalAmount}</td>
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
            <form onSubmit={(e) => {
              e.preventDefault(); 
              handleSavePassword(); 
            }}>
              <label>Old Password:</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                required
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <label>New Password:</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                required
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <label>Confirm Password:</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button className="save-btn" type="submit">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </>
    );
  };
  
  //Render registerCustomer
  const renderRegisterCustomer = () => {
    return (
      <div className="registerCustomer-container">
        <div className="customer-form-section">
          <h2>Register New Customer</h2>
          <form onSubmit={handleCustomerSubmit}>
            <div className="form-group">
              <label>Customer Type:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="customerType"
                    value="student"
                    checked={customerType === 'student'}
                    onChange={() => setCustomerType('student')}
                  />
                  Student
                </label>
                <label>
                  <input
                    type="radio"
                    name="customerType"
                    value="faculty"
                    checked={customerType === 'faculty'}
                    onChange={() => setCustomerType('faculty')}
                  />
                  Faculty
                </label>
                <label>
                  <input
                    type="radio"
                    name="customerType"
                    value="staff"
                    checked={customerType === 'staff'}
                    onChange={() => setCustomerType('staff')}
                  />
                  Staff
                </label>
              </div>
            </div>
  
            <div className="form-group">
              <label>School ID:</label>
              <input
                type="text"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleCustomerInputChange}
                placeholder="Enter school ID"
                required
              />
            </div>
  
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleCustomerInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
  
            {/* Student-specific fields */}
            {customerType === 'student' && (
              <div className="form-group">
                <label>Course & Year:</label>
                <input
                  type="text"
                  name="courseYear"
                  value={formData.courseYear}
                  onChange={handleCustomerInputChange}
                  placeholder="e.g. BSCpE-3"
                  required
                />
              </div>
            )}
  
            {/* Faculty-specific fields */}
            {customerType === 'faculty' && (
              <>
                <div className="form-group">
                  <label>Department:</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleCustomerInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="HS">High School (Grade 7-10)</option>
                    <option value="SHS">Senior High School (Grade 11-12)</option>
                    <option value="College">College</option>
                  </select>
                </div>
  
                {formData.department === 'HS' && (
                  <div className="form-group">
                    <label>Grades Teaching:</label>
                    <div className="checkbox-group">
                      {[7, 8, 9, 10].map(grade => (
                        <label key={grade}>
                          <input
                            type="checkbox"
                            name="gradesTeaching"
                            value={`Grade ${grade}`}
                            checked={formData.gradesTeaching.includes(`Grade ${grade}`)}
                            onChange={handleCheckboxChange}
                          />
                          Grade {grade}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
  
                {formData.department === 'SHS' && (
                  <div className="form-group">
                    <label>Grades Teaching:</label>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="gradesTeaching"
                          value="Grade 11"
                          checked={formData.gradesTeaching.includes('Grade 11')}
                          onChange={handleCheckboxChange}
                        />
                        Grade 11
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="gradesTeaching"
                          value="Grade 12"
                          checked={formData.gradesTeaching.includes('Grade 12')}
                          onChange={handleCheckboxChange}
                        />
                        Grade 12
                      </label>
                    </div>
                  </div>
                )}
  
                {formData.department === 'College' && (
                  <div className="form-group">
                    <label>Years Teaching:</label>
                    <div className="checkbox-group">
                      {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(year => (
                        <label key={year}>
                          <input
                            type="checkbox"
                            name="yearsTeaching"
                            value={year}
                            checked={formData.yearsTeaching.includes(year)}
                            onChange={handleCheckboxChange}
                          />
                          {year}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
  
                <div className="form-group">
                  <label>Position:</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleCustomerInputChange}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Advisor">Advisor</option>
                    <option value="Instructor/Teacher">Instructor/Teacher</option>
                    <option value="Chairman">Chairman</option>
                    <option value="Dean">Dean</option>
                    <option value="Vice Position">Vice Position</option>
                    <option value="President">President</option>
                  </select>
                </div>
              </>
            )}
  
            {/* Staff-specific fields */}
            {customerType === 'staff' && (
              <>
                <div className="form-group">
                  <label>Department:</label>
                  <input
                    type="text"
                    name="staffDepartment"
                    value={formData.staffDepartment}
                    onChange={handleCustomerInputChange}
                    placeholder="Enter department"
                    required
                  />
                </div>
  
                <div className="form-group">
                  <label>Position:</label>
                  <input
                    type="text"
                    name="staffPosition"
                    value={formData.staffPosition}
                    onChange={handleCustomerInputChange}
                    placeholder="Enter position"
                    required
                  />
                </div>
              </>
            )}
  
            <button type="submit" className="register-button">
              Register Customer
            </button>
          </form>
        </div>
  
        <div className="customer-list-section">
          <h2>Registered Customers</h2>
          {customers.length === 0 ? (
            <p>No customers registered yet.</p>
          ) : (
            <div className="customer-cards">
              {customers.map((customer, index) => (
                <div key={index} className={`customer-card ${customer.type}`}>
                  <h3>{customer.name}</h3>
                  <p><strong>ID:</strong> {customer.schoolId}</p>
                  <p><strong>Type:</strong> {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}</p>
                  
                  {customer.type === 'student' && (
                    <p><strong>Course & Year:</strong> {customer.courseYear}</p>
                  )}
                  
                  {customer.type === 'faculty' && (
                    <>
                      <p><strong>Department:</strong> {customer.department}</p>
                      {customer.gradesTeaching.length > 0 && (
                        <p><strong>Grades:</strong> {customer.gradesTeaching.join(', ')}</p>
                      )}
                      {customer.yearsTeaching.length > 0 && (
                        <p><strong>Years:</strong> {customer.yearsTeaching.join(', ')}</p>
                      )}
                      <p><strong>Position:</strong> {customer.position}</p>
                    </>
                  )}
                  
                  {customer.type === 'staff' && (
                    <>
                      <p><strong>Department:</strong> {customer.department}</p>
                      <p><strong>Position:</strong> {customer.position}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

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
                  <div className="dropdown-item" onClick={() => handleTabChange("registerCustomer")}>
                    <FaUserPlus /> Add Customer
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
                  <button className="view-transactions-button" onClick={toggleTransactionModal}>
                    View Past Transactions
                  </button>
                  {renderTransactionModal()}
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
              {activeTab === "registerCustomer" && (
                <motion.div 
                  className="register-customer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2>Add Customer</h2>
                  <div>{renderRegisterCustomer()}</div>
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