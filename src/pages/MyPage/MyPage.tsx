import styles from "./MyPage.module.css";
import Calendar from "./components/Calendar";
import Timer from "./components/Timer";
import UploadBox from "./components/UploadBox";
import ChromaticList from "./components/ChromaticList";
import PracticeVideoList from "./components/PracticeVideoList";
import Archive from "./Archive";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTimer } from "../../context/TimerContext";
import React from "react";

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekday = week[today.getDay()];
  return `${year}-${month}-${day} (${weekday})`;
};

const MyPage = () => {
  const [showGoalPopup, setShowGoalPopup] = useState(false);
  const [goalTime, setGoalTime] = useState({ hours: "0", minutes: "0" });
  const [goalRecording, setGoalRecording] = useState(false);
  const [goalChromatic, setGoalChromatic] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();
  const { goalMinutes, setGoalMinutes } = useTimer();
  const [inputGoal, setInputGoal] = React.useState(goalMinutes);

  const handleGoalSetting = () => {
    setShowGoalPopup(true);
  };

  const handleGoalSave = () => {
    const h = Number(goalTime.hours) || 0;
    const m = Number(goalTime.minutes) || 0;
    const totalMinutes = h * 60 + m;
    setGoalMinutes(totalMinutes); // 연동: 타이머 목표 시간 설정
    setInputGoal(totalMinutes); // 입력값도 동기화
    alert(
      `Goal Saved!\nTime: ${h}h ${m}m\nRecording: ${
        goalRecording ? "On" : "Off"
      }\nChromatic: ${goalChromatic ? "On" : "Off"}`
    );
    setShowGoalPopup(false);
  };

  const handleSetGoal = () => {
    setGoalMinutes(inputGoal);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.todayTitle}>
          <span className={styles.todayTitleText}>{getTodayString()}</span>
          <button className={styles.todayTitleBtn} onClick={handleGoalSetting}>
            Set Goal
          </button>
        </div>
        {showGoalPopup && (
          <div className={styles.goalPopupOverlay}>
            <div className={styles.goalPopupBox}>
              <div className={styles.goalPopupHeader}>
                <span>Set Practice Goal</span>
                <button
                  className={styles.goalPopupClose}
                  onClick={() => setShowGoalPopup(false)}
                >
                  X
                </button>
              </div>
              <div className={styles.goalPopupContent}>
                <div className={styles.goalPopupTimeSection}>
                  <label className={styles.goalPopupTimeLabel}>
                    Total Practice Time
                  </label>
                  <div className={styles.goalPopupTimeRow}>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={goalTime.hours}
                      onChange={(e) =>
                        setGoalTime({ ...goalTime, hours: e.target.value })
                      }
                      className={styles.goalPopupTimeInput}
                      placeholder="0"
                    />
                    <span>h</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={goalTime.minutes}
                      onChange={(e) =>
                        setGoalTime({ ...goalTime, minutes: e.target.value })
                      }
                      className={styles.goalPopupTimeInput}
                      placeholder="0"
                    />
                    <span>m</span>
                  </div>
                </div>
                <div className={styles.goalPopupRecordingSection}>
                  <label className={styles.goalPopupRecordingLabel}>
                    Include Recording
                  </label>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={goalRecording}
                      onChange={(e) => setGoalRecording(e.target.checked)}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
                <div className={styles.goalPopupChromaticSection}>
                  <label className={styles.goalPopupChromaticLabel}>
                    Include Chromatic
                  </label>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={goalChromatic}
                      onChange={(e) => setGoalChromatic(e.target.checked)}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
                <div className={styles.goalPopupBtnRow}>
                  <button
                    className={styles.goalPopupBtn}
                    onClick={handleGoalSave}
                  >
                    Save
                  </button>
                  <button
                    className={styles.goalPopupBtn}
                    onClick={() => setShowGoalPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={styles.topContainer}>
          <div className={styles.calendarBox}>
            <Calendar />
          </div>
          <div className={styles.timerBox}>
            <Timer />
          </div>
          <div className={styles.rightBox}>
            <UploadBox />
            <ChromaticList />
          </div>
        </div>
        <div className={styles.bottomContainer}>
          <PracticeVideoList />
        </div>
        <button
          className={styles.slideChevronBtn}
          onClick={() => navigate("/archive")}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default MyPage;
