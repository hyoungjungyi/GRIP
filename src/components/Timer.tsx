import React, { useRef, useState } from "react";
import { useTimer } from "../context/TimerContext";

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

  React.useEffect(() => {
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
      }}
      onMouseDown={handleMouseDown}
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
            <span style={{ fontSize: 18 }}>&#x25B6;</span> // ▶ (expand)
          ) : (
            <span style={{ fontSize: 18 }}>&#x25BC;</span> // ▼ (collapse)
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
