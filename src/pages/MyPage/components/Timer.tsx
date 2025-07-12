import React, { useState, useRef } from "react";
import styles from "./Timer.module.css";

const Timer: React.FC = () => {
  const [targetSeconds, setTargetSeconds] = useState(60); // 기본 1분
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [setting, setSetting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (!isRunning && seconds > 0) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            alert("타이머 종료!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setSeconds(targetSeconds);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // 시간 설정 팝업
  const handleTimeClick = () => {
    if (!isRunning) setSetting(true);
  };
  const handleSetTime = (e: React.FormEvent) => {
    e.preventDefault();
    const min = Number((e.target as any).minutes.value);
    const sec = Number((e.target as any).seconds.value);
    const total = min * 60 + sec;
    setTargetSeconds(total > 0 ? total : 1);
    setSeconds(total > 0 ? total : 1);
    setSetting(false);
  };

  // 아날로그 타이머 스타일
  const radius = 60;
  const angle = ((targetSeconds - seconds) / targetSeconds) * 360;
  const handLength = 50;
  const handX = 70 + handLength * Math.sin((Math.PI / 180) * angle);
  const handY = 70 - handLength * Math.cos((Math.PI / 180) * angle);

  return (
    <div className={styles.timerContainer}>
      <svg width={140} height={140}>
        {/* 바깥 원 */}
        <circle
          cx={70}
          cy={70}
          r={radius}
          stroke="#333"
          strokeWidth={6}
          fill="#f9f9f9"
        />
        {/* 눈금 */}
        {[...Array(60)].map((_, i) => {
          const tickAngle = i * 6;
          const inner = 60;
          const outer = i % 5 === 0 ? 68 : 64;
          const x1 = 70 + inner * Math.sin((Math.PI / 180) * tickAngle);
          const y1 = 70 - inner * Math.cos((Math.PI / 180) * tickAngle);
          const x2 = 70 + outer * Math.sin((Math.PI / 180) * tickAngle);
          const y2 = 70 - outer * Math.cos((Math.PI / 180) * tickAngle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#888"
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}
        {/* 시계 바늘 */}
        <line
          x1={70}
          y1={70}
          x2={handX}
          y2={handY}
          stroke="#1976d2"
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* 중심 원 */}
        <circle cx={70} cy={70} r={7} fill="#1976d2" />
        {/* 분/초 텍스트 (클릭 시 시간 설정) */}
        <text
          x="50%"
          y="90%"
          textAnchor="middle"
          fontSize="18"
          fill="#333"
          dominantBaseline="middle"
          style={{ cursor: isRunning ? "default" : "pointer" }}
          onClick={handleTimeClick}
        >
          {Math.floor(seconds / 60)}:
          {(seconds % 60).toString().padStart(2, "0")}
        </text>
      </svg>
      <div className={styles.buttonRow}>
        <button
          className={styles.timerBtn}
          onClick={startTimer}
          disabled={isRunning || seconds === 0}
        >
          시작
        </button>
        <button
          className={styles.timerBtn}
          onClick={stopTimer}
          disabled={!isRunning}
        >
          정지
        </button>
        <button className={styles.timerBtn} onClick={resetTimer}>
          초기화
        </button>
      </div>
      {setting && (
        <div className={styles.settingOverlay}>
          <form className={styles.settingBox} onSubmit={handleSetTime}>
            <div className={styles.settingHeader}>목표 시간 설정</div>
            <div className={styles.settingInputs}>
              <input
                name="minutes"
                type="number"
                min={0}
                max={99}
                defaultValue={Math.floor(targetSeconds / 60)}
              />{" "}
              분
              <input
                name="seconds"
                type="number"
                min={0}
                max={59}
                defaultValue={targetSeconds % 60}
              />{" "}
              초
            </div>
            <div className={styles.settingButtons}>
              <button type="submit" className={styles.timerBtn}>
                확인
              </button>
              <button
                type="button"
                className={styles.timerBtn}
                onClick={() => setSetting(false)}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Timer;
