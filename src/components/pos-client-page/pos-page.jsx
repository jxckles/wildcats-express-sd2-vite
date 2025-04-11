import {Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { redirectToLoginIfLoggedOut, handleLogout, db } from "../../config/firebase-config";
import { collection, onSnapshot, addDoc, doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import "./pos-page.css";
import {
  UtensilsCrossed, // used for "Menu" and "All"
  ShoppingCart,    // used for "Cart"
  MapPinned,       // used for "Track Order"
  Soup,            // used for "Rice"
  Salad,           // used for "Dishes"
  Coffee,          // used for "Coffee"
  CupSoda,         // used for "Drinks"
  Cookie           // used for "Snacks"
} from 'lucide-react';


const PosPage = () => {
  const navigate = useNavigate();
  const loading = redirectToLoginIfLoggedOut(navigate);
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("menu"); 
  const [customerType, setCustomerType] = useState(""); // "student", "staff", or "walkIn"
  const [schoolId, setSchoolId] = useState(""); // Store school ID
  const [clientName, setClientName] = useState(""); // Store client's name
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [gcashRefNumber, setGcashRefNumber] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]); // State for recent orders
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);// State for showing the track order modal
  const [hasSearched, setHasSearched] = useState(false); // State to track if the user has searched for an order
  const [orderNumber, setOrderNumber] = useState(""); // State for order number input
  const [isValidOrderNumber, setIsValidOrderNumber] = useState(false); // State to track if the order number is valid
  const [disabledItems, setDisabledItems] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});


  // Fetch menu items in real-time
  useEffect(() => {
    const menuRef = collection(db, "menu");

    const unsubscribe = onSnapshot(
      menuRef,
      (querySnapshot) => {
        const menuList = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          _id: doc.id,
        }));
        setMenuItems(menuList);
      },
      (error) => {
        console.error("Error fetching menu items:", error);
        toast.error("Failed to fetch menu items.");
      }
    );

    return () => unsubscribe();
  }, []);
  
  // Fetch recent orders in real-time
  useEffect(() => {
    const ordersRef = collection(db, "orders");

    const unsubscribe = onSnapshot(
      ordersRef,
      (querySnapshot) => {
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id, // Include the document ID
        }));
        setRecentOrders(fetchedOrders); // Update the state with fetched orders
      },
      (error) => {
        console.error("Error fetching recent orders:", error);
        toast.error("Failed to fetch recent orders.");
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    const handleSecretShortcut = (event) => {
      if (event.altKey && event.shiftKey && event.key === "A") {
        navigate("/admin-page");
      }
    };
  
    document.addEventListener("keydown", handleSecretShortcut);
    return () => {
      document.removeEventListener("keydown", handleSecretShortcut);
    };
  }, [navigate]);
  

  if (loading) {
    return <div>Loading...</div>; // Prevent UI from showing unless logged in
  }

  // Handler function can stay here or be moved down near renderCartView
  const handleCustomerTypeChange = (type) => {
    setCustomerType(type);
    // Clear previous inputs when changing type
    setClientName("");
    setSchoolId("");
  };

  const handleQuantityChange = (id, change) => {
    setSelectedQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[id] || 0) + change);
      return {
        ...prev,
        [id]: newQuantity
      };
    });
  };  

  const handleAddToCart = (item) => {
    const selectedQty = selectedQuantities[item._id] || 0;
  
    if (selectedQty > 0) {
      setCart((prev) => ({
        ...prev,
        [item._id]: selectedQty
      }));
  
      // Disable the item's buttons immediately
      setDisabledItems((prev) => ({
        ...prev,
        [item._id]: true
      }));
  
      // Re-enable after 2 seconds and reset quantity
      setTimeout(() => {
        setDisabledItems((prev) => {
          const newDisabled = { ...prev };
          delete newDisabled[item._id];
          return newDisabled;
        });
  
        setSelectedQuantities((prev) => ({
          ...prev,
          [item._id]: 0
        }));
      }, 2000);
    }
  };

  const handleRemoveItem = (itemId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      delete newCart[itemId]; 
      return newCart;
    });
    // Re-enable the item's buttons when removed
    setDisabledItems((prev) => {
      const newDisabled = { ...prev };
      delete newDisabled[itemId];
      return newDisabled;
    });
  };

  // Filter menu items by category and search query
  const filteredItems = menuItems.filter(
    (item) =>
      (selectedCategory === "All" || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Change the current view instead of navigating
  const changeView = (view) => {
    setCurrentView(view);
  };

  const handleCheckout = async () => {
    if (!schoolId) {
      alert("Please enter your School ID before proceeding to checkout.");
      return;
    }
  
    if (!paymentMethod) {
      alert("Please select a payment method before proceeding to checkout.");
      return;
    }
  
    if (paymentMethod === "gcash") {
      if (!amountPaid || parseFloat(amountPaid) < totalAmount) {
        alert("Please enter a valid amount paid.");
        return;
      }
      if (!gcashRefNumber) {
        alert("Please enter the GCash reference number.");
        return;
      }
    }
  
    // Prepare the order data
    const newOrder = {
      id: schoolId, // Use the school ID as the order ID
      schoolId, // Customer's school ID
      name: clientName, // Customer's name
      paymentMethod, // Payment method (e.g., cash, GCash)
      amountPaid: paymentMethod === "gcash" ? parseFloat(amountPaid) : null, // Amount paid (if applicable)
      gcashRefNumber: paymentMethod === "gcash" ? gcashRefNumber : null, // GCash reference number (if applicable)
      totalAmount, // Total amount to be paid
      quantity: Object.keys(cart).reduce((total, itemId) => total + cart[itemId], 0), // Total quantity
      dateTime: new Date().toLocaleString(), // Current date and time
      status: "Pending", // Initial status
      items: Object.keys(cart).map((itemId) => {
        const item = menuItems.find((item) => item._id === itemId);
        return {
          name: item.name,
          price: item.price,
          quantity: cart[itemId],
        };
      }), // List of items ordered
    };
  
    try {
      // Save the order to Firestore with the school ID as the document ID
      const ordersRef = collection(db, "orders");
      const orderDoc = doc(ordersRef, schoolId); // Use schoolId as the document ID
      await setDoc(orderDoc, newOrder);
  
      // Set the order number for confirmation
      setOrderNumber(schoolId);
  
      // Show success message
      alert(`Order Successful! Your order number is: ${schoolId}`);
  
      // Clear the cart and reset fields
      setCart({});
      setClientName("");
      setSchoolId("");
      setAmountPaid("");
      setGcashRefNumber("");
      setPaymentMethod("");
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to place the order. Please try again.");
    }
  };

 const finalizeCheckout = () => {
  setShowConfirmation(true);
};

const closeConfirmation = () => {
  setShowConfirmation(false);
};

const handlePaymentChange = (e) => {
  setPaymentMethod(e.target.value);
};

const totalAmount = Object.keys(cart).reduce((total, itemId) => {
  const item = menuItems.find(item => item._id === itemId);
  return total + (item ? item.price * cart[itemId] : 0);
}, 0);

const handleNameChange = (e) => {
  setClientName(e.target.value);
};

const handleSchoolIdChange = (e) => {
  const formattedValue = formatSchoolId(e.target.value);
  setSchoolId(formattedValue);
};

// Utility function outside the component
// strictly for formatting the school ID
const formatSchoolId = (value) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Apply the format: XX-XXXX-XXX
  let formatted = '';
  if (digits.length > 0) {
    formatted = digits.substring(0, 2);
    if (digits.length > 2) {
      formatted += '-' + digits.substring(2, 6);
      if (digits.length > 6) {
        formatted += '-' + digits.substring(6, 9);
      }
    }
  }
  return formatted;
};

// Validate order number format
const validateOrderNumber = (input) => {
  const regex = /^\d{2}-\d{4}-\d{3}$/; // Matches format like 12-3456-789
  return regex.test(input);
};

const handleOrderNumberChange = (e) => {
  const value = e.target.value;
  // Auto-insert hyphens at specific positions
  let formattedValue = value;
  
  if (value.length === 2 && orderNumber.length === 1) {
    formattedValue = value + '-';
  } 
  else if (value.length === 7 && orderNumber.length === 6) {
    formattedValue = value + '-';
  }
  // Prevent input longer than the format allows
  else if (value.length > 11) {
    formattedValue = value.slice(0, 11);
  }
  
  setOrderNumber(formattedValue);
  setIsValidOrderNumber(validateOrderNumber(formattedValue));
  setHasSearched(false);
};

const categoryIcons = {
  All: <UtensilsCrossed size={18} />,
  Rice: <Soup size={18} />,
  Dishes: <Salad size={18} />,
  Coffee: <Coffee size={18} />,
  Drinks: <CupSoda size={18} />,
  Snacks: <Cookie size={18} />,
};

  //render menu
  const renderMenuView = () => {
    return (
      <>
      <motion.div className="menu-container-pos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <motion.div className="search-bar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <input type="text" placeholder="Search for food..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </motion.div>
          <motion.div className="category-filter" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            {["All", "Rice", "Dishes", "Hot Drinks", "Cold Drinks", "Snacks"].map((cat) => (
              <motion.button key={cat} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={selectedCategory === cat ? "active-category" : ""} onClick={() => setSelectedCategory(cat)}>
                {cat}
                      
                {categoryIcons[cat]} {cat}

              </motion.button>
            ))}
          </motion.div>
          <motion.div className="menu-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <AnimatePresence mode="wait">
              {menuItems
                .filter((item) => (selectedCategory === "All" || item.category === selectedCategory) && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                  <motion.div key={item._id} className="menu-item-pos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <img src={item.imageURL} alt={item.name} className="item-img" />
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price">Php {item.price}</p>
                    <div className="quantity-selector">
                      <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => handleQuantityChange(item._id, -1)}
                        disabled={disabledItems[item._id]}
                        className={disabledItems[item._id] ? 'disabled' : ''}
                      >
                        -
                      </motion.button>
                      <span>{!disabledItems[item._id] ? (selectedQuantities[item._id] || 0) : 0}</span>
                      <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => handleQuantityChange(item._id, 1)}
                        disabled={disabledItems[item._id]}
                        className={disabledItems[item._id] ? 'disabled' : ''}
                      >
                        +
                      </motion.button>
                    </div>
                    <motion.button 
                      className={`add-to-cart ${disabledItems[item._id] ? 'disabled' : ''}`}
                      whileHover={{ scale: disabledItems[item._id] ? 1 : 1.1 }}
                      whileTap={{ scale: disabledItems[item._id] ? 1 : 0.9 }}
                      onClick={() => handleAddToCart(item)}
                      disabled={disabledItems[item._id] || (selectedQuantities[item._id] || 0) === 0}
                    >
                      {disabledItems[item._id] ? 'Added to Cart' : 'Add to Cart'}
                    </motion.button>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </>
    );
  };


 //render cart
 const renderCartView = () => {
  return (
    <div className="cart-container">
      <h2 className="view-title">🛒 Your Cart</h2>

      {/* Customer Type Selection */}
      {!customerType ? (
        <div className="customer-type-selection">
          <h3>Are you a:</h3>
          <div className="customer-type-options">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCustomerTypeChange("student")}
            >
              Student
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCustomerTypeChange("faculty")}
            >
              Faculty
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCustomerTypeChange("staff")}
            >
              Staff
            </motion.button>
          </div>
        </div>
      ) : (
        <>
          {/* Display selected customer type */}
          <div className="customer-type-display">
            <p>
              Customer Type:{" "}
              <strong>
                {customerType === "student"
                  ? "Student"
                  : customerType === "faculty"
                  ? "Faculty"
                  : "Staff"}
              </strong>
              <button 
                className="change-type-button"
                onClick={() => handleCustomerTypeChange("")}
              >
                Change
              </button>
            </p>
          </div>

          {/* Client Information Form */}
          <div className="client-info-form">
            <div className="client-info-input">
              <label htmlFor="client-name">Full Name:</label>
              <input
                type="text"
                id="client-name"
                placeholder="Enter your Full Name"
                value={clientName}
                onChange={handleNameChange}
                required
              />
            </div>

            {/* School ID field for all types */}
            <div className="school-id-input">
              <label htmlFor="school-id">
                {customerType === "student" 
                  ? "Student ID:" 
                  : customerType === "faculty"
                  ? "Faculty ID:"
                  : "Staff ID:"}
              </label>
              <input
                type="text"
                id="school-id"
                placeholder="12-3456-789, Note: Just input the numbers"
                value={schoolId}
                onChange={handleSchoolIdChange}
                required
                pattern="\d{2}-\d{4}-\d{3}"
                title="Please enter ID in format: 12-3456-789"
              />       
            </div>
          </div>

          {Object.keys(cart).length === 0 ? (
            <div className="empty-state-cart">
              <p>Your cart is empty</p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => changeView("menu")}
                className="return-to-menu"
              >
                🍽 Return to Menu
              </motion.button>
            </div>
          ) : (
            <div className="cart-items">
              {Object.keys(cart).map((itemId) => {
                const item = menuItems.find(item => item._id === itemId);
                if (!item) return null;
                
                return (
                  <motion.div 
                    key={itemId}
                    className="cart-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p>Php {item.price} × {cart[itemId]} = Php {(item.price * cart[itemId]).toFixed(2)}</p>
                    </div>
                    <div className="cart-item-actions">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantityChange(itemId, -1)}>-</motion.button>
                      <span>{cart[itemId]}</span>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantityChange(itemId, 1)}>+</motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRemoveItem(itemId)} className="trash-button">🗑</motion.button>
                    </div>
                  </motion.div>
                );
              })}
              
              <div className="cart-summary">
                <div className="cart-total">
                  <strong>Total:</strong>
                  <span>
                    Php {Object.keys(cart).reduce((total, itemId) => {
                      const item = menuItems.find(item => item._id === itemId);
                      return total + (item ? item.price * cart[itemId] : 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
        
                {/* Payment Method Section */}
                <div className="payment-method">
                  <h4>Select Payment Method:</h4>
                  <div className="payment-options">
                      <label>
                          <input type="radio" name="payment" value="cash" onChange={handlePaymentChange} /> Cash 💵
                      </label>
                      <label>
                          <input type="radio" name="payment" value="gcash" onChange={handlePaymentChange} /> GCash 📱
                      </label>
                  </div>

                  {/* Show GCash fields if selected */}
                  {paymentMethod === "gcash" && (
                      <div className="gcash-fields">
                          <label>Amount Paid:</label>
                          <input
                              type="number"
                              placeholder="Enter amount paid"
                              value={amountPaid}
                              onChange={(e) => setAmountPaid(e.target.value)}
                          />
                          <br />

                          <label>GCash Reference Number:</label>
                            <input
                                type="text"
                                placeholder="Enter reference number"
                                value={gcashRefNumber}
                                onChange={(e) => setGcashRefNumber(e.target.value)}
                          />
                      </div>
                  )}
                </div>      

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="checkout-button"
                  onClick={handleCheckout}
                >
                  ✅ Proceed to Checkout
                </motion.button>
              </div>
            </div>
          )}

          {showConfirmation && (
            <div className="confirmation-modal">
              <h3>Order Confirmed</h3>
              <p>Thank you for your purchase!</p>
              <button onClick={closeConfirmation}>Close</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

  //render track order
  const renderTrackOrderView = () => {
    const handleTrackOrder = () => {
      const validStatuses = ["Pending", "Preparing", "Ready to Pickup"];
      const foundOrder = recentOrders.find(
        (order) => order.id === orderNumber && validStatuses.includes(order.status)
      );
      setTrackedOrder(foundOrder || null);
      setHasSearched(true);
      setShowTrackOrderModal(true); // Always show modal after search
    };
  
    const closeTrackOrderModal = () => {
      setShowTrackOrderModal(false);
      setOrderNumber("");
      setTrackedOrder(null);
      setHasSearched(false);
    };
  
    // Filter out the "order" document
    const filteredOrders = recentOrders.filter((order) => order.id !== "order");
  
    return (
      <div className="track-order">
        <h2 className="view-title">Track Your Order</h2>
        
        {/* Order Tracking Form */}
        <form
          className="order-tracking-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleTrackOrder();
          }}
        >
          <label htmlFor="orderNumber" className="order-label">
            Enter your order number:
          </label>
          <input
            type="text"
            id="orderNumber"
            placeholder="e.g., 12-3456-789"
            className="order-number-input"
            value={orderNumber}
            onChange={handleOrderNumberChange}
            maxLength={11} // Limits to XX-XXXX-XXX format
          />
          <motion.button
            whileHover={{ scale: isValidOrderNumber ? 1.05 : 1 }}
            whileTap={{ scale: isValidOrderNumber ? 0.95 : 1 }}
            className={`track-button ${!isValidOrderNumber ? 'disabled-button' : ''}`}
            type="submit"
            disabled={!isValidOrderNumber}
          >
            Track Order
          </motion.button>
        </form>
  
        {/* Track Order Modal (shows for both found and not found cases) */}
        {showTrackOrderModal && (
          <div className="track-order-modal">
            <div className="track-order-modal-content">
              <button 
                className="back-button"
                onClick={closeTrackOrderModal}
              >
                ← Back
              </button>
              
              {/* Show order details if found */}
              {trackedOrder ? (
                <div className="tracked-order-details">
                  <h2>Order Details</h2>
                  <table className="tracked-order-table">
                    <tbody>
                      <tr>
                        <td className="tracked-order-label"><strong>Order ID:</strong></td>
                        <td className="tracked-order-value">{trackedOrder.id}</td>
                      </tr>
                      <tr>
                        <td className="tracked-order-label"><strong>Date Ordered:</strong></td>
                        <td className="tracked-order-value">{trackedOrder.dateTime}</td>
                      </tr>
                      <tr>
                        <td className="tracked-order-label"><strong>Total Amount:</strong></td>
                        <td className="tracked-order-value">₱{trackedOrder.totalAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="tracked-order-label"><strong>Status:</strong></td>
                        <td className="tracked-order-value">{trackedOrder.status}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <h3>Items Ordered:</h3>
                  <ul className="tracked-order-items">
                    {trackedOrder.items.map((item, idx) => (
                      <li key={idx} className="tracked-order-item">
                        {item.name} (x{item.quantity}) - ₱{item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                /* Show not found message if search was performed but no order found */
                <div className="no-order-found-modal">
                  <h2>Order Not Found</h2>
                  <div className="no-order-message">
                    <p>No active order found with ID: <strong>{orderNumber}</strong></p>
                    <p>Please check the number and try again.</p>
                    <p className="note">Note: Only orders with status "Pending", "Preparing", or "Ready to Pickup" can be tracked.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
  
        {/* Recent Orders Table (always visible) */}
        <div className="recent-orders">
          <h2 className="orders-title-pos">Recent Orders</h2>
          <div className="orders-table-container-pos">
            <table className="orders-table-pos">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date Ordered</th>
                  <th>Menus Ordered</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.id}</td>
                    <td>{order.dateTime}</td>
                    <td>
                      {order.items.map((item, idx) => (
                        <div key={idx}>
                          {item.name} (x{item.quantity}) - ₱{item.price}
                        </div>
                      ))}
                    </td>
                    <td>₱{order.totalAmount.toFixed(2)}</td>
                    <td className="status">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="pos-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header moved outside of pos-page to be full width at the top */}
      <motion.header
        className="navbar-pos"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="logo-container-pos">
          <img src="/new-mainlogo.svg" className="new-logo" alt="Wildcats Express" />
          <span className="title">
            <h1>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                    Wildcats Express
              </Link>
            </h1>
            <small>CIT-UNIVERSITY</small>
          </span>
        </div>
      </motion.header>
      
      {/* Main content container that includes both sidebar and content */}
      <div className="main-content-container">
        {/* Sidebar moved inside main content container */}
        <motion.aside
          className="sidebar-pos"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={currentView === "menu" ? "active-view-button" : ""}
            onClick={() => changeView("menu")}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
          >
            <UtensilsCrossed size={20} />
            Menu         
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={currentView === "cart" ? "active-view-button" : ""}
            onClick={() => changeView("cart")}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
          >
            <ShoppingCart size={20} />
            Cart           
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={currentView === "trackOrder" ? "active-view-button" : ""}
            onClick={() => changeView("trackOrder")}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
          >
            <MapPinned size={20} />
            Track Order           
          </motion.button>
        </motion.aside>
    
        {/* Content area */}
        <div className="pos-page">
          {/* Content based on current view */}
          <AnimatePresence mode="wait">

          {"Menu Modal"}
          {currentView === "menu" && (
            <motion.div
            key="menu-view"
            className="view-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>{renderMenuView()}</div> 
          </motion.div>   
          )}

          {"Cart Modal"}
          {currentView === "cart" && (
          <motion.div
            key="cart-view"
            className="view-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>{renderCartView()}</div>
          </motion.div>
            )}

          {"TrackOrder Modal"}
          {currentView === "trackOrder" && (
              <motion.div
                key="track-order-view"
                className="view-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div>{renderTrackOrderView()}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default PosPage;