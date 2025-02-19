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

  return (
    <motion.div 
      className="pos-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sidebar */}
      <motion.aside
        className="sidebar"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/menu")}
        >
          Menu
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/cart")}
        >
          Cart
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/track-order")}
        >
          Track Order
        </motion.button>
      </motion.aside>
  
      {/* Main Content */}
      <div className="pos-page">
        {/* Header */}
        <motion.header
          className="navbar"
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
  
        {/* Search Bar */}
        <motion.div
          className="search-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            placeholder="Search for food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>
  
        {/* Category Filter */}
        <motion.div
          className="category-filter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {["All", "Rice", "Dishes", "Coffee", "Drinks", "Snacks"].map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>
  
        {/* Menu Grid */}
        <motion.div
          className="menu-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                className="menu-item-pos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img src={item.imageURL} alt={item.name} className="item-img" />
                <h3 className="item-name">{item.name}</h3>
                <p className="item-price">{item.price}</p>
                <div className="quantity-selector">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantityChange(item._id, -1)}>
                    -
                  </motion.button>
                  <span>{cart[item._id] || 0}</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantityChange(item._id, 1)}>
                    +
                  </motion.button>
                </div>
                <motion.button
                  className="add-to-cart"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PosPage;