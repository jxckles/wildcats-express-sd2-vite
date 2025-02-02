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

// Create an AdminAuth class to encapsulate login logic
class AdminAuth {
  // Private variables to hold admin credentials
  #adminEmail = import.meta.env.VITE_ADMIN_EMAIL; // Admin email
  #adminPassword = import.meta.env.VITE_ADMIN_PASSWORD; // Admin password

  // Function to check if credentials are correct
  async login(username, password) {
    if (this.#checkCredentials(username, password)) {
      return await this.signInAdmin();
    } else {
      throw new Error("Invalid admin credentials!");
    }
  }

  // Protected method to simulate credentials checking
  #checkCredentials(username, password) {
    return username === this.#adminEmail && password === this.#adminPassword;
  }

  // Function to handle the actual Firebase admin login
  async signInAdmin() {
    try {
      // Use Firebase authentication to sign in as admin
      const userCredential = await signInWithEmailAndPassword(auth, this.#adminEmail, this.#adminPassword);
      console.log("Admin logged in:", userCredential.user);
      return userCredential.user;
    } catch (error) {
      throw new Error("Error during login: " + error.message);
    }
  }

  // Public method to access the admin email (for checking purposes)
  isAdminEmail(email) {
    return email === this.#adminEmail;
  }
}

// Instantiate AdminAuth
const adminAuth = new AdminAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (adminAuth.isAdminEmail(user.email)) {
      // Only redirect if not already on admin page
      if (window.location.pathname !== "/admin-page") {
        window.location.href = "/admin-page";
      }
    } else {
      // If not admin, show an error message
      alert("Access denied: You are not an admin.");
    }
  }
});

// To check if user is logged out and trying to access pages other than login/signup:
const redirectToLoginIfLoggedOut = (navigate) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.warn("Unauthorized access! Please log in.");
        setTimeout(() => {
          navigate("/");
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
    navigate("/");
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
        navigate("/admin-page");
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
  auth, db, adminAuth,
  redirectToLoginIfLoggedOut,
  handleLogout,
  redirectToLandingIfLoggedIn
};