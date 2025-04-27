import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { redirectToLoginIfLoggedOut, handleLogout, auth, db } from "../../config/firebase-config";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { collection, query, where, orderBy, setDoc, onSnapshot, addDoc, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
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
import { jsPDF } from "jspdf";
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)



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

  // for Admin reports
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // For Customer Management
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');
  
  const [orders, setOrders] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);

  // Fetch Top 5 uncompleted/active/latest orders
  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("status", "in", ["Pending", "Preparing", "Ready to Pickup"]),
      orderBy("dateTime", "desc"),
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLatestOrders(orders);
      console.log("🔥 Updated active orders:", orders);
    });
  
    return () => unsubscribe();
  }, []);  

  const sortedOrders = [...latestOrders].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)); // Sort by oldest date first
  const currentOrder = sortedOrders[0]; // Oldest order
  const orderLine = sortedOrders.slice(1); // Remaining orders

  const getProgressFromStatus = (status) => {
    switch (status) {
      case "Pending":
        return 10;
      case "Preparing":
        // Simulate a dynamic progress from 50–80%
        return Math.floor(Math.random() * 31) + 50; // 50 to 80
      case "Ready to Pickup":
        return 100;
      default:
        return 0;
    }
  };
  
  const enhancedOrders = orderLine.map((order, index) => ({
    ...order,
    progress: getProgressFromStatus(order.status),
  }));  
  
  // Sample mock data for customers
  const [mockCustomers, setMockCustomers] = useState([
    {
      id: 1,
      name: "Juan Dela Cruz",
      schoolId: "27-5646-456",
      type: "student"
    },
    {
      id: 2,
      name: "Maria Clara",
      schoolId: "43-5455-454",
      type: "faculty"
    },
    {
      id: 3,
      name: "Pedro Penduko",
      schoolId: "23-2345-546",
      type: "staff",
    },
  ]);


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

  // Filter orders with status "Completed" or "Cancelled"
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
  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      // Find the order to update using its unique orderNumber
      const orderToUpdate = orders.find((order) => order.orderNumber === orderNumber);
      if (!orderToUpdate) {
        toast.error("Order not found.");
        return;
      }

      const previousStatus = orderToUpdate.status; // Store the previous status
      orderToUpdate.status = newStatus; // Update the status locally

      const orderDocRef = doc(db, "orders", orderToUpdate.orderNumber);

      if (newStatus === "Cancelled" || newStatus === "Completed") {
        // Update the status in Firestore
        await updateDoc(orderDocRef, { status: newStatus });

        // Update the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderNumber === orderNumber ? { ...order, status: newStatus } : order
          )
        );

        toast.success(`Order marked as ${newStatus}.`);
      } else {
        // Update the status in Firestore for other statuses
        await updateDoc(orderDocRef, { status: newStatus });
        toast.success("Order status updated successfully.");
      }
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
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          orderNumber: doc.id, // Use Firestore document ID as the order number
        }));

        setOrders(fetchedOrders); // Update the orders state
      },
      (error) => {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders.");
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Fetch customer list 
  useEffect(() => {
    const fetchCustomers = async () => {
      const customersRef = collection(db, "customers");
  
      const unsubscribe = onSnapshot(customersRef, (snapshot) => {
        const fetchedCustomers = snapshot.docs.map((doc) => ({
          id: doc.id, // Use the document ID as the customer ID
          ...doc.data(), // Spread the customer data (name, type)
        }));
        setMockCustomers(fetchedCustomers); // Update the state with fetched customers
      });
  
      return () => unsubscribe(); // Cleanup listener on unmount
    };
  
    fetchCustomers();
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

  // Sort food by popularity
const getSortedMenuByPopularity = () => {
  const popularityMap = {};

  // Count how many times each food has been ordered
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (popularityMap[item.name]) {
        popularityMap[item.name] += item.quantity;
      } else {
        popularityMap[item.name] = item.quantity;
      }
    });
  });

  const sortedMenu = [...menuItems].map((menuItem) => ({
    ...menuItem,
    popularity: popularityMap[menuItem.name] || 0,
  }));

  return sortedMenu.sort((a, b) => b.popularity - a.popularity); // Sort food by popularity
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
  
  

  // Handle customer deletion
  const handleDeleteCustomerClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) {
      toast.error("No customer selected for deletion.");
      return;
    }
  
    try {
      const customerDocRef = doc(db, "customers", customerToDelete.id); // Reference to the Firestore document
      await deleteDoc(customerDocRef); // Delete the document from Firestore
  
      setMockCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.id !== customerToDelete.id)
      ); // Update the local state
  
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      toast.success("Customer removed successfully!");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer. Please try again.");
    }
  };

  const cancelDeleteCustomer = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  // Filter customers based on search criteria
  const filteredCustomers = mockCustomers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    
    if (searchTerm === '') return true;
    
    switch (searchCategory) {
      case 'name':
        return customer.name.toLowerCase().includes(searchLower);
      case 'id':
        return customer.id.toString().includes(searchLower);
      case 'position':
        return customer.type.toLowerCase().includes(searchLower);
      case 'all':
      default:
        return (
          customer.name.toLowerCase().includes(searchLower) ||
          customer.id.toString().includes(searchLower) ||
          customer.type.toLowerCase().includes(searchLower)
        );
    }
  });

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
              {/* Replaced text input with select dropdown */}
              <select
                name="category"
                value={newMenuItem.category}
                onChange={handleInputChange}
                required
                className="category-select"
              >
                <option value="">Select a category</option>
                <option value="Rice">Rice</option>
                <option value="Dishes">Dishes</option>
                <option value="Hot Drinks">Hot Drinks</option>
                <option value="Cold Drinks">Cold Drinks</option>
                <option value="Snacks">Snacks</option>
              </select>
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

       {/* Add the delete confirmation modal RIGHT HERE */}
    {isDeleteModalOpen && (
      <div className="modal-overlay-menu">
        <div className="modal-menu">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete this menu item?</p>
          <div className="modal-actions-menu">
            <button onClick={confirmDeleteItem}>Delete</button>
            <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );

  //Render menu items
  const renderMenuItems = () => {
    const sortedMenu = getSortedMenuByPopularity();

    return (
      <div className="menu-items">
        {sortedMenu.map((item) => (
          <div key={item._id} className="menu-item">
            <div className="menu-image-container">
              {item.imageURL ? (
                <img
                  src={item.imageURL}
                  alt={item.name}
                  className="menu-image"
                />
              ) : (
                <div className="menu-image-placeholder">
                  <CiImageOff className="no-image-icon" />
                </div>
              )}
            </div>
            <div className="menu-details">
              <div className="menu-name">{item.name}</div>
              <div className="menu-price">Php {Number(item.price).toFixed(2)}</div>
              <div className="menu-quantity">Quantity: {item.quantity}</div>
              <div className="menu-popularity">Popularity: {item.popularity}</div>
            </div>
            <div className="menu-actions">
              <button
                className="action-link-edit"
                onClick={() => openEditModal(item)}
              >
                Edit
              </button>
              <button
                className="action-link-delete"
                onClick={() => confirmDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  //render dashboard
  const renderDashboard = () => {
    return (
      <div className="dashboard-container-admin">
        <div className="orders-wrapper">
          {/* Order Line Section */}
          <div className="order-line-container">
            <h3>Order Line</h3>
            <br />
            <div className="order-cards">
              {enhancedOrders.map((order, index) => (
                <div className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <div className="school-id">{order.schoolId}</div>
                    <div className="order-id">Order #{index + 2}</div>
                  </div>
                  <div className="order-details">
                    <p>{order.name}</p>
                    <div className="order-status">
                      <span><p>{order.status}</p></span>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-percentage">{order.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Order Section */}
          <div className="current-order-container">
            <h3>Current Order</h3>
            <br />
            {currentOrder ? (
              <div className="current-order-card">
                <h4>{currentOrder.name}</h4>
                <p>{currentOrder.schoolId}</p>
                <p>{currentOrder.status}</p>
                <div className="current-order-card-bottom">
                  <span>Order#: 1</span>
                  <span>Items: {currentOrder.quantity}</span>
                </div>
              </div>
            ) : (
              <p>No current orders.</p>
            )}
          </div>
        </div>
        
        
  
        {/* Popular Picks Section */}
        <div className="popular-picks-container">
          <h2>Popular Picks</h2>
          <br />
          <div className="popular-picks">
            {getSortedMenuByPopularity()
              .slice(0, 4) // Get the top 4 popular items
              .map((item, index) => (
                <div key={item._id} className="pick">
                  <div className="pick-rank">{index + 1}</div>
                  <div className="pick-image-container">
                    {item.imageURL ? (
                      <img
                        src={item.imageURL}
                        alt={item.name}
                        className="pick-image"
                      />
                    ) : (
                      <div className="pick-image-placeholder">
                        <CiImageOff className="no-image-icon" />
                      </div>
                    )}
                  </div>
                  <div className="pick-name-price">
                    <span className="pick-name">{item.name}</span>
                    <span className="pick-price">₱{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
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
  
    // Sort orders by dateTime (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      // Convert date strings to Date objects for comparison
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);
      return dateA - dateB; // For descending order (newest first)
    });
  
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
            {sortedOrders.map((order) => (
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
                    onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
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
      return <p>No data available for Admin Reports.</p>;
    }
  
    // Filter only Completed and Cancelled orders
    const filteredOrders = orders.filter(
      (order) => order.status === "Completed" || order.status === "Cancelled"
    );
  
    // Apply additional filters
    const filteredReports = filteredOrders.filter((report) => {
      const matchesSearchTerm =
        report.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.dateTime?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.items?.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
  
      let matchesDay = true;
      let matchesMonth = true;
      let matchesYear = true;
      
      if (report.dateTime) {
        const dateParts = report.dateTime.split(/[/, ]+/);
        if (dateParts.length >= 3) {
          const month = dateParts[0].padStart(2, "0");
          const day = dateParts[1].padStart(2, "0");
          const year = dateParts[2];
          
          matchesDay = selectedDay ? day === selectedDay : true;
          matchesMonth = selectedMonth ? month === selectedMonth : true;
          matchesYear = selectedYear ? year === selectedYear : true;
        }
      }
  
      return matchesSearchTerm && matchesDay && matchesMonth && matchesYear;
    });
  
    // Function to delete an order from Firebase
    const handleDeleteOrder = async (orderId) => {
      try {
        // Confirm deletion
        const confirmDelete = window.confirm("Are you sure you want to delete this order? This action cannot be undone.");
        if (!confirmDelete) return;
  
        // Delete from Firebase
        await deleteDoc(doc(db, "orders", orderId));
        
        // Update local state
        setOrders(prevOrders => prevOrders.filter(order => order.orderNumber !== orderId));
        
        toast.success("Order deleted successfully!");
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order. Please try again.");
      }
    };
  
    const handleDownloadReport = () => {
      // ... (keep existing download report implementation)
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
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
                    <td>
                      <button 
                        className="delete-order-button"
                        onClick={() => handleDeleteOrder(report.orderNumber)}
                        title="Delete this order"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    No matching reports found
                  </td>
                </tr>
              )}
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

 //Render Customer List
  const renderCustomerList = () => {
    return (
      <div className="registerCustomer-container">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to remove {customerToDelete?.name}?</p>
              <div className="modal-buttons">
                <button onClick={cancelDeleteCustomer} className="cancel-button">
                  Cancel
                </button>
                <button onClick={confirmDeleteCustomer} className="confirm-button">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="customer-list-section">
          <h2>Registered Customers</h2>
          {/* Search Functionality*/}
        <div className="search-container-customerlist">
          <div className="search-inputs-customerlist">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-customerlist"
            />
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="search-category-customerlist"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="id">School ID</option>
              <option value="position">Position</option>
            </select>
          </div>
          {searchTerm && (
            <div className="search-results-count-customerlist">
              Found {filteredCustomers.length} customer(s)
            </div>
          )}
        </div>
          <div className="customer-cards">
          {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`customer-card ${customer.type}`}
                >
                  <div className="customer-info">
                    <h3>{customer.name}</h3>
                    <p>
                      <strong>School ID:</strong> {customer.id}
                    </p>
                    <p>
                      <strong>Type:</strong>{" "}
                      {customer.type.charAt(0).toUpperCase() +
                        customer.type.slice(1)}
                    </p>
                  </div>
                  <button
                    className="delete-customer-button"
                    onClick={() => handleDeleteCustomerClick(customer)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-customer-state">
                <p>No customers registered yet.</p>
                <p className="subtext">
                  Customers will appear here once they order.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
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
                  <div className="dropdown-item" onClick={() => handleTabChange("registerCustomer")}>
                    <FaUserPlus /> Customer List
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
                  <h2>Customer List</h2>
                  <div>{renderCustomerList()}</div>
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