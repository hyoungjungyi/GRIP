import React from "react";
import styles from "./PracticeVideoList.module.css";

const mockVideos = [
  {
    id: 1,
    title: "크로메틱 연습 영상 1",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    date: "2025-07-10T15:30:00.000Z",
  },
  {
    id: 2,
    title: "곡 연습 영상 2",
    url: "https://www.w3schools.com/html/movie.mp4",
    date: "2025-07-11T18:00:00.000Z",
  },
  {
    id: 3,
    title: "스케일 연습 영상 3",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    date: "2025-07-12T09:20:00.000Z",
  },
];

const PracticeVideoList: React.FC = () => {
  return (
    <div className={styles.listContainer}>
      <div className={styles.listTitle}>전체 연습 영상 리스트</div>
      {mockVideos.length === 0 ? (
        <div className={styles.empty}>등록된 연습 영상이 없습니다.</div>
      ) : (
        <ul className={styles.videoList}>
          {mockVideos.map((video) => (
            <li key={video.id} className={styles.videoItem}>
              <video
                src={video.url}
                controls
                width={180}
                height={110}
                className={styles.videoThumb}
              />
              <div className={styles.videoInfo}>
                <div className={styles.videoTitle}>{video.title}</div>
                <div className={styles.videoDate}>
                  {new Date(video.date).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PracticeVideoList;
