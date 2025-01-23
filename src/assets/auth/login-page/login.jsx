import { useState } from 'react'
import { signInWithPopup, Auth, AuthProvider } from 'firebase/auth'
import { useNavigate, Navigate } from 'react-router-dom'
import { auth, provider } from '@/config/firebase-config'
import { useGetUserInfo } from '@/hooks/useGetUserInfo'
import GoogleLogo from '@/assets/Google.svg'
import './Login.css'

interface AuthInfo {
  userID: string
  name: string | null
  profilePhoto: string | null
  isAuth: boolean
}

const Login = () => {
  const navigate = useNavigate()
  const { isAuth } = useGetUserInfo()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const results = await signInWithPopup(auth as Auth, provider as AuthProvider)
      const authInfo: AuthInfo = {
        userID: results.user.uid,
        name: results.user.displayName,
        profilePhoto: results.user.photoURL,
        isAuth: true,
      }
      localStorage.setItem('auth', JSON.stringify(authInfo))
      navigate('/main-page')
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  const handleLogin = (e: React.FormEvent): void => {
    e.preventDefault()
    // Add your login logic here
  }

  if (isAuth) {
    return <Navigate to="/main-page" />
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