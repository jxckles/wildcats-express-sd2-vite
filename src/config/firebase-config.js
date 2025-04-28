// Import authentication functions from Firebase
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to handle Firebase login
const login = async (username, password) => {
  try {
    // Use Firebase authentication to sign in
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    console.log("User logged in:", userCredential.user);
    toast.success("Login successful!");
    return userCredential.user;
  } catch (error) {
    console.error("Error during login:", error.message);
    throw new Error("Error during login: Invalid Credentials");
    
  }
};

// To check if user is logged out and trying to access pages other than login/signup:
const redirectToLoginIfLoggedOut = (navigate) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.warn("Unauthorized access! Please log in.");
        setTimeout(() => {
          navigate("/login-page");
        }, 100);
      }  else {
        setLoading(false); // Allow access sa login page
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return loading;
};

// For Logout/Signing out locally (token) and from Firebase
const handleLogout = async (navigate) => {
  try {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/login-page");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

// Ensures Login page is accessible only when logged out
const redirectToLandingIfLoggedIn = (navigate) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Trying to access login/signup page while logged in.");
        navigate("/pos-page");
      }  else {
        setLoading(false); // Allow access sa login page
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return loading;
};

// Export
export { 
  auth, db, login,
  redirectToLoginIfLoggedOut,
  handleLogout,
  redirectToLandingIfLoggedIn
};