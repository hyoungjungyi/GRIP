import React, { useEffect, useState, useRef } from "react";
import { usePitch } from "./usePitch";
import { getNoteFromFrequency, getClosestString } from "./utils";
import "./PitchVisualizer.css";

interface PitchVisualizerProps {
  setActiveString: (stringName: string | null) => void;
}

const PitchVisualizer: React.FC<PitchVisualizerProps> = ({
  setActiveString,
}) => {
  const pitch = usePitch();
  const [history, setHistory] = useState<number[]>([]);
  const [lastNote, setLastNote] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (pitch) {
      const noteInfo = getNoteFromFrequency(pitch);
      if (noteInfo) {
        const closestString = getClosestString(pitch);
        if (closestString) {
          setLastNote(closestString);
        }
        setActiveString(closestString);
      } else {
        setActiveString(null);
      }
      setHistory((prev) => [...prev, pitch].slice(-100));
    } else {
      const timer = setTimeout(() => {
        setLastNote(null);
        setActiveString(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pitch, setActiveString]);

  const getPath = () => {
    const width = 400;
    const height = 300;
    const minFreq = 80; // E2
    const maxFreq = 330; // E4
    const stepX = 4;

    return history
      .map((p, i) => {
        const x = width - (history.length - 1 - i) * stepX;
        const deviation =
          (p - (minFreq + maxFreq) / 2) / ((maxFreq - minFreq) / 2);
        const centerY = height / 2;
        const y = centerY - deviation * centerY * 0.5;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="pitch-visualizer">
      <div className="tuner-display">
        <div className="grid-background"></div>
        <div className="target-note">{lastNote || "--"}</div>
        <svg
          ref={svgRef}
          className="pitch-graph"
          width="400"
          height="300"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
        >
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
