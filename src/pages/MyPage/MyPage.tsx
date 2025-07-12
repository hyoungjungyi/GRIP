import Navbar from "../../components/Navbar/Navbar";
import React from "react";
import styles from "./MyPage.module.css";
import Calendar from "./components/Calendar";
import Timer from "./components/Timer";
import UploadBox from "./components/UploadBox";
import ChromaticList from "./components/ChromaticList";
import PracticeVideoList from "./components/PracticeVideoList";

const MyPage = () => {
  return (
    <div>
      <Navbar />
      <div className={styles.container}>
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
      </div>
    </div>
  );
};

export default MyPage;
