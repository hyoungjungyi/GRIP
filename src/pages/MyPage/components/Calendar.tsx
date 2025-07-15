import React, { useState, useEffect } from "react";
import styles from "./Calendar.module.css";
import { 
  getMonthlyAchievementStatus, 
  getPracticeHistoryByDate,
  type AchievementStatus,
  type PracticeData 
} from "./calendarApi";

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

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
        console.log(`📅 Calendar: Loading monthly status for ${year}-${month + 1}`);
        const statusData = await getMonthlyAchievementStatus(year, month);
        console.log(`✅ Calendar: Monthly status loaded:`, statusData);
        setMonthlyStatus(statusData.daily_status || []);
      } catch (error) {
        console.error("❌ Calendar: Failed to fetch monthly status:", error);
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
      
      try {
        console.log(`📅 Calendar: Loading practice data for ${dateStr}`);
        const data = await getPracticeHistoryByDate(dateStr);
        setPopupData(data);
        console.log(`✅ Calendar: Practice data loaded for ${dateStr}:`, data);
      } catch (e: any) {
        console.error(`❌ Calendar: Failed to load practice data for ${dateStr}:`, e);
        setError(e.message || "연습 데이터를 불러오는 중 오류가 발생했습니다.");
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
              <div className={styles.popupLoading}>
                <div className={styles.loadingSpinner}></div>
                <span>연습 데이터를 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className={styles.popupError}>
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorMessage}>{error}</div>
                <button 
                  className={styles.retryButton} 
                  onClick={() => handleDayClick(popupDay!)}
                >
                  다시 시도
                </button>
              </div>
            ) : popupData ? (
              <div className={styles.popupContent}>
                <div className={styles.practiceInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>총 연습 시간:</span>
                    <span className={styles.infoValue}>{popupData.total_time}분</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>목표 달성:</span>
                    <span className={`${styles.infoValue} ${popupData.achieved ? styles.achieved : styles.notAchieved}`}>
                      {popupData.achieved ? "✅ 달성" : "❌ 미달성"}
                    </span>
                  </div>
                  {popupData.recording_url && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>녹음 파일:</span>
                      <a
                        href={popupData.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.recordingLink}
                      >
                        🎵 녹음 듣기
                      </a>
                    </div>
                  )}
                  {popupData.chromatic && popupData.chromatic.length > 0 && (
                    <div className={styles.chromaticSection}>
                      <h4 className={styles.sectionTitle}>크로매틱 연습</h4>
                      {popupData.chromatic.map((item, index) => (
                        <div key={index} className={styles.chromaticItem}>
                          <span>핑거링: {item.fingering}</span>
                          <span>BPM: {item.bpm}</span>
                          <span>시간: {item.duration}분</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.noDataMessage}>
                <div className={styles.noDataIcon}>📅</div>
                <span>이 날짜에는 연습 기록이 없습니다.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
