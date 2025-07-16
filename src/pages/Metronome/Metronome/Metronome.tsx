import React, { useState, useEffect, useRef } from "react";
import styles from "./Metronome.module.css";

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/audios/metronome-85688.mp3"); // public 폴더 기준 경로
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setBeatCount((prev) => {
          // 사운드와 불빛이 동시에
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
          return prev + 1;
        });
      }, (60 / bpm) * 1000);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      setBeatCount(0);
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm]);

  const handleStartStop = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className={styles.metronomeContainer}>
      <div className={styles.bpmControl}>
        <label htmlFor="bpm">BPM:</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id="bpm"
          value={bpm}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) {
              setBpm(Number(val));
            }
          }}
        />
      </div>
      <button onClick={handleStartStop} className={styles.buttonTextBlack}>
          {isPlaying ? "Stop" : "Start"}
      </button>
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${styles.indicator} ${
              isPlaying && beatCount % 4 === i ? styles.active : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Metronome;
