import React, { useState, useRef, useEffect } from "react";
import styles from "./Timer.module.css";

const Timer: React.FC = () => {
  // 초기값을 localStorage에서 불러옴
  const getInitialTargetSeconds = () => {
    const stored = localStorage.getItem("practiceGoalMinutes");
    return stored ? Number(stored) * 60 : 60;
  };
  const getInitialElapsedSeconds = () => {
    const stored = localStorage.getItem("practiceElapsedSeconds");
    return stored ? Number(stored) : 0;
  };

  const [targetSeconds, setTargetSeconds] = useState(getInitialTargetSeconds()); // 목표 시간(초)
  const [elapsedSeconds, setElapsedSeconds] = useState(
    getInitialElapsedSeconds()
  ); // 연습한 총 시간(초)
  const [isRunning, setIsRunning] = useState(false);
  const [setting, setSetting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // localStorage에 값 저장
  useEffect(() => {
    localStorage.setItem(
      "practiceGoalMinutes",
      String(Math.floor(targetSeconds / 60))
    );
  }, [targetSeconds]);
  useEffect(() => {
    localStorage.setItem("practiceElapsedSeconds", String(elapsedSeconds));
  }, [elapsedSeconds]);

  // 남은 시간 계산
  const seconds = Math.max(targetSeconds - elapsedSeconds, 0);

  // // 타이머 시작/정지/리셋 함수
  // const startTimer = () => {
  //   if (!isRunning && seconds > 0) {
  //     setIsRunning(true);
  //     intervalRef.current = setInterval(() => {
  //       setElapsedSeconds((prev) => {
  //         if (targetSeconds - (prev + 1) <= 0) {
  //           clearInterval(intervalRef.current!);
  //           setIsRunning(false);
  //           alert("Timer finished!");
  //           return targetSeconds; // 목표 시간만큼 채움
  //         }
  //         return prev + 1;
  //       });
  //     }, 1000);
  //   }
  // };

  // const stopTimer = () => {
  //   setIsRunning(false);
  //   if (intervalRef.current) clearInterval(intervalRef.current);
  // };

  // const resetTimer = () => {
  //   setElapsedSeconds(0);
  //   setIsRunning(false);
  //   if (intervalRef.current) clearInterval(intervalRef.current);
  // };

  // 시간 설정 팝업
  const handleTimeClick = () => {
    if (!isRunning) setSetting(true);
  };
  const handleSetTime = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number((e.target as any).hours.value);
    const m = Number((e.target as any).minutes.value);
    const total = h * 3600 + m * 60;
    setTargetSeconds(total > 0 ? total : 1);
    // setElapsedSeconds(0); // 연습 시간 초기화 제거
    setSetting(false);
  };

  // 시간 포맷팅 함수 (유동적)
  const formatTime = (timeInSeconds: number, isGoal = false) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    // 목표시간이 1시간 이상이면 시간/분으로 표시
    if (isGoal ? targetSeconds >= 3600 : targetSeconds >= 3600) {
      return `${hours}h ${minutes}m`;
    }
    // 목표시간이 1시간 미만이면 분/초로 표시
    else {
      return `${minutes}m ${seconds}s`;
    }
  };

  // 크기 관련 변수
  const size = 200; // 원하는 크기로 변경
  const center = size / 2;
  const radius = size / 2 - 10;
  const handLength = radius * 0.85;

  // 아날로그 타이머 스타일
  const angle = (elapsedSeconds / targetSeconds) * 360;
  const handX = center + handLength * Math.sin((Math.PI / 180) * angle);
  const handY = center - handLength * Math.cos((Math.PI / 180) * angle);

  // 진행률 색상 (Pomodoro 스타일, 중심부터 채우기)
  const progress = elapsedSeconds / targetSeconds;
  const progressEndAngle = -Math.PI / 2 + progress * 2 * Math.PI;

  // sector path (중심부터 가장자리까지)
  const describeSector = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const startX = cx + r * Math.cos(startAngle);
    const startY = cy + r * Math.sin(startAngle);
    const endX = cx + r * Math.cos(endAngle);
    const endY = cy + r * Math.sin(endAngle);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    return [
      `M ${cx} ${cy}`,
      `L ${startX} ${startY}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`,
    ].join(" ");
  };

  return (
    <div className={styles.timerContainer}>
      {/* 목표 시간 표시 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 600,
          color: "#666",
        }}
      >
        Goal: {formatTime(targetSeconds, true)}
      </div>
      <svg width={size} height={size}>
        {/* 바깥 원 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#333"
          strokeWidth={size * 0.03}
          fill="#f9f9f9"
        />
        {/* 진행률 섹터 (흘러간 시간, 중심부터 가장자리까지) */}
        {progress > 0 && (
          <path
            d={describeSector(
              center,
              center,
              radius - size * 0.015,
              -Math.PI / 2,
              progressEndAngle
            )}
            fill="#1976d2"
            opacity={0.25}
            style={{ transition: "d 0.2s" }}
          />
        )}
        {/* 눈금 */}
        {[...Array(60)].map((_, i) => {
          const tickAngle = i * 6;
          const inner = radius * 1.0 - size * 0.05;
          const outer = i % 5 === 0 ? radius * 1.13 : radius * 1.07;
          const x1 = center + inner * Math.sin((Math.PI / 180) * tickAngle);
          const y1 = center - inner * Math.cos((Math.PI / 180) * tickAngle);
          const x2 = center + outer * Math.sin((Math.PI / 180) * tickAngle);
          const y2 = center - outer * Math.cos((Math.PI / 180) * tickAngle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#888"
              strokeWidth={i % 5 === 0 ? size * 0.01 : size * 0.005}
            />
          );
        })}
        {/* 시계 바늘 */}
        <line
          x1={center}
          y1={center}
          x2={handX}
          y2={handY}
          stroke="#1976d2"
          strokeWidth={size * 0.02}
          strokeLinecap="round"
        />
        {/* 중심 원 */}
        <circle cx={center} cy={center} r={size * 0.035} fill="#1976d2" />
        {/* 분/초 텍스트 (클릭 시 시간 설정) */}
        <foreignObject x={center - 40} y={size - 60} width={80} height={30}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 18,
              textAlign: "center",
            }}
          >
            {formatTime(seconds)}
          </div>
        </foreignObject>
      </svg>
      {/* <div className={styles.buttonRow}>
        <button
          className={styles.timerBtn}
          onClick={startTimer}
          disabled={isRunning || seconds === 0}
        >
          Start
        </button>
        <button
          className={styles.timerBtn}
          onClick={stopTimer}
          disabled={!isRunning}
        >
          Stop
        </button>
        <button className={styles.timerBtn} onClick={resetTimer}>
          Reset
        </button>
      </div> */}
      {setting && (
        <div className={styles.settingOverlay}>
          <div className={styles.settingBox}>
            <form onSubmit={handleSetTime}>
              <div style={{ marginBottom: 12, fontWeight: 600 }}>
                Set Target Time
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  type="number"
                  name="hours"
                  min={0}
                  max={23}
                  defaultValue={Math.floor(targetSeconds / 3600)}
                  style={{ width: 50 }}
                />
                <span>h</span>
                <input
                  type="number"
                  name="minutes"
                  min={0}
                  max={59}
                  defaultValue={Math.floor((targetSeconds % 3600) / 60)}
                  style={{ width: 50 }}
                />
                <span>m</span>
              </div>
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 12,
                }}
              >
                <button type="submit" className={styles.timerBtn}>
                  Set
                </button>
                <button
                  type="button"
                  className={styles.timerBtn}
                  onClick={() => setSetting(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
