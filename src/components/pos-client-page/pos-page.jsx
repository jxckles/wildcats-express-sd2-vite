import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../config/firebase-config";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import "./pos-page.css";

const PosPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("menu"); // Possible values: "menu", "cart", "trackOrder"

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


  //render menu
  const renderMenuView = () => {
    return (
      <>
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
      </>
    );
  };

  //render cart
  const renderCartView = () => {
    return (
      <div className="cart-container">
        <h2 className="view-title">🛒 Your Cart</h2>
        
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
  
            <div className="payment-method">
              <h4>Select Payment Method:</h4>
              <div className="payment-options">
                <label>
                  <input type="radio" name="payment" value="cash" /> Cash 💵
                </label>
                <label>
                  <input type="radio" name="payment" value="gcash" /> GCash 📱
                </label>
              </div>
            </div>
  
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="checkout-button"
            >
              ✅ Proceed to Checkout
            </motion.button>
          </div>
        </div>
      )}
      </div>
    );
  };

  

  //render track order
  const renderTrackOrderView = () => {
    return (
      <> 
      <div className="track-order">
      <h2 className="view-title">Track Your Order</h2>

        <div className="track-order-content">
          {/* You would implement order tracking here */}
          <div className="order-tracking-form">
            <input 
              type="text" 
              placeholder="Enter your order number"
              className="order-number-input"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="track-button"
            >
              Track
            </motion.button>
          </div>
        </div>
      </div>
      </>
    )
  }

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
            <h1>Wildcats Express</h1>
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