import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Archive.module.css";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface SongFiles {
  title: string;
  audioFiles: Array<{
    fileId: number;
    audioUrl: string;
    recordedAt: string;
    date: string;
  }>;
  videoFiles: Array<{
    fileId: number;
    videoUrl: string;
    recordedAt: string;
    date: string;
  }>;
  totalFiles: number;
}

const Archive: React.FC = () => {
  const navigate = useNavigate();
  const [songTitles, setSongTitles] = useState<string[]>([]);
  const [songsData, setSongsData] = useState<Record<string, SongFiles>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});

  // 노래 제목 리스트 가져오기
  const fetchSongTitles = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/files/titles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      setSongTitles(result.data.titles || []);
      console.log("[📋 Archive Titles Loaded]", result.data.titles);
    } catch (error) {
      console.error("[❌ Archive Titles Error]", error);
      setError("노래 제목을 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 특정 노래의 파일 목록 가져오기
  const fetchSongFiles = async (title: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoadingFiles((prev) => ({ ...prev, [title]: true }));
    try {
      const encodedTitle = encodeURIComponent(title);
      const response = await fetch(
        `${baseUrl}/api/files/by-title?title=${encodedTitle}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      setSongsData((prev) => ({
        ...prev,
        [title]: result.data,
      }));
      console.log(`[🎵 Song Files Loaded] ${title}:`, result.data);
    } catch (error) {
      console.error(`[❌ Song Files Error] ${title}:`, error);
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [title]: false }));
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSongTitles().finally(() => setLoading(false));
  }, []);

  const handleToggle = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

    // 처음 펼칠 때만 파일을 로드
    if (!expanded[title] && !songsData[title]) {
      fetchSongFiles(title);
    }
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
          <div style={{ color: "#c00", fontSize: "1rem", fontWeight: "600" }}>
            {error}
          </div>
        ) : loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            노래 목록을 불러오는 중...
          </div>
        ) : songTitles.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              color: "#666",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            업로드된 음원이 없습니다. 먼저 파일을 업로드해보세요!
          </div>
        ) : (
          <div className={styles.songArchiveList}>
            {songTitles.map((title) => {
              const songData = songsData[title];
              const isExpanded = expanded[title];
              const isLoadingFiles = loadingFiles[title];
              const hasFiles =
                songData &&
                (songData.audioFiles.length > 0 ||
                  songData.videoFiles.length > 0);

              return (
                <div key={title} className={styles.songSection}>
                  <h3 className={styles.songTitle}>{title}</h3>

                  {/* 확장/축소 버튼 */}
                  <div className={styles.expandArrowWrapper}>
                    <button
                      className={styles.expandArrowBtn}
                      onClick={() => handleToggle(title)}
                      aria-label={isExpanded ? "Hide Files" : "Show Files"}
                    >
                      {isExpanded ? "\u25B2" : "\u25BC"}
                    </button>
                  </div>

                  {/* 파일 목록 */}
                  {isExpanded && (
                    <div className={styles.videoContainer}>
                      {isLoadingFiles ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "30px",
                            fontSize: "1rem",
                            fontWeight: "500",
                          }}
                        >
                          파일을 불러오는 중...
                        </div>
                      ) : hasFiles ? (
                        <ul className={styles.archiveList}>
                          {/* 오디오 파일들 */}
                          {songData.audioFiles.map((audioFile) => (
                            <li
                              key={`audio-${audioFile.fileId}`}
                              className={styles.archiveItemAudio}
                            >
                              <div className={styles.archiveDate}>
                                🎵 {audioFile.date}
                              </div>
                              <audio
                                src={audioFile.audioUrl}
                                controls
                                className={styles.archiveAudio}
                              />
                            </li>
                          ))}

                          {/* 비디오 파일들 */}
                          {songData.videoFiles.map((videoFile) => (
                            <li
                              key={`video-${videoFile.fileId}`}
                              className={styles.archiveItem}
                            >
                              <div className={styles.archiveDate}>
                                🎬 {videoFile.date}
                              </div>
                              <video
                                src={videoFile.videoUrl}
                                controls
                                className={styles.archiveVideo}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className={styles.empty}>
                          이 노래에 대한 파일이 없습니다.
                        </div>
                      )}
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
