import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../config/firebase-config";
import { collection, onSnapshot} from 'firebase/firestore';
import "./pos-page.css";

const PosPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);

  // Menu Items (Collection) real-time listener
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


  const handleQuantityChange = (id, change) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + change),
    }));
  };


  return (
    <div className="pos-page">
      <header className="navbar">
        <div className="logo-container-pos">
          <img src="logo.png" />
          <span className="title">
            <h1>Wildcats Express</h1>
            <small>CIT-UNIVERSITY</small>
          </span>
        </div>
        <button className="menu-btn">☰</button>
      </header>

      <div className="category-filter">
        {["Rice", "Dishes", "Coffee", "Drinks", "Snacks"].map((cat) => (
          <button key={cat}>{cat}</button>
        ))}
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div key={item._id} className="menu-item-pos">
            <img src={item.imageURL} alt={item.name} className="item-img" />
            <h3 className="item-name">{item.name}</h3>
            <p className="item-price">{item.price}</p>
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
              <span>{cart[item.id] || 1}</span>
              <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
            </div>
            <button className="add-to-cart">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PosPage;