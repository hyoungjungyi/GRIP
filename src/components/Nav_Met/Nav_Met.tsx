import React from "react";
import { useNavigate } from "react-router-dom";

export default function Nav_Met() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        margin: "20px 0",
      }}
    >
      <button onClick={() => navigate("/tuner")}>Tuner</button>
      <button onClick={() => navigate("/metronum")}>Metronome</button>
    </div>
  );
}
