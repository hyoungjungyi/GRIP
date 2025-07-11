import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import guitarHead from "../../assets/guitar_head.png";
import PitchVisualizer from "./PitchVisualizer";
import "./Tuner.css";

const Tuner: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="tuner-container">
        <PitchVisualizer />
      </div>
    </>
  );
};

export default Tuner;
