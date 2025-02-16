import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./pos-page.css";

const menuItems = [
  { id: 1, name: "PALABOK", price: "₱30.00", image: "palabok.png" },
  { id: 2, name: "BURGERSTEAK", price: "₱50.00", image: "burgersteak.png" },
  { id: 3, name: "SUNNY SIDE UP", price: "₱10.00", image: "sunny.png" },
  { id: 4, name: "PALABOK", price: "₱30.00", image: "palabok.png" },
  { id: 5, name: "PALABOK", price: "₱30.00", image: "palabok.png" },
  { id: 6, name: "PALABOK", price: "₱30.00", image: "palabok.png" },
];

const PosPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({});

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
          <div key={item.id} className="menu-item-pos">
            <img src={item.image} alt={item.name} className="item-img" />
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