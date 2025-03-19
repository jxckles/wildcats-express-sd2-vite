import {Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { redirectToLoginIfLoggedOut, handleLogout, db } from "../../config/firebase-config";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import "./pos-page.css";

const PosPage = () => {
  const navigate = useNavigate();
  const loading = redirectToLoginIfLoggedOut(navigate);
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("menu"); 
  const [schoolId, setSchoolId] = useState(""); 
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [gcashRefNumber, setGcashRefNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState(null);
  const [clientName, setClientName] = useState(""); // Store client's name
  const [trackedOrder, setTrackedOrder] = useState(null);

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

  if (loading) {
    return <div>Loading...</div>; // Prevent UI from showing unless logged in
  }

  const handleQuantityChange = (id, change) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + change),
    }));
  };

  const handleAddToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item._id]: (prev[item._id] || 1),
    }));
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

  const handleCheckout = () => {
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

    // Generate a unique order number (e.g., based on timestamp)
    const newOrderNumber = `WCE-${Date.now()}`;
    setOrderNumber(newOrderNumber);

    alert(`Order Successful! Your order number is: ${newOrderNumber}`);

    console.log("Order Number:", newOrderNumber);
    console.log("Checkout successful with payment method:", paymentMethod);
    if (paymentMethod === "gcash") {
        console.log("Amount Paid:", amountPaid);
        console.log("GCash Reference Number:", gcashRefNumber);
    }

    // Clear cart after successful checkout
    setCart({});
    setAmountPaid("");
    setGcashRefNumber(""); 

    // Show confirmation modal
    finalizeCheckout(newOrderNumber);
};

 const finalizeCheckout = () => {
  setShowConfirmation(true);
};

const closeConfirmation = () => {
  setShowConfirmation(false);
};

const handleRemoveItem = (itemId) => {
  setCart((prevCart) => {
    const newCart = { ...prevCart };
    delete newCart[itemId]; 
    return newCart;
  });
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
  setSchoolId(e.target.value);
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
            {["All", "Rice", "Dishes", "Coffee", "Drinks", "Snacks"].map((cat) => (
              <motion.button key={cat} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={selectedCategory === cat ? "active-category" : ""} onClick={() => setSelectedCategory(cat)}>
                {cat}
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
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantityChange(item._id, -1)}>-</motion.button>
                      <span>{cart[item._id] || 0}</span>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantityChange(item._id, 1)}>+</motion.button>
                    </div>
                    <motion.button className="add-to-cart" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleAddToCart(item)}>
                      Add to Cart
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
        {/* Display Client's Name at the Top Left */}
        {clientName && <h3 className="client-name">👤 {clientName}</h3>}
        <h2 className="view-title">🛒 Your Cart</h2>

        <div className="client-info-input">
          <label htmlFor="client-name">Full Name:</label>
          <input
            type="text"
            id="client-name"
            placeholder="Enter your Full Name"
            value={clientName}
            onChange={handleNameChange}
          />  
        </div>

        <div className="school-id-input">
          <label htmlFor="school-id">School ID Number:</label>
          <input
            type="text"
            id="school-id"
            placeholder="Enter your School ID"
            value={schoolId}
            onChange={handleSchoolIdChange}
          />
        </div>

          {showConfirmation && (
            <div className="confirmation-modal">
              <h3>Order Confirmed</h3>
              <p>Thank you for your purchase!</p>
              <button onClick={closeConfirmation}>Close</button>
            </div>
          )}

        
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

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRemoveItem(itemId)}
              className="trash-button"
            >
            </motion.button>
          </div>
        </div>
      )}
      </div>
    );
  };

  

  //render track order
  const renderTrackOrderView = () => {
    const orders = [
      {
        id: "19-3950-969",
        date: "February 14, 2025",
        items: [
          { name: "Fried Chicken", quantity: 1, price: 30 },
          { name: "Chicken Adobo", quantity: 1, price: 80 },
        ],
        total: 110,
        status: "Pending",
      },
      {
        id: "20-3950-969",
        date: "February 27, 2025",
        items: [
          { name: "Chicken Adobo", quantity: 1, price: 80 },
          { name: "Bulalo", quantity: 1, price: 100 },
        ],
        total: 180,
        status: "Pending",
      },
      {
        id: "18-3950-969",
        date: "February 28, 2025",
        items: [{ name: "Chicken Adobo", quantity: 1, price: 80 }],
        total: 80,
        status: "Pending",
      },
    ];

    const handleTrackOrder = () => {
      const foundOrder = orders.find((order) => order.id === orderNumber);
      setTrackedOrder(foundOrder || null);
    };

    return (
      <div className="track-order">
        <h2 className="view-title">Track Your Order</h2>
        <div className="track-order-content">
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
              placeholder="e.g., xx-xxxx-xx" 
              className="order-number-input"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="track-button"
            >
              Track Order
            </motion.button>
          </form>
        </div>

          {/* Display Tracked Order */}
        {trackedOrder && (
          <div className="tracked-order">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> {trackedOrder.id}</p>
            <p><strong>Date Ordered:</strong> {trackedOrder.date}</p>
            <p><strong>Total Amount:</strong> ₱{trackedOrder.total}</p>
            <p><strong>Status:</strong> {trackedOrder.status}</p>
            <h3>Items Ordered:</h3>
            <ul>
              {trackedOrder.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} (x{item.quantity}) - ₱{item.price}
                </li>
              ))}
            </ul>
          </div>
        )}

  
        {/* Recent Orders Table */}
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
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.id}</td>
                  <td>{order.date}</td>
                  <td>
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        {item.name} (x{item.quantity}) - ₱{item.price}
                      </div>
                    ))}
                  </td>
                  <td>₱{order.total}</td>
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
          >
            Menu
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={currentView === "cart" ? "active-view-button" : ""}
            onClick={() => changeView("cart")}
          >
            Cart
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={currentView === "trackOrder" ? "active-view-button" : ""}
            onClick={() => changeView("trackOrder")}
          >
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