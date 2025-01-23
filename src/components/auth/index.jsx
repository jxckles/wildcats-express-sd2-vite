import { Link } from "react-router-dom";
import catImage from "/src/svg/mainlogo.svg";
import "./authstyles.css";

export const Auth = () => {
  return (
    <>
      <main className="main-content">
        <div className="rh1">
          <div className="hide-mobile">
            <h1 className="wildcats-desktop">
              Wildcats <span className="express-mobile">Express</span>
            </h1>
          </div>
          <div className="hide-title">
            <h1 className="wildcats-mobile">
              Wildcats <span className="express-mobile">Express</span>
            </h1>
          </div>
          <h3>Fast. Fresh. Fierce.</h3>
          <Link to="/login-page" className="primary-cta">
            Order Here
          </Link>
        </div>
        <div className="cat">
          <img src={catImage} alt="Photo of Wildcat chef" />
        </div>
      </main>
    </>
  );
};
