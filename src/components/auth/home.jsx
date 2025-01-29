import { Link } from "react-router-dom";
import catImage from "/src/svg/new-mainlogo.svg";
import "./homestyles.css";

const Home = () => {
  return (
    <>
      <main className="main-content">
        <div className="text-container">
          <div className="hide-mobile">
            <h1 className="wildcats-desktop">
              Wildcats <span className="express-mobile">Express</span>
            </h1>
          </div>
          <div className="hide-title">
          </div>
          <h3 className="typing-text">Fast. Fresh. Fierce.</h3>          <div className="order-button">
            <Link to="/login-page" className="primary-cta">
              Order Here
            </Link>
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
