import React, { useEffect, useRef } from "react";
import { usePitch } from "./usePitch";
import { getGuitarStringInfo } from "./utils";
import "./PitchVisualizer.css";

interface PitchVisualizerProps {
  isActive?: boolean;
  setActiveString: React.Dispatch<React.SetStateAction<string | null>>;
}

const PitchVisualizer: React.FC<PitchVisualizerProps> = ({
  isActive = true,
  setActiveString,
}) => {
  const { pitch, error, inputLevel } = usePitch();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 디버깅: pitch 상태 모니터링
  useEffect(() => {
    console.log("[📊 PitchVisualizer State]", {
      pitch: pitch ? pitch.toFixed(2) : null,
      inputLevel: inputLevel.toFixed(3),
      error: error || "none"
    });
  }, [pitch, inputLevel, error]);

  // 감지된 음정에 따라 활성 기타 줄 설정
  useEffect(() => {
    if (pitch) {
      const guitarInfo = getGuitarStringInfo(pitch);
      setActiveString(guitarInfo ? guitarInfo.stringName : null);
      
      // 디버깅 로그
      console.log("[🎸 Guitar String Detection]", {
        pitch: pitch.toFixed(2),
        guitarInfo: guitarInfo ? {
          stringName: guitarInfo.stringName,
          cents: guitarInfo.cents,
          targetFreq: guitarInfo.targetFrequency.toFixed(2)
        } : null
      });
    } else {
      setActiveString(null);
    }
  }, [pitch, setActiveString]);

  // 그래프 그리기 (기타 줄 기준)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 배경 클리어
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (pitch) {
      const guitarInfo = getGuitarStringInfo(pitch);
      
      if (guitarInfo) {
        const cents = guitarInfo.cents;

        // 중앙선 그리기
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rect.width / 2, 10);
        ctx.lineTo(rect.width / 2, rect.height - 10);
        ctx.stroke();

        // 피치 인디케이터 그리기
        const maxCents = 50; // ±50센트 범위
        const position = (cents / maxCents) * (rect.width / 2) + rect.width / 2;
        const clampedPosition = Math.max(15, Math.min(rect.width - 15, position));

        // 튜닝 상태에 따른 색상
        let color = "#666";
        if (Math.abs(cents) < 5) color = "#4caf50"; // 정확
        else if (Math.abs(cents) < 15) color = "#ff9800"; // 거의 정확
        else color = "#f44336"; // 조정 필요

        // 피치 바 그리기
        ctx.fillStyle = color;
        ctx.fillRect(clampedPosition - 3, rect.height / 2 - 15, 6, 30);

        // 범위 표시 (±50센트)
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 1;
        for (let i = -50; i <= 50; i += 10) {
          const x = (i / maxCents) * (rect.width / 2) + rect.width / 2;
          if (x >= 0 && x <= rect.width) {
            ctx.beginPath();
            ctx.moveTo(x, rect.height - 5);
            ctx.lineTo(x, rect.height - (i % 50 === 0 ? 15 : 10));
            ctx.stroke();
          }
        }
      }
    }
  }, [pitch]);

  // 현재 기타 줄 정보
  const guitarInfo = pitch ? getGuitarStringInfo(pitch) : null;

  // 연결 상태
  const getConnectionStatus = () => {
    if (error) return { text: "마이크 오류", className: "disconnected" };
    if (!isActive) return { text: "비활성", className: "disconnected" };
    return { text: "연결됨", className: "connected" };
  };

  const connectionStatus = getConnectionStatus();

  // 입력 레벨 색상
  const getInputLevelColor = () => {
    if (inputLevel < 0.1) return "#ccc";
    if (inputLevel < 0.5) return "#4caf50";
    if (inputLevel < 0.8) return "#ff9800";
    return "#f44336";
  };

  // 상태 메시지
  const getStatusMessage = () => {
    if (error) return "마이크 연결을 확인해주세요";
    if (!isActive) return "튜너 비활성";
    if (inputLevel < 0.05) return "소리를 더 크게 내주세요";
    if (!pitch || !guitarInfo) return "기타 줄 음정을 연주해주세요";
    
    const cents = Math.abs(guitarInfo.cents);
    if (cents < 5) return "완벽합니다! 🎯";
    if (cents < 15) return "거의 정확해요 👍";
    if (guitarInfo.cents > 0) return "조금 더 낮게 🔽";
    return "조금 더 높게 🔼";
  };

  return (
    <div className="pitch-visualizer">
      {/* 연결 상태 */}
      <div className={`connection-status ${connectionStatus.className}`}>
        {connectionStatus.text}
      </div>

      {/* 메인 튜너 디스플레이 */}
      <div className="tuner-display">
        <div className="grid-background"></div>

        {/* 중앙 기타 줄 표시 */}
        <div className="main-note-display">
          {guitarInfo && pitch ? (
            <>
              <h1 className="note-text">{guitarInfo.stringName}</h1>
              <p className="frequency-text">
                {pitch.toFixed(1)} Hz (목표: {guitarInfo.targetFrequency.toFixed(1)} Hz)
              </p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                센트: {guitarInfo.cents > 0 ? '+' : ''}{guitarInfo.cents}
              </p>
            </>
          ) : (
            <>
              <h1 className="note-text">--</h1>
              <p className="frequency-text">기타 줄을 연주해주세요</p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                피치: {pitch ? `${pitch.toFixed(1)} Hz` : '없음'} | 입력: {(inputLevel * 100).toFixed(0)}%
              </p>
            </>
          )}
        </div>

        {/* 입력 레벨 섹션 */}
        <div className="input-section">
          <div className="input-label">입력 레벨</div>
          <div className="input-level-bar">
            <div 
              className="input-level-fill"
              style={{ 
                width: `${inputLevel * 100}%`,
                backgroundColor: getInputLevelColor(),
                opacity: inputLevel > 0 ? 1 : 0.3
              }}
            />
          </div>
          <div className="input-hint" style={{ opacity: inputLevel > 0.05 ? 0 : 1 }}>
            기타를 연주해보세요
          </div>
        </div>

        {/* 피치 그래프 (기타 줄 기준) */}
        <canvas 
          ref={canvasRef}
          className="pitch-graph"
          style={{ opacity: guitarInfo ? 1 : 0.3 }}
        />

        {/* 상태 메시지 */}
        <div className="status-message">
          {getStatusMessage()}
        </div>
      </div>
    </div>
  );
};

export default PitchVisualizer;
