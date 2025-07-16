import React, { useState, useRef, useEffect } from "react";
import Metronome from "./Metronome/Metronome";
import ChromaticPractice from "./ChromaticPractice/ChromaticPractice";
import PracticeLog from "./PracticeLog/PracticeLog";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./MetronomePractice.module.css";
import Nav_Met from "../../components/Nav_Met/Nav_Met";
import { useTimer } from "../../context/TimerContext";
import {
  saveChromaticPracticeToServer,
  deleteChromaticPracticeFromServer,
  getLastChromaticPreset,
} from "./metronomePracticeApi";

interface PracticeLogEntry {
  pattern: string;
  bpm: number;
  duration?: number; // 연습 시간(초)
  timestamp?: string;
  id?: number; // 서버에서 받은 ID (삭제 시 필요)
}

const LOG_STORAGE_KEY = "chromaticPracticeLogs";
const LOG_EXPIRY_DAYS = 7;

const MetronomePractice: React.FC = () => {
  const [practiceLogs, setPracticeLogs] = useState<PracticeLogEntry[]>([]);
  const [practiceDuration, setPracticeDuration] = useState(0); // 누적 시간(초)
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = React.useRef<number | null>(null);
  const { elapsedSeconds, setElapsedSeconds } = useTimer();

  // 진입/이탈 시점의 총 연습 시간 기록
  const entryTotalPracticeTimeRef = useRef<number>(0);

  // 로그들의 총 연습 시간 계산 함수
  const calculateTotalPracticeTime = (logs: PracticeLogEntry[]) => {
    const today = new Date().toISOString().slice(0, 10);
    return logs
      .filter(
        (log: any) => log.timestamp && log.timestamp.slice(0, 10) === today
      )
      .reduce((total, log) => total + (log.duration || 0), 0);
  }; // 로컬스토리지에서 오늘 로그만 불러오기 (만료된 데이터는 폐기)
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
        // 페이지 진입 시점의 총 연습 시간 저장 (로그가 로드된 후)
        entryTotalPracticeTimeRef.current =
          calculateTotalPracticeTime(todayLogs);

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

  // 마지막 프리셋을 가져와서 로그에 추가하는 함수
  const loadLastPreset = async () => {
    try {
      const presetData = await getLastChromaticPreset();
      if (presetData && presetData.preset && presetData.bpm) {
        // 같은 pattern이 이미 있는지 확인
        const existingLog = practiceLogs.find(
          (log) => log.pattern === presetData.preset
        );

        if (existingLog) {
          console.log(
            "ℹ️ Preset pattern already exists in logs:",
            presetData.preset
          );
          return; // 이미 존재하면 추가하지 않음
        }

        // 프리셋을 0초 로그로 추가
        const presetLog: PracticeLogEntry = {
          pattern: presetData.preset,
          bpm: presetData.bpm,
          duration: 0,
          timestamp: new Date().toISOString(),
        };

        const updatedLogs = [...practiceLogs, presetLog];
        setPracticeLogs(updatedLogs);
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));

        console.log("✅ Last preset loaded:", presetData);
      } else {
        console.log("ℹ️ No preset data available");
      }
    } catch (error) {
      console.error("❌ Failed to load last preset:", error);
    }
  };

  // 서버로 오늘의 연습 기록 전송 함수
  const sendTodayPracticeToServer = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = practiceLogs.filter(
      (log) => log.timestamp && log.timestamp.slice(0, 10) === today
    );

    if (todayLogs.length === 0) {
      return; // 오늘 연습 기록이 없으면 전송하지 않음
    }

    const totalPracticeTime = calculateTotalPracticeTime(todayLogs);

    // API 요청 형식에 맞게 데이터 변환
    const practiceData = {
      date: today,
      totalPracticeTime,
      details: todayLogs.map((log) => ({
        fingering: log.pattern,
        bpm: log.bpm,
        practiceTime: log.duration || 0,
      })),
    };

    try {
      await saveChromaticPracticeToServer(practiceData);
      console.log("✅ Successfully saved practice data to server");
    } catch (error) {
      console.error("❌ Failed to save practice data to server:", error);
      // TODO: 사용자에게 에러 알림 표시
    }
  };

  // 페이지 이탈 시점에 글로벌 타이머에 연습 시간 증가분 더하기 + 서버로 데이터 전송
  useEffect(() => {
    return () => {
      const exitTotalPracticeTime = calculateTotalPracticeTime(practiceLogs);
      const delta = exitTotalPracticeTime - entryTotalPracticeTimeRef.current;
      if (delta > 0) {
        setElapsedSeconds((prev) => prev + delta);
      }

      // 서버로 오늘의 연습 기록 전송
      sendTodayPracticeToServer();
    };
  }, [practiceLogs, setElapsedSeconds]);

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

  // 로그 추가 시 로컬스토리지에 저장 (서버 저장은 페이지 이탈 시 배치 처리)
  const addLog = (pattern: string, bpm: number) => {
    const nowISO = new Date().toISOString();
    const newLog: PracticeLogEntry = {
      pattern,
      bpm,
      duration: practiceDuration,
      timestamp: nowISO,
      // 개별 연습 기록 저장 API가 필요하다면 여기서 서버에 저장 후 ID 받아오기
      // id: undefined, // 서버에서 받아올 ID
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

  // 오늘 로그 삭제 핸들러 (로컬 + 서버)
  const handleDeleteLog = async (index: number) => {
    const today = new Date().toISOString().slice(0, 10);

    // 1. 오늘 로그만 필터링
    const todayLogs = practiceLogs.filter(
      (log) => log.timestamp && log.timestamp.slice(0, 10) === today
    );

    // 2. 삭제 대상 로그 찾기 (오늘 로그 중에서 index번째)
    const targetLog = todayLogs[index];

    if (!targetLog) {
      console.error("삭제할 로그를 찾을 수 없습니다.");
      return;
    }

    console.log("🗑️ 삭제 대상 로그:", targetLog);

    // 3. 서버에서 삭제 (무조건 시도)
    try {
      // 서버에 삭제 요청 (practiceId는 임시로 index 사용)
      await deleteChromaticPracticeFromServer(index);
      console.log("✅ Successfully deleted practice record from server");
    } catch (error) {
      console.error("❌ Failed to delete practice record from server:", error);
      // 서버 삭제 실패해도 로컬 삭제는 진행
    }

    // 4. 로컬에서 삭제 (전체 로그에서 해당 로그 제거)
    const updatedLogs = practiceLogs.filter((log) => log !== targetLog);
    setPracticeLogs(updatedLogs);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
  };

  // 로그 복원 핸들러에서 복원된 로그의 인덱스를 기록
  const [resumedLogIndex, setResumedLogIndex] = useState<number | null>(null);
  const handleResumeLog = (log: PracticeLogEntry) => {
    const today = new Date().toISOString().slice(0, 10);
    const index = practiceLogs.findIndex(
      (l: any) =>
        l.timestamp &&
        l.timestamp.slice(0, 10) === today &&
        l.pattern === log.pattern &&
        l.bpm === log.bpm &&
        l.duration === log.duration
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
        <div className={styles.contentWrapper}>
          <section className={styles.metronomeSection}>
            <div className={styles.metronomeWrapper}>
              <div className={styles.topBar} />
              <h1>Metronome</h1>
              <Metronome />
            </div>
          </section>


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
                onLoadLastPreset={loadLastPreset}
              />
            </section>
          </div>
        </div>
      </div>
      <Nav_Met />
    </>
  );
};

export default MetronomePractice;
