import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { adminAuth } from "../../../config/firebase-config"; 
import { useGetUserInfo } from "../../../hooks/useGetUserInfo";
import catImage from "/src/svg/new-cat.svg";
import { toast, ToastContainer } from "react-toastify";  // Importing toast and ToastContainer
import "react-toastify/dist/ReactToastify.css";  // Importing the toast styles
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const { isAuth } = useGetUserInfo();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

     // Dismiss any existing toasts to prevent repeats
     toast.dismiss();
     
    try {
      await adminAuth.login(username, password); 
      toast.success("Login successful!");  // Show success toast
      navigate("/admin-page"); 
    } catch (error) {
      console.error("Login failed: ", error.message);
      toast.error(`${error.message}`);  // Show error toast
    }
  };

  if (isAuth) {
    return <Navigate to="/admin-page" />;
  }

  return (
    <>  
      <div className="login-page">
        <div className="login-container">
        <div className="mascot-container">
            <img src={catImage} alt="Mascot" className="mascot-image" />
          </div>
          <div className="form-container">
            <div className="wildcats-title">
            <h2 className="wildcats">Wildcats </h2>
            <h2 className="express">Express</h2>
            </div>
            <h3>Admin</h3>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
              <button type="submit" className="login-button">Login</button>
            </form>
          </div>

        </div>
      </div>
      

      {/* Toast container for displaying toasts */}
      <ToastContainer 
        position="top-left"
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

export default Login;
