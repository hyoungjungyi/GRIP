import React, { useState } from "react";
import Metronome from "./Metronome/Metronome";
import ChromaticPractice from "./ChromaticPractice/ChromaticPractice";
import PracticeLog from "./PracticeLog/PracticeLog";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./MetronomePractice.module.css";
import Nav_Met from "../../components/Nav_Met/Nav_Met";

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
      <div className={styles.metronomePracticeContainer}>
        {/* Metronome Section (Main) */}
        <section className={styles.metronomeSection}>
          <h1>Metronome</h1>
          <Metronome />
        </section>

        {/* Chromatic Practice & Practice Log Section (Side) */}
        <div className={styles.sideSection}>
          <section>
            <h2>Chromatic Practice</h2>
            <ChromaticPractice addLog={addLog} />
          </section>

          <section>
            <PracticeLog logs={practiceLogs} />
          </section>
        </div>
      </div>
      <Nav_Met />
    </>
  );
};

export default MetronomePractice;
