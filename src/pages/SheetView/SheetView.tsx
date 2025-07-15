import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSongLists, generateTabFromAudio } from "./sheetViewApi";
import styles from "./SheetView.module.css";

interface OngoingSong {
  song_id: number;
  title: string;
  artist: string;
  progress: number;
}
interface RecommendSong {
  song_id: number;
  title: string;
  artist: string;
  genre: string;
}
interface GeneratedSong {
  song_id: number;
  title: string;
  created_at: string;
}
interface SongLists {
  ongoing: OngoingSong[];
  recommend: RecommendSong[];
  generated: GeneratedSong[];
}

const SheetView: React.FC = () => {
  const [link, setLink] = useState("");
  const [lists, setLists] = useState<SongLists | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongLists = async () => {
      try {
        const data = await getAllSongLists();
        setLists(data);
      } catch (error) {
        console.error("Error fetching song lists:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSongLists();
  }, []);

  const handleGenerate = async () => {
    if (!link) {
      alert("링크를 입력하세요.");
      return;
    }

    try {
      const data = await generateTabFromAudio(link);
      alert(
        `생성 완료! song_id: ${data.song_id}\nTab 이미지: ${data.tab_image_url}`
      );
      // 필요시: 생성된 song_id로 이동하거나, UI 갱신 등 추가 작업
    } catch (error) {
      console.error("Tab generation failed:", error);
      alert("생성 실패: " + error);
    }
  };

  const handleAlbumClick = (songId: number) => {
    navigate(`/album/${songId}`);
  };

  const albumCover = "/guitar_head.png"; // 예시 이미지, 실제 데이터에 따라 변경 가능

  return (
    <>
      <div className={styles.container}>
        <div className={styles.topContainer}>
          <div className={styles.topDescription}>
            <span className={styles.topDescriptionText}>
              Generate Tab Sheet
            </span>
          </div>
          {/* Link input & Generate button */}
          <div className={styles.inputRow}>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste a link here..."
              className={styles.input}
            />
            <button onClick={handleGenerate} className={styles.glassButton}>
              <img src="../src/assets/ai.png" alt="AI" className={styles.aiBadgeImage} />
              <span>GENERATE</span>
            </button>
          </div>
        </div>
        <div className={styles.bottomContainer}>
          {/* Album lists */}
          {loading ? (
            <div>
              {/* Ongoing */}
              <div className={styles.listSection}>
                <h2 className={styles.listTitle}>Ongoing</h2>
                <div className={styles.albumRow}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className={styles.albumCard}>
                      <img
                        src={albumCover}
                        alt="cover"
                        className={styles.albumImg}
                      />
                      <div className={styles.failedMsg}>Loading...</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recommend */}
              <div className={styles.listSection}>
                <h2 className={styles.listTitle}>Recommend</h2>
                <div className={styles.albumRow}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className={styles.albumCard}>
                      <img
                        src={albumCover}
                        alt="cover"
                        className={styles.albumImg}
                      />
                      <div className={styles.failedMsg}>Loading...</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Generated */}
              <div className={styles.listSection}>
                <h2 className={styles.listTitle}>Generated</h2>
                <div className={styles.albumRow}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className={styles.albumCard}>
                      <img
                        src={albumCover}
                        alt="cover"
                        className={styles.albumImg}
                      />
                      <div className={styles.failedMsg}>Loading...</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Ongoing */}
              <div className={styles.listSection}>
                <h2 className={styles.listTitle}>Ongoing</h2>
                <div className={styles.albumRow}>
                  {error ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={styles.albumCard}
                        onClick={() => handleAlbumClick(0)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={albumCover}
                          alt="cover"
                          className={styles.albumImg}
                        />
                        <div className={styles.failedMsg}>Failed to load</div>
                      </div>
                    ))
                  ) : lists && lists.ongoing.length === 0 ? (
                    <div>No ongoing songs.</div>
                  ) : (
                    lists &&
                    lists.ongoing.map((song) => (
                      <div
                        key={song.song_id}
                        className={styles.albumCard}
                        onClick={() => handleAlbumClick(song.song_id)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={albumCover}
                          alt="cover"
                          className={styles.albumImg}
                        />
                        <div className={styles.albumTitle}>{song.title}</div>
                        <div className={styles.albumArtist}>{song.artist}</div>
                        <div className={styles.albumProgress}>
                          Progress: {song.progress}%
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Recommend */}
              <div className={styles.listSection}>
                <h2 className={styles.listTitle}>Recommend</h2>
                <div className={styles.albumRow}>
                  {error ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={styles.albumCard}
                        onClick={() => handleAlbumClick(0)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={albumCover}
                          alt="cover"
                          className={styles.albumImg}
                        />
                        <div className={styles.failedMsg}>Failed to load</div>
                      </div>
                    ))
                  ) : lists && lists.recommend.length === 0 ? (
                    <div>No recommendations.</div>
                  ) : (
                    lists &&
                    lists.recommend.map((song) => (
                      <div
                        key={song.song_id}
                        className={styles.albumCard}
                        onClick={() => handleAlbumClick(song.song_id)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={albumCover}
                          alt="cover"
                          className={styles.albumImg}
                        />
                        <div className={styles.albumTitle}>{song.title}</div>
                        <div className={styles.albumArtist}>{song.artist}</div>
                        <div className={styles.albumGenre}>{song.genre}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Generated */}
              <div className={styles.listSection}>
                <h2 className={styles.listTitle}>Generated</h2>
                <div className={styles.albumRow}>
                  {error ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={styles.albumCard}
                        onClick={() => handleAlbumClick(0)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={albumCover}
                          alt="cover"
                          className={styles.albumImg}
                        />
                        <div className={styles.failedMsg}>Failed to load</div>
                      </div>
                    ))
                  ) : lists && lists.generated.length === 0 ? (
                    <div>No generated songs.</div>
                  ) : (
                    lists &&
                    lists.generated.map((song) => (
                      <div
                        key={song.song_id}
                        className={styles.albumCard}
                        onClick={() => handleAlbumClick(song.song_id)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={albumCover}
                          alt="cover"
                          className={styles.albumImg}
                        />
                        <div className={styles.albumTitle}>{song.title}</div>
                        <div className={styles.albumDate}>
                          {new Date(song.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SheetView;
