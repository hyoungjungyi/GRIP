import React, { useEffect, useState } from "react";
import styles from "./PracticeVideoList.module.css";
import { getAuthHeadersForGet, getApiBaseUrl } from "../../../utils/apiUtils";

const mockVideos = [
  {
    id: 1,
    title: "Chromatic Practice Video 1",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    date: "2025-07-10T15:30:00.000Z",
  },
  {
    id: 2,
    title: "Song Practice Video 2",
    url: "https://www.w3schools.com/html/movie.mp4",
    date: "2025-07-11T18:00:00.000Z",
  },
  {
    id: 3,
    title: "Scale Practice Video 3",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    date: "2025-07-12T09:20:00.000Z",
  },
];

const PracticeVideoList: React.FC = () => {
  const [videos, setVideos] = useState<typeof mockVideos>(mockVideos);
  const [apiFailed, setApiFailed] = useState(false);
  const baseUrl = getApiBaseUrl();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/files/videos`, {
          method: "GET",
          headers: getAuthHeadersForGet(),
        });
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        if (Array.isArray(data)) {
          setVideos(
            data.map((v, idx) => ({
              id: idx + 1,
              title: v.song_title || "Untitled",
              url: v.video_url,
              date: v.date,
            }))
          );
          setApiFailed(false);
        } else {
          setApiFailed(true);
        }
      } catch (err) {
        setApiFailed(true);
      }
    };
    fetchVideos();
  }, [baseUrl]);

  return (
    <div className={styles.listContainer}>
      <div className={styles.listTitle}>All Practice Videos</div>
      {videos.length === 0 ? (
        <div className={styles.empty}>No practice videos registered.</div>
      ) : (
        <ul className={styles.videoList}>
          {videos.map((video) => (
            <li key={video.id} className={styles.videoItem}>
              <video
                src={video.url}
                controls
                width={180}
                height={110}
                className={styles.videoThumb}
              />
              <div className={styles.videoInfo}>
                <div className={styles.videoTitle}>
                  {apiFailed ? "response failed" : video.title}
                </div>
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
