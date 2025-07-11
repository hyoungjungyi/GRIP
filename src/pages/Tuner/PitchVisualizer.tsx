import React, { useEffect, useState, useRef } from "react";
import { usePitch } from "./usePitch";
import { getNoteFromFrequency } from "./utils";
import "./PitchVisualizer.css";

const PitchVisualizer: React.FC = () => {
  const pitch = usePitch();
  const [history, setHistory] = useState<number[]>([]);
  const [lastNote, setLastNote] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (pitch) {
      const noteInfo = getNoteFromFrequency(pitch);
      if (noteInfo) {
        setLastNote(`${noteInfo.note}${noteInfo.octave}`);
      }
      setHistory((prev) => [...prev, pitch].slice(-100)); // Keep last 100 points
    } else {
      const timer = setTimeout(() => setLastNote(null), 1000); // Hide after 1s
      return () => clearTimeout(timer);
    }
  }, [pitch]);

  const getPath = () => {
    if (!svgRef.current) return "";
    const { width, height } = svgRef.current.getBoundingClientRect();
    const minFreq = 80; // E2
    const maxFreq = 330; // E4

    return history
      .map((p, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((p - minFreq) / (maxFreq - minFreq)) * height;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="pitch-visualizer">
      <div className="tuner-display">
        <div className="grid-background"></div>
        <div className="target-note">{lastNote || "--"}</div>
        <svg ref={svgRef} className="pitch-graph" width="100%" height="100%">
          <polyline
            fill="none"
            stroke="red"
            strokeWidth="2"
            points={getPath()}
          />
        </svg>
      </div>
      <div className="pitch-info">
        <span>{pitch ? `${pitch.toFixed(1)} Hz` : "Listening..."}</span>
      </div>
    </div>
  );
};

export default PitchVisualizer;
