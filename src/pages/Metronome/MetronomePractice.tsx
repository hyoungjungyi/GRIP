import React, { useState } from "react";
import Metronome from "./Metronome/Metronome";
import ChromaticPractice from "./ChromaticPractice/ChromaticPractice";
import PracticeLog from "../../components/PracticeLog/PracticeLog";
import Navbar from "../../components/Navbar/Navbar";

interface PracticeLogEntry {
  pattern: string;
  bpm: number;
}

const MetronomePractice: React.FC = () => {
  const [practiceLogs, setPracticeLogs] = useState<PracticeLogEntry[]>([]);

  const addLog = (pattern: string, bpm: number) => {
    setPracticeLogs((prevLogs) => [...prevLogs, { pattern, bpm }]);
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Metronome Practice</h1>

        <section style={{ marginBottom: "40px" }}>
          <h2>Metronome</h2>
          <Metronome />
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2>Chromatic Practice</h2>
          <ChromaticPractice addLog={addLog} />
        </section>

        <section>
          <PracticeLog logs={practiceLogs} />
        </section>
      </div>
    </>
  );
};

export default MetronomePractice;
