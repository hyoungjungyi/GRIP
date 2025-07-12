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
  duration?: number; // 연습 시간(초)
}

const LOG_STORAGE_KEY = "chromaticPracticeLogs";
const LOG_EXPIRY_DAYS = 7;

const MetronomePractice: React.FC = () => {
  const [practiceLogs, setPracticeLogs] = useState<PracticeLogEntry[]>([]);
  const [practiceDuration, setPracticeDuration] = useState(0); // 누적 시간(초)
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = React.useRef<number | null>(null);

  // 시간 추적 시작/정지
  const handleTracking = () => {
    setIsTracking((prev) => !prev);
  };

  React.useEffect(() => {
    if (isTracking) {
      intervalRef.current = window.setInterval(() => {
        setPracticeDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isTracking]);

  // 로그 추가 시 로컬스토리지에도 저장
  const addLog = (pattern: string, bpm: number) => {
    const nowISO = new Date().toISOString();
    const newLog = {
      pattern,
      bpm,
      duration: practiceDuration,
      timestamp: nowISO,
    };
    let updatedLogs = [...practiceLogs];
    if (resumedLogIndex !== null && resumedLogIndex >= 0) {
      updatedLogs.splice(resumedLogIndex, 1);
      setResumedLogIndex(null);
    }
    updatedLogs = [...updatedLogs, newLog];
    setPracticeLogs(updatedLogs);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
    setPracticeDuration(0); // 기록 후 시간 초기화
  };

  // 로컬스토리지에서 오늘 로그만 불러오기 (만료된 데이터는 폐기)
  React.useEffect(() => {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    if (raw) {
      try {
        const logs = JSON.parse(raw) as Array<
          PracticeLogEntry & { timestamp?: string }
        >;
        const validLogs = logs.filter(
          (log) =>
            !log.timestamp ||
            new Date().getTime() - new Date(log.timestamp).getTime() <
              LOG_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        );
        // 오늘 날짜(YYYY-MM-DD)
        const today = new Date().toISOString().slice(0, 10);
        const todayLogs = validLogs.filter(
          (log: any) => log.timestamp && log.timestamp.slice(0, 10) === today
        );
        setPracticeLogs(todayLogs);
        // 만료된 데이터는 즉시 폐기
        if (validLogs.length !== logs.length) {
          localStorage.setItem(
            LOG_STORAGE_KEY,
            JSON.stringify(
              validLogs.map((l) => ({
                ...l,
                timestamp: new Date().toISOString(),
              }))
            )
          );
        }
      } catch {}
    }
  }, []);

  // 오늘 로그 삭제 핸들러
  const handleDeleteLog = (index: number) => {
    // 오늘 로그만 대상으로 삭제
    const today = new Date().toISOString().slice(0, 10);
    let todayCount = 0;
    const updatedLogs = practiceLogs.filter((log: any) => {
      if (log.timestamp && log.timestamp.slice(0, 10) === today) {
        if (todayCount === index) {
          todayCount++;
          return false; // 삭제 대상
        }
        todayCount++;
      }
      return true;
    });
    setPracticeLogs(updatedLogs);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
  };

  // 로그 복원 핸들러에서 복원된 로그의 인덱스를 기록
  const [resumedLogIndex, setResumedLogIndex] = useState<number | null>(null);
  const handleResumeLog = (log: PracticeLogEntry) => {
    const today = new Date().toISOString().slice(0, 10);
    const index = practiceLogs.findIndex(
      (l: any) => l.timestamp && l.timestamp.slice(0, 10) === today && l.pattern === log.pattern && l.bpm === log.bpm && l.duration === log.duration
    );
    setResumedLogIndex(index !== -1 ? index : null);
    setPattern(log.pattern);
    setMaxBpm(log.bpm);
    setPracticeDuration(log.duration ?? 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ChromaticPractice에 pattern, maxBpm, practiceDuration 상태 전달
  const [pattern, setPattern] = useState("");
  const [maxBpm, setMaxBpm] = useState(0);

  return (
    <>
      <Navbar />
      <div className={styles.metronomePracticeContainer}>
        <div className={styles.chromaticSection}>
          <div style={{ flex: 1 }} />
          <div className={styles.metronomeSection}></div>
        </div>

        {/* Metronome Section (Main) */}
        <section className={styles.metronomeSection}>
          <h1>Metronome</h1>
          <Metronome />
        </section>

        {/* Chromatic Practice & Practice Log Section (Side) */}
        <div className={styles.chromaticSection}>
          <section>
            <h2>Chromatic Practice</h2>
            <ChromaticPractice
              addLog={addLog}
              isTracking={isTracking}
              onTracking={handleTracking}
              practiceDuration={practiceDuration}
              pattern={pattern}
              setPattern={setPattern}
              maxBpm={maxBpm}
              setMaxBpm={setMaxBpm}
            />
          </section>

          <section>
            <PracticeLog
              logs={practiceLogs}
              onDeleteLog={handleDeleteLog}
              onResumeLog={handleResumeLog}
            />
          </section>
        </div>
      </div>
      <Nav_Met />
    </>
  );
};

export default MetronomePractice;
