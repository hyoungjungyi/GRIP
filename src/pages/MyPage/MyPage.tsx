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
  // localStorage에서 초기값 로드
  const getStoredGoalSettings = () => {
    const stored = localStorage.getItem("practiceGoalSettings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        return {
          recording: settings.recording || { isOn: false },
          chromatic: settings.chromatic || {
            isOn: false,
            time: { hours: "0", minutes: "0" },
          },
        };
      } catch {
        return {
          recording: { isOn: false },
          chromatic: { isOn: false, time: { hours: "0", minutes: "0" } },
        };
      }
    }
    return {
      recording: { isOn: false },
      chromatic: { isOn: false, time: { hours: "0", minutes: "0" } },
    };
  };

  const [showGoalPopup, setShowGoalPopup] = useState(false);
  const [goalTime, setGoalTime] = useState({ hours: "0", minutes: "0" });
  const storedSettings = getStoredGoalSettings();
  const [goalRecording, setGoalRecording] = useState(
    storedSettings.recording?.isOn || false
  );
  const [goalChromatic, setGoalChromatic] = useState(
    storedSettings.chromatic?.isOn || false
  );
  const [goalChromaticTime, setGoalChromaticTime] = useState(
    storedSettings.chromatic?.time || { hours: "0", minutes: "0" }
  );
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();
  const { goalMinutes, setGoalMinutes } = useTimer();
  const [inputGoal, setInputGoal] = React.useState(goalMinutes);

  const handleGoalSetting = () => {
    // 현재 설정된 목표 시간을 가져와서 기본값으로 설정
    const currentHours = Math.floor(goalMinutes / 60);
    const currentMinutes = goalMinutes % 60;
    setGoalTime({
      hours: currentHours.toString(),
      minutes: currentMinutes.toString(),
    });
    setShowGoalPopup(true);
  };

  const handleGoalSave = () => {
    const h = Number(goalTime.hours) || 0;
    const m = Number(goalTime.minutes) || 0;
    const totalMinutes = h * 60 + m;

    const chromaticH = Number(goalChromaticTime?.hours) || 0;
    const chromaticM = Number(goalChromaticTime?.minutes) || 0;

    setGoalMinutes(totalMinutes);
    setInputGoal(totalMinutes);

    // 이전 설정을 불러와서 기존 값들을 보존
    const previousSettings = getStoredGoalSettings();

    // 모든 설정을 localStorage에 저장 (on/off 상태와 설정값 모두 보존)
    const goalSettings = {
      recording: {
        isOn: goalRecording,
        // 기존 recording 관련 설정이 있다면 보존
        ...previousSettings.recording,
      },
      chromatic: {
        // 기존 chromatic 관련 설정이 있다면 보존
        ...previousSettings.chromatic,
        isOn: goalChromatic, // isOn은 현재 값으로 덮어쓰기
        time: goalChromaticTime || { hours: "0", minutes: "0" }, // time도 현재 값으로 덮어쓰기
      },
    };
    localStorage.setItem("practiceGoalSettings", JSON.stringify(goalSettings));

    alert(
      `Goal Saved!\n` +
        `Total Practice Time: ${h}h ${m}m\n` +
        `Include Recording: ${goalRecording ? "On" : "Off"}\n` +
        `Include Chromatic: ${goalChromatic ? "On" : "Off"}` +
        (goalChromatic
          ? `\nChromatic Practice Time: ${chromaticH}h ${chromaticM}m`
          : "")
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
                      placeholder=""
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
                      placeholder=""
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
                {goalRecording && (
                  <div className={styles.recordingWarning}>
                    You must upload at least one video/recording per day.
                  </div>
                )}
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
                {goalChromatic && (
                  <div className={styles.chromaticTimeSection}>
                    <label className={styles.chromaticTimeLabel}>
                      Total Chromatic Practice Time
                    </label>
                    <div className={styles.chromaticTimeInputRow}>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={goalChromaticTime.hours}
                        onChange={(e) =>
                          setGoalChromaticTime({
                            ...goalChromaticTime,
                            hours: e.target.value,
                          })
                        }
                        className={styles.goalPopupTimeInput}
                        placeholder=""
                      />
                      <span>h</span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={goalChromaticTime.minutes}
                        onChange={(e) =>
                          setGoalChromaticTime({
                            ...goalChromaticTime,
                            minutes: e.target.value,
                          })
                        }
                        className={styles.goalPopupTimeInput}
                        placeholder=""
                      />
                      <span>m</span>
                    </div>
                  </div>
                )}
                <div className={styles.goalPopupBtnRow}>
                  <button
                    className={styles.goalPopupSaveBtn}
                    onClick={handleGoalSave}
                  >
                    Save
                  </button>
                  <button
                    className={styles.goalPopupCancelBtn}
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
