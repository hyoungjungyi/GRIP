import React, { useRef, useState, useEffect } from "react";
import { useTimer } from "../context/TimerContext";
import { useLocation } from "react-router-dom";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Timer: React.FC = () => {
  const {
    goalMinutes,
    elapsedSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useTimer();

  const location = useLocation();

  // 경로 기반으로 타이머를 시각적으로 숨길지 결정
  const isHidden =
    location.pathname.startsWith("/mypage") ||
    location.pathname.startsWith("/metronome-practice");

  // 경로가 특정 페이지일 때 자동으로 타이머를 일시정지
  useEffect(() => {
    if (isHidden && isRunning) {
      pauseTimer();
    }
    // eslint-disable-next-line
  }, [isHidden]);

  // Drag state
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Minimize state
  const [minimized, setMinimized] = useState(false);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // 시각적으로만 숨김 처리
  return (
    <div
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 9999,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        padding: minimized ? "8px 16px" : "16px 24px",
        minWidth: 120,
        fontFamily: "inherit",
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: "padding 0.2s",
        display: isHidden ? "none" : "block",
      }}
      onMouseDown={handleMouseDown}
      aria-hidden={isHidden}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 600,
          marginBottom: minimized ? 0 : 8,
        }}
      >
        Practice Timer
        <button
          style={{
            marginLeft: "auto",
            fontSize: 16,
            padding: "2px 8px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#f7f7f7",
            cursor: "pointer",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
          }}
          title={minimized ? "Expand" : "Collapse"}
          onClick={(e) => {
            e.stopPropagation();
            setMinimized((m) => !m);
          }}
        >
          {minimized ? (
            <span style={{ fontSize: 18 }}>&#x25B6;</span>
          ) : (
            <span style={{ fontSize: 18 }}>&#x25BC;</span>
          )}
        </button>
      </div>
      {!minimized && (
        <>
          <div>
            Goal: <b>{goalMinutes} min</b>
          </div>
          <div>
            Elapsed: <b>{formatTime(elapsedSeconds)}</b>
          </div>
          <div style={{ marginTop: 8 }}>
            {isRunning ? (
              <button onClick={pauseTimer}>Pause</button>
            ) : (
              <button onClick={startTimer}>Start</button>
            )}
            <button onClick={resetTimer} style={{ marginLeft: 8 }}>
              Reset
            </button>
          </div>
          {elapsedSeconds >= goalMinutes * 60 && (
            <div style={{ color: "green", marginTop: 8 }}>
              Goal reached! Timer reset.
            </div>
          )}
          {isRunning && (
            <div style={{ color: "orange", fontSize: 12, marginTop: 4 }}>
              Timer is running. Navigating away will pause your session.
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Timer;
