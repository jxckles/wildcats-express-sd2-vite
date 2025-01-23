import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase-config";
import "./main-page-styles.css";

const MainPage = () => {
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
      <div className="main-page">
        <button className="sign-out-button" onClick={signUserOut}>
          Sign Out
        </button>
      </div>
    </>
  );
};

export default MainPage;