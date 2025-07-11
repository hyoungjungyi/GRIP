import React, { useState, useEffect, useRef } from "react";
import styles from "./Metronome.module.css";

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/metronome-sound.mp3"); // You'll need to provide a sound file
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        audioRef.current?.play();
        setBeatCount((prev) => prev + 1);
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
          type="number"
          inputMode="numeric"
          id="bpm"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          min="1"
        />
      </div>
      <button onClick={handleStartStop}>{isPlaying ? "Stop" : "Start"}</button>
      <div
        className={`${styles.indicator} ${
          isPlaying && beatCount % 2 === 0 ? styles.active : ""
        }`}
      ></div>
    </div>
  );
};

export default Metronome;
