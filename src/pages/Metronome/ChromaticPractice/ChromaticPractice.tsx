import React, { useState, useEffect } from "react";
import styles from "./ChromaticPractice.module.css";

interface ChromaticPracticeProps {
  addLog: (pattern: string, bpm: number) => void;
  isTracking: boolean;
  onTracking: () => void;
  practiceDuration: number;
  pattern: string;
  setPattern: React.Dispatch<React.SetStateAction<string>>;
  maxBpm: number;
  setMaxBpm: React.Dispatch<React.SetStateAction<number>>;
}

const ChromaticPractice: React.FC<ChromaticPracticeProps> = ({
  addLog,
  isTracking,
  onTracking,
  practiceDuration,
  pattern,
  setPattern,
  maxBpm,
  setMaxBpm,
}) => {
  const [wasPaused, setWasPaused] = useState(false);

  // Warn on tab close if Chromatic Practice tracking is running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTracking) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isTracking]);

  // 버튼 텍스트 결정
  let buttonText = "Start Chromatic Practice";
  if (isTracking) buttonText = "Pause";
  else if (wasPaused) buttonText = "Resume";

  const handleTracking = () => {
    setWasPaused(isTracking); // Pause 상태 기록
    onTracking();
  };

  const handleRecord = () => {
    if (pattern && maxBpm > 0) {
      addLog(pattern, maxBpm);
      setPattern("");
      setMaxBpm(0);
      setWasPaused(false); // 기록 후 버튼 텍스트 초기화
      if (isTracking) onTracking(); // 시간 추적 멈춤
    }
  };

  return (
    <div className={styles.chromaticPracticeContainer}>
      <button
        onClick={handleTracking}
        style={{ width: "100%", minWidth: "200px" }}
      >
        {buttonText}
      </button>
      <div>
        <div style={{ margin: "4px 0", fontSize: "14px", fontWeight: "bold" }}>
          Practice time: {practiceDuration} seconds
        </div>
        {/* Remove all warning text here */}
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="pattern">Pattern:</label>
        <input
          type="text"
          id="pattern"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="e.g., 1-2-3-4"
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="maxBpm">Max BPM:</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id="maxBpm"
          value={maxBpm === 0 ? "" : maxBpm}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setMaxBpm(0);
            } else if (/^\d+$/.test(val)) {
              setMaxBpm(Number(val));
            }
          }}
        />
      </div>
      <button
        onClick={handleRecord}
        style={{ width: "100%", minWidth: "200px" }}
      >
        Record
      </button>
    </div>
  );
};

export default ChromaticPractice;
