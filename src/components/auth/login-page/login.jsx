import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../../config/firebase-config";
import { useNavigate, Navigate } from "react-router-dom";
import { useGetUserInfo } from "../../../hooks/useGetUserInfo";
import GoogleLogo from "../../../svg/Google.svg";
import "./login.css";

const Login = () => {
  const navigate = useNavigate()
  const { isAuth } = useGetUserInfo()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const signInWithGoogle = async () => {
    try {
      const results = await signInWithPopup(auth, provider)
      const authInfo = {
        userID: results.user.uid,
        name: results.user.displayName,
        profilePhoto: results.user.photoURL,
        isAuth: true,
      }
      localStorage.setItem('auth', JSON.stringify(authInfo))
      navigate('/admin-page')
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // Add your login logic here
  }

  if (isAuth) {
    return <Navigate to="/admin-page" />
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <div className="divider">OR</div>
        <button className="login-with-google-btn" onClick={signInWithGoogle}>
          <img 
            src={GoogleLogo}
            alt="Google logo"
            className="google-icon"
          />
        </button>
      </div>
    </div>
  )
}

export default Login
