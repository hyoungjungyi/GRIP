import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Optional: style the navbar separately

const Navbar = () => {
  return (
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
      </ul>
    </nav>
  );
};

export default Navbar;
