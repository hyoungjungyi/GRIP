import React, { useEffect, useState } from "react";
import styles from "./ChromaticList.module.css";

interface ChromaticLog {
  pattern: string;
  bpm: number;
  duration: number;
  timestamp: string;
}

const ChromaticList: React.FC = () => {
  const [logs, setLogs] = useState<ChromaticLog[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("chromaticPracticeLogs");
    if (raw) {
      try {
        setLogs(JSON.parse(raw));
      } catch {
        setLogs([]);
      }
    }
  }, []);

  return (
    <div className={styles.listContainer}>
      <div className={styles.listTitle}>Chromatic Practice List</div>
      <div className={styles.scrollArea}>
        {logs.length === 0 ? (
          <div className={styles.empty}>No practice logs.</div>
        ) : (
          <ul className={styles.logList}>
            {logs.map((log, idx) => (
              <li key={idx} className={styles.logItem}>
                <span className={styles.pattern}>{log.pattern}</span>
                <span className={styles.detail}>
                  BPM: <b>{log.bpm}</b> / Time: <b>{log.duration} sec</b>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChromaticList;
