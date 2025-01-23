import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./components/auth/home.jsx";
import AdminPage from "./components/admin-page/admin-page.jsx";
import PosPage from "./components/pos-client-page/pos-page.jsx";
import Login from "./components/auth/login-page/login";

function App() {
  return (
    <>
      <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/login-page" element={<Login />} />
          <Route path="/admin-page" element={<AdminPage />} />
          <Route path="/pos-page" element={<PosPage />} />
        </Routes>
      </Router>
      </div>
    </>
   
  );
}

export default App;
