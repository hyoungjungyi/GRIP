import React from "react";
import styles from "./PracticeLog.module.css";

interface PracticeLogEntry {
  pattern: string;
  bpm: number;
}

interface PracticeLogProps {
  logs: PracticeLogEntry[];
}

const PracticeLog: React.FC<PracticeLogProps> = ({ logs }) => {
  return (
    <div className={styles.practiceLogContainer}>
      <h2>Today's Chromatic Log</h2>
      {logs.length === 0 ? (
        <p>No practice logs yet.</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              Pattern: {log.pattern}, BPM: {log.bpm}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PracticeLog;
