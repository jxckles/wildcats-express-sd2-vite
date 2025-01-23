import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase-config";
import "./admin-page.css";

const AdminPage = () => {
  const navigate = useNavigate();

  const signUserOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="admin-page">
      <h1>THIS IS ADMIN PAGE!</h1>
        
        <div className="sign-out">
          <button className="sign-out-button" onClick={signUserOut}>
            Sign Out
          </button>
        </div>
        
      </div>
    </>
  );
};

export default AdminPage;