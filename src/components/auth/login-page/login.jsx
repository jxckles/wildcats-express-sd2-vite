import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { login, redirectToLandingIfLoggedIn } from "../../../config/firebase-config"; 
import { useGetUserInfo } from "../../../hooks/useGetUserInfo";
import catImage from "/src/svg/thinking-cat.svg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TfiAngleDoubleLeft } from "react-icons/tfi";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const loading = redirectToLandingIfLoggedIn(navigate);

  const { isAuth } = useGetUserInfo();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (loading) {
    return <div>Loading...</div>; // Prevent UI from showing unless logged out
  }

  const containerAnimation = {
    exit: {
      scale: 0.95,
      opacity: 0,
      rotate: [0, -5],
      y: -50,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    toast.dismiss();
    try {
      await login(username, password);
      setIsSuccess(true);
      toast.success("Login successful!", {
        autoClose: 3000,
      });
      sessionStorage.setItem("hasLoggedIn", "true");
      setTimeout(() => {
        navigate("/pos-page");
      }, 3000);
    } catch (error) {
      console.error("Login failed: ", error.message);
      toast.error(`${error.message}`);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <>
      <AnimatePresence>
        {!isSuccess && ( 
          <motion.div
            key="login-page"
            className="login-page"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={containerAnimation.exit}
            variants={containerAnimation}
          >
            <div className="login-container">
              <motion.div 
                className="back-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <button type="button" className="button" onClick={handleBack}>
                  <TfiAngleDoubleLeft className="button-icon"/>
                </button>
              </motion.div>

              <motion.div 
                className="mascot-container"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <img src={catImage} alt="Mascot" className="mascot-image" />
              </motion.div>

              <motion.div 
                className="form-container"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="wildcats-title">
                  <h2 className="wildcats">Wildcats </h2>
                  <h2 className="express">Express</h2>
                </div>
                <h3>Admin</h3>
                <form onSubmit={handleLogin}>
                  <motion.input
                    type="text"
                    placeholder="Username"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  />
                  <motion.input
                    type="password"
                    placeholder="Password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  <motion.button 
                    type="submit" 
                    className="login-button"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Login
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
