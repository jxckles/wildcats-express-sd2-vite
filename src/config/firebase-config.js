// Import authentication functions from Firebase
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc8RjtuaZOMWn4AA9ovmw1OOLDbwlSwWM",
  authDomain: "wildcats-express-pos.firebaseapp.com",
  projectId: "wildcats-express-pos",
  storageBucket: "wildcats-express-pos.firebasestorage.app",
  messagingSenderId: "908404798026",
  appId: "1:908404798026:web:c14da08358320310f5ecb3",
  measurementId: "G-30FN1V543L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Create an AdminAuth class to encapsulate login logic
class AdminAuth {
  // Private variables to hold admin credentials
  #adminEmail = "wildcats_express.admin@cit.edu"; // Admin email
  #adminPassword = "wildcats.admin"; // Admin password

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

// Export an instance of AdminAuth
export const adminAuth = new AdminAuth();

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

