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
      <div className={styles.listTitle}>크로메틱 연습 리스트</div>
      {logs.length === 0 ? (
        <div className={styles.empty}>연습 기록이 없습니다.</div>
      ) : (
        <ul className={styles.logList}>
          {logs.map((log, idx) => (
            <li key={idx} className={styles.logItem}>
              <div className={styles.pattern}>{log.pattern}</div>
              <div className={styles.detail}>
                BPM: <b>{log.bpm}</b> / 시간: <b>{log.duration}초</b>
              </div>
              <div className={styles.timestamp}>
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChromaticList;
