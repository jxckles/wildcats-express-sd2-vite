import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase-config"; // Ensure correct import path
import { onAuthStateChanged } from "firebase/auth";
import catImage from "/src/svg/new-mainlogo.svg";
import "./homestyles.css";

const Home = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  ///// Brb ani block of code, overhaul admin flaggng
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user && adminAuth.isAdminEmail(user.email)) {
  //       setIsAdmin(true);
  //     } else {
  //       setIsAdmin(false);
  //     }
  //     setIsLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, []);

  const handleOrderClick = () => {
     if (isAdmin) {
       navigate("/pos-page");
     } else {
      navigate("/login-page");
    }
  };
  /////

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <main className="main-content">
        <div className="text-container">
          <div className="hide-mobile">
            <h1 className="wildcats-desktop">
              Wildcats <span className="express-mobile">Express</span>
            </h1>
          </div>
          <div className="hide-title"></div>
          <h3 className="typing-text">Fast. Fresh. Fierce.</h3>
          <h3 className="typing-text-mobile">Fast. Fresh. Fierce.</h3>
          <div className="order-button">
            <button onClick={handleOrderClick} className="primary-cta">
              Order Here
            </button>
          </div>
        </div>

        <div className="cat">
          <img src={catImage} alt="Photo of Wildcat chef" />
        </div>
      </main>
    </>
  );
};

export default Home;
