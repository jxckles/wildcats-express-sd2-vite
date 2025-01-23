//Import authentification functions from firebase
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore} from "firebase/firestore";


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// google auth variables
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);