import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

export interface TimerContextType {
  goalMinutes: number;
  elapsedSeconds: number;
  isRunning: boolean;
  setGoalMinutes: (minutes: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setElapsedSeconds: React.Dispatch<React.SetStateAction<number>>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [goalMinutes, setGoalMinutesState] = useState<number>(() => {
    const stored = localStorage.getItem("practiceGoalMinutes");
    return stored ? Number(stored) : 30;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const stored = localStorage.getItem("practiceElapsedSeconds");
    return stored ? Number(stored) : 0;
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persist goal and elapsed time
  useEffect(() => {
    localStorage.setItem("practiceGoalMinutes", String(goalMinutes));
  }, [goalMinutes]);
  useEffect(() => {
    localStorage.setItem("practiceElapsedSeconds", String(elapsedSeconds));
  }, [elapsedSeconds]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev + 1 >= goalMinutes * 60) {
            setIsRunning(false);
            return 0; // auto-reset
          }
          return prev + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, goalMinutes]);

  // Warn on tab close if timer running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning]);

  const setGoalMinutes = (minutes: number) => {
    setGoalMinutesState(minutes);
    setIsRunning(false);
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setElapsedSeconds(0);
    setIsRunning(false);
  };

  return (
    <TimerContext.Provider
      value={{
        goalMinutes,
        elapsedSeconds,
        isRunning,
        setGoalMinutes,
        startTimer,
        pauseTimer,
        resetTimer,
        setElapsedSeconds,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
