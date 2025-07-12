import React, { useState } from "react";
import styles from "./Calendar.module.css";

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const mockPracticeData: Record<string, { time: string; activity: string }[]> = {
  "20250712": [
    { time: "10:00", activity: "크로메틱 연습 20분" },
    { time: "15:00", activity: "곡 연습 30분" },
  ],
  "20250713": [{ time: "11:00", activity: "스케일 연습 15분" }],
};

const Calendar: React.FC = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [popupDay, setPopupDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay(); // 0: Sunday

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

  const handleDayClick = (day: number) => {
    if (day > 0) setPopupDay(day);
  };

  const closePopup = () => setPopupDay(null);

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

  // 목업 데이터 키 생성
  const getPracticeKey = (d: number) =>
    `${year}${(month + 1).toString().padStart(2, "0")}${d
      .toString()
      .padStart(2, "0")}`;

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button className={styles.arrow} onClick={handlePrevMonth}>
          &lt;
        </button>
        <span className={styles.monthLabel}>
          {year}년 {month + 1}월
        </span>
        <button className={styles.arrow} onClick={handleNextMonth}>
          &gt;
        </button>
      </div>
      <table className={styles.calendarTable}>
        <thead>
          <tr>
            <th>일</th>
            <th>월</th>
            <th>화</th>
            <th>수</th>
            <th>목</th>
            <th>금</th>
            <th>토</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => (
                <td
                  key={j}
                  className={d ? styles.day : styles.empty}
                  onClick={() => handleDayClick(d)}
                  style={{ cursor: d ? "pointer" : "default" }}
                >
                  {d ? d : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {popupDay && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <div className={styles.popupHeader}>
              <span>
                {year}년 {month + 1}월 {popupDay}일 연습 데이터
              </span>
              <button className={styles.popupClose} onClick={closePopup}>
                X
              </button>
            </div>
            <ul>
              {(
                mockPracticeData[getPracticeKey(popupDay)] || [
                  { time: "", activity: "연습 데이터 없음" },
                ]
              ).map((item: { time: string; activity: string }, idx: number) => (
                <li key={idx}>
                  {item.time && <strong>{item.time} </strong>}
                  {item.activity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
