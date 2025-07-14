import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Archive.module.css";
import { getAuthHeadersForGet, getApiBaseUrl } from "../../utils/apiUtils";

const songs = [
  { id: 12, title: "Canon Rock" },
  { id: 13, title: "Let It Be" },
  { id: 14, title: "Hotel California" },
];

const baseUrl = getApiBaseUrl();

const Archive: React.FC = () => {
  const navigate = useNavigate();
  const [archives, setArchives] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all(
      songs.map((song) =>
        fetch(`${baseUrl}/api/files/by-song?song_id=${song.id}`, {
          method: "GET",
          headers: getAuthHeadersForGet(),
        })
          .then((res) => {
            if (!res.ok) throw new Error("API failed");
            return res.json();
          })
          .then((data) => (Array.isArray(data) ? data : []))
          .catch(() => [])
      )
    )
      .then((results) => {
        const archiveObj: Record<number, any[]> = {};
        songs.forEach((song, idx) => {
          archiveObj[song.id] = results[idx];
        });
        setArchives(archiveObj);
      })
      .catch(() => {
        setError("Failed to load archive data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (songId: number) => {
    setExpanded((prev) => ({ ...prev, [songId]: !prev[songId] }));
  };

  return (
    <div className={styles.archiveContainer}>
      <button
        className={styles.slideChevronLeftBtn}
        onClick={() => navigate("/mypage")}
        aria-label="Back to MyPage"
      >
        &lt;
      </button>
      <div className={styles.archiveMainContent}>
        <h2>Archive</h2>
        {error ? (
          <div style={{ color: "#f55" }}>{error}</div>
        ) : (
          <div className={styles.songArchiveList}>
            {songs.map((song) => {
              const hasVideos = archives[song.id]?.length > 0;
              const isLoading = loading && !hasVideos;
              return (
                <div key={song.id} className={styles.songSection}>
                  <h3 className={styles.songTitle}>{song.title}</h3>
                  {(hasVideos || isLoading) && (
                    <div className={styles.expandArrowWrapper}>
                      <button
                        className={styles.expandArrowBtn}
                        onClick={() => handleToggle(song.id)}
                        aria-label={
                          expanded[song.id] ? "Hide Videos" : "Show Videos"
                        }
                      >
                        {expanded[song.id] ? "\u25B2" : "\u25BC"}
                      </button>
                    </div>
                  )}
                  {(hasVideos || (isLoading && expanded[song.id])) &&
                    expanded[song.id] && (
                      <div className={styles.videoContainer}>
                        <ul className={styles.archiveList}>
                          {hasVideos
                            ? archives[song.id].map((item, idx) => (
                                <li key={idx} className={styles.archiveItem}>
                                  <div className={styles.archiveDate}>
                                    {item.date}
                                  </div>
                                  {item.video_url && (
                                    <video
                                      src={item.video_url}
                                      controls
                                      width={180}
                                      height={110}
                                      className={styles.archiveVideo}
                                    />
                                  )}
                                  {item.recording_url && (
                                    <audio
                                      src={item.recording_url}
                                      controls
                                      className={styles.archiveAudio}
                                    />
                                  )}
                                </li>
                              ))
                            : [
                                <li
                                  key="loading"
                                  className={styles.archiveItem}
                                >
                                  <div className={styles.archiveDate}></div>
                                  <div
                                    className={styles.archiveVideoPlaceholder}
                                  >
                                    Loading...
                                  </div>
                                </li>,
                              ]}
                        </ul>
                      </div>
                    )}
                  {!hasVideos && !isLoading && (
                    <div className={styles.empty}>
                      No archive for this song.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
