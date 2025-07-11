import React, { useState } from 'react';
import styles from './ChromaticPractice.module.css';

interface ChromaticPracticeProps {
  addLog: (pattern: string, bpm: number) => void;
}

const ChromaticPractice: React.FC<ChromaticPracticeProps> = ({ addLog }) => {
  const [pattern, setPattern] = useState('');
  const [maxBpm, setMaxBpm] = useState(0);

  const handleRecord = () => {
    if (pattern && maxBpm > 0) {
      addLog(pattern, maxBpm);
      setPattern('');
      setMaxBpm(0);
    }
  };

  return (
    <div className={styles.chromaticPracticeContainer}>
      <button>Start Chromatic Practice</button>
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
          type="number"
          id="maxBpm"
          value={maxBpm}
          onChange={(e) => setMaxBpm(Number(e.target.value))}
          min="1"
        />
      </div>
      <button onClick={handleRecord}>Record</button>
    </div>
  );
};

export default ChromaticPractice;
