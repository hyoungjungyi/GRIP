import React, { useState, useEffect } from "react";
import styles from "./Calendar.module.css";
import { getAuthHeadersForGet, getApiBaseUrl } from "../../../utils/apiUtils";
import { getMonthlyAchievementStatus, type AchievementStatus } from "./calendarApi";

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

interface PracticeData {
  date: string;
  total_time: number;
  achieved: boolean;
  recording_url?: string;
  chromatic?: Array<{
    fingering: string;
    bpm: number;
    duration: number;
  }>;
}

const Calendar: React.FC = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [popupDay, setPopupDay] = useState<number | null>(null);
  const [popupData, setPopupData] = useState<PracticeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthlyStatus, setMonthlyStatus] = useState<AchievementStatus[]>([]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay(); // 0: Sunday

  // 월별 달성 상태 불러오기
  useEffect(() => {
    const fetchMonthlyStatus = async () => {
      try {
        const statusData = await getMonthlyAchievementStatus(year, month);
        setMonthlyStatus(statusData.daily_status || []);
      } catch (error) {
        console.error("Failed to fetch monthly status:", error);
        setMonthlyStatus([]);
      }
    };

    fetchMonthlyStatus();
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };
  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = async (day: number) => {
    if (day > 0) {
      setPopupDay(day);
      setLoading(true);
      setError(null);
      setPopupData(null);
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const baseUrl = getApiBaseUrl();
      try {
        const res = await fetch(
          `${baseUrl}/api/practice/history?date=${dateStr}`,
          {
            method: "GET",
            headers: getAuthHeadersForGet(),
          }
        );
        if (!res.ok) throw new Error("Unable to fetch data.");
        const data: PracticeData = await res.json();
        setPopupData(data);
      } catch (e: any) {
        setError(e.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  const closePopup = () => {
    setPopupDay(null);
    setPopupData(null);
    setError(null);
    setLoading(false);
  };

  const weeks: number[][] = [];
  let day = 1 - firstDay;
  while (day <= daysInMonth) {
    const week: number[] = [];
    for (let i = 0; i < 7; i++) {
      if (day > 0 && day <= daysInMonth) {
        week.push(day);
      } else {
        week.push(0);
      }
      day++;
    }
    weeks.push(week);
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button className={styles.arrow} onClick={handlePrevMonth}>
          &lt;
        </button>
        <span className={styles.monthLabel}>
          {year}-{(month + 1).toString().padStart(2, "0")}
        </span>
        <button className={styles.arrow} onClick={handleNextMonth}>
          &gt;
        </button>
      </div>
      <table className={styles.calendarTable}>
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => {
                const dayStatus = d > 0 ? monthlyStatus[d - 1] : null;
                return (
                  <td
                    key={j}
                    className={d ? styles.day : styles.empty}
                    onClick={() => handleDayClick(d)}
                    style={{ cursor: d ? "pointer" : "default" }}
                  >
                    {d ? (
                      <div className={styles.dayContent}>
                        <span className={styles.dayNumber}>{d}</span>
                        {dayStatus && (
                          <div className={styles.stamp}>
                            {dayStatus === 'success' ? (
                              <div className={styles.successStamp}>✓</div>
                            ) : dayStatus === 'failure' ? (
                              <div className={styles.failureStamp}>✗</div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {popupDay && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <div className={styles.popupHeader}>
              <span>
                Practice Data for {year}-
                {(month + 1).toString().padStart(2, "0")}-
                {popupDay?.toString().padStart(2, "0")}
              </span>
              <button className={styles.popupClose} onClick={closePopup}>
                X
              </button>
            </div>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div style={{ color: "#f55" }}>{error}</div>
            ) : popupData ? (
              <ul>
                <li>
                  <strong>Total Practice Time:</strong> {popupData.total_time}{" "}
                  min
                </li>
                <li>
                  <strong>Goal:</strong>{" "}
                  {popupData.achieved ? "Achieved" : "Not achieved"}
                </li>
                {popupData.recording_url && (
                  <li>
                    <strong>Recording:</strong>{" "}
                    <a
                      href={popupData.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Listen
                    </a>
                  </li>
                )}
                {popupData.chromatic && popupData.chromatic.length > 0 && (
                  <li>
                    <strong>Chromatic Practice:</strong>
                    <ul>
                      {popupData.chromatic.map((c, idx) => (
                        <li key={idx}>
                          Pattern: {c.fingering}, BPM: {c.bpm}, Time:{" "}
                          {c.duration} min
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            ) : (
              <div>No practice data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
