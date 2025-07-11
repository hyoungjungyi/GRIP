import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import PitchVisualizer from "./PitchVisualizer";
import "./Tuner.css";

import guitarHead from "../../assets/guitar_head.png";
import guitarHead_E2 from "../../assets/guitar_head_E2.png";
import guitarHead_A from "../../assets/guitar_head_A.png";
import guitarHead_D from "../../assets/guitar_head_D.png";
import guitarHead_G from "../../assets/guitar_head_G.png";
import guitarHead_B from "../../assets/guitar_head_B.png";
import guitarHead_E from "../../assets/guitar_head_E.png";

const guitarHeadImages: { [key: string]: string } = {
  N: guitarHead,
  E: guitarHead_E,
  A: guitarHead_A,
  D: guitarHead_D,
  G: guitarHead_G,
  B: guitarHead_B,
  e: guitarHead_E2, // Assuming 'e' for high E string
};

const Tuner: React.FC = () => {
  const [activeString, setActiveString] = useState<string | null>(null);
  const strings = ["E", "A", "D", "G", "B", "e"]; // Use 'e' for high E string

  const currentGuitarHeadImage = activeString
    ? guitarHeadImages[activeString]
    : guitarHead; // Default to E2 if no string is active

  return (
    <>
      <Navbar />
      <div className="tuner-container">
        <div className="pitch-visualizer-container">
          <PitchVisualizer setActiveString={setActiveString} />
        </div>
        <div className="guitar-container">
          <div className="indicator-container">
            {strings.reverse().map((stringName) => (
              <div
                key={stringName}
                className={`indicator ${
                  activeString === stringName ? "active" : ""
                }`}
              >
                {stringName}
              </div>
            ))}
          </div>
          <img
            src={currentGuitarHeadImage}
            alt="Guitar Head"
            className="guitar-head-image"
          />
        </div>
      </div>
    </>
  );
};

export default Tuner;
