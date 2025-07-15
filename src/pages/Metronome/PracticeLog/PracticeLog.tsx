import React from "react";
import styles from "./PracticeLog.module.css";

interface PracticeLogEntry {
  pattern: string;
  bpm: number;
  duration?: number;
}

interface PracticeLogProps {
  logs: PracticeLogEntry[];
  onDeleteLog?: (index: number) => void;
  onResumeLog?: (log: PracticeLogEntry) => void;
  onLoadLastPreset?: () => Promise<void>;
}

const PracticeLog: React.FC<PracticeLogProps> = ({
  logs,
  onDeleteLog,
  onResumeLog,
  onLoadLastPreset,
}) => {
  // 오늘 날짜(YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);
  // 오늘 로그만 필터링
  const todayLogs = logs.filter(
    (log: any) => log.timestamp && log.timestamp.slice(0, 10) === today
  );
  // 오늘 연습 총합
  const totalPracticeTime = todayLogs.reduce(
    (sum, log) => sum + (log.duration ?? 0),
    0
  );

  return (
    <div className={styles.practiceLogContainer}>
      <div className={styles.practiceLogHeader}>
        <h2>Today's Chromatic Log</h2>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Total Practice Time: {totalPracticeTime}초
        </div>
        {/* 프리셋 불러오기 버튼 */}
        {onLoadLastPreset && (
          <button
            onClick={onLoadLastPreset}
            style={{
              marginBottom: "12px",
              padding: "8px 16px",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            📊 Load Last Preset
          </button>
        )}
      </div>
      {todayLogs.length === 0 ? (
        <p>No practice logs yet.</p>
      ) : (
        <ul>
          {todayLogs.map((log, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <button
                style={{
                  marginRight: "12px",
                  color: "#1976d2",
                  fontWeight: "bold",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
                onClick={() => onResumeLog && onResumeLog(log)}
                aria-label="Resume log"
              >
                Resume
              </button>
              <span style={{ flex: 1 }}>
                Pattern: {log.pattern}, BPM: {log.bpm}, Time:{" "}
                {log.duration ?? 0}초
              </span>
              <button
                style={{
                  marginLeft: "12px",
                  color: "red",
                  fontWeight: "bold",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
                onClick={() => onDeleteLog && onDeleteLog(index)}
                aria-label="Delete log"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PracticeLog;
