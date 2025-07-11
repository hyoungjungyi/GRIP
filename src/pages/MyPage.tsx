import Navbar from "../components/Navbar/Navbar";
import React from "react";

const MyPage = () => {
  return (
    <div>
      <div style={{ padding: "2rem" }}>
        <h1>My Page</h1>
        <p>Welcome to your profile page.</p>
        <ul>
          <li>Username: user123</li>
          <li>Email: user123@example.com</li>
          <li>Posts: 12</li>
          <li>Comments: 34</li>
        </ul>
      </div>
    </div>
  );
};

export default MyPage;
