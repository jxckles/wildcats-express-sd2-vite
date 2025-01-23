import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { adminAuth } from "../../../config/firebase-config"; 
import { useGetUserInfo } from "../../../hooks/useGetUserInfo";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const { isAuth } = useGetUserInfo();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await adminAuth.login(username, password); 
      navigate("/admin-page"); 
    } catch (error) {
      console.error("Login failed: ", error.message);
      alert(error.message);
    }
  };

  if (isAuth) {
    return <Navigate to="/admin-page" />;
  }

  return (
    <>  
      <div className="login-page">
        <div className="login-container">
          <div className="form-container">
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
              <button type="submit" className="login-button">Login</button>
            </form>
          </div>
          <div className="mascot-container">
            <img src="src/svg/cat_model.svg" alt="Mascot" className="mascot-image" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
