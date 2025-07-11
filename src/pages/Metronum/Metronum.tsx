import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import Nav_Met from "../../components/Nav_Met/Nav_Met";

const Metronum: React.FC = () => {
  return (
    <div className="metronum-page">
      <Navbar />
      <div className="metronum-content">
        <h1>Metronome Page</h1>
        {/* 메트로놈 기능이 여기에 들어갈 예정 */}
      </div>
      <Nav_Met />
    </div>
  );
};

export default Metronum;
