import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import guitarHead from "../assets/guitar_head.png";
import "./Tuner.css";

const Tuner: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="tuner-container">
        {/* Pitch visualizer */}
        <div className="pitch-visualizer">
          <div className="center-line" />
          <div className="indicator">⬤</div>
        </div>

        {/* Guitar image */}
        <div className="guitar-area">
          <img src={guitarHead} alt="Guitar Head" className="guitar-image" />
        </div>

        {/* String labels */}
        <div className="string-labels">
          {["E", "A", "D", "G", "B", "E"].map((note, idx) => (
            <button key={idx} className="string-button">
              {note}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Tuner;
