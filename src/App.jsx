import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Auth } from "./components/auth";
import { MainPage } from "./components/main-page/main-page";
import { Login } from "./components/auth/login-page/login";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Auth />} />
          <Route path="/login-page" element={<Login />} />
          <Route path="/main-page" element={<MainPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
