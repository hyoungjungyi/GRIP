import React, {useState} from "react";
import { Link } from "react-router-dom";
import LoginModal from "./LoginModal";
import "./Navbar.css"; // Optional: style the navbar separately

const Navbar: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  return (
    <>
      <nav className="navbar">
      <ul className="navbar-links">
        <li>
          <Link to="/tuner">Tuner</Link>
        </li>
        <li>
          <Link to="/sheetList">Sheet Viewer</Link>
        </li>
        <li>
          <Link to="/mypage">My Page</Link>
        </li>
        <li><button onClick={openLogin} className="login-btn">Login</button></li>
      </ul>
    </nav>
    <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
    </>
  );
};

export default Navbar;
