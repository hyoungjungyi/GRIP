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
  const [chromaticGoal, setChromaticGoal] = useState<{
    isOn: boolean;
    time: { hours: string; minutes: string };
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("chromaticPracticeLogs");
    if (raw) {
      try {
        setLogs(JSON.parse(raw));
      } catch {
        setLogs([]);
      }
    }

    // 크로매틱 목표 설정 불러오기
    const goalSettings = localStorage.getItem("practiceGoalSettings");
    if (goalSettings) {
      try {
        const settings = JSON.parse(goalSettings);
        setChromaticGoal(settings.chromatic);
      } catch {
        setChromaticGoal(null);
      }
    }

    // localStorage 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = () => {
      const updatedLogs = localStorage.getItem("chromaticPracticeLogs");
      const updatedSettings = localStorage.getItem("practiceGoalSettings");

      if (updatedLogs) {
        try {
          setLogs(JSON.parse(updatedLogs));
        } catch {
          setLogs([]);
        }
      }

      if (updatedSettings) {
        try {
          const settings = JSON.parse(updatedSettings);
          setChromaticGoal(settings.chromatic);
        } catch {
          setChromaticGoal(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 오늘 크로매틱 연습 시간 계산
  const getTodayPracticeTime = () => {
    const today = new Date().toISOString().slice(0, 10);
    return logs
      .filter((log) => log.timestamp && log.timestamp.slice(0, 10) === today)
      .reduce((total, log) => total + log.duration, 0);
  };

  const todayPracticeSeconds = getTodayPracticeTime();
  const goalSeconds = chromaticGoal
    ? (Number(chromaticGoal.time.hours) || 0) * 3600 +
      (Number(chromaticGoal.time.minutes) || 0) * 60
    : 0;
  const progressPercentage =
    goalSeconds > 0
      ? Math.min((todayPracticeSeconds / goalSeconds) * 100, 100)
      : 0;

  return (
    <div className={styles.listContainer}>
      <div className={styles.listTitle}>Chromatic Practice List</div>

      {/* 크로매틱 목표가 설정되어 있고 on 상태일 때만 진행률 표시 */}
      {chromaticGoal?.isOn && goalSeconds > 0 && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            />
            <div className={styles.progressText}>
              {Math.floor(todayPracticeSeconds / 60)}m{" "}
              {todayPracticeSeconds % 60}s / {Math.floor(goalSeconds / 60)}m (
              {Math.round(progressPercentage)}%)
            </div>
          </div>
        </div>
      )}

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
