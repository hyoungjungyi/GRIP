import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllSongLists,
  generateTabFromAudio,
  uploadSheet,
} from "./sheetViewApi";
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
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    artist: "",
    cover: null as File | null,
    noteSheet: null as File | null,
    tabSheet: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongLists = async () => {
      try {
        const data = await getAllSongLists();
        console.log("[📋 SheetView] API Response:", data);
        console.log("[📋 SheetView] Ongoing songs:", data?.ongoing);
        console.log("[📋 SheetView] Recommend songs:", data?.recommend);
        console.log("[📋 SheetView] Generated songs:", data?.generated);
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

  const handleUploadClick = () => {
    setShowUploadPopup(true);
  };

  const handleUploadClose = () => {
    setShowUploadPopup(false);
    setUploadData({
      title: "",
      artist: "",
      cover: null,
      noteSheet: null,
      tabSheet: null,
    });
    setIsUploading(false);
  };

  const handleFileChange = (field: string, file: File | null) => {
    setUploadData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setUploadData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUploadSubmit = async () => {
    const { title, artist, cover, noteSheet, tabSheet } = uploadData;

    if (!title.trim() || !artist.trim() || !cover || !noteSheet || !tabSheet) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await uploadSheet({
        title: title.trim(),
        artist: artist.trim(),
        cover,
        noteSheet,
        tabSheet,
      });

      console.log("[✅ SheetView] Upload success:", uploadResult);

      alert("악보가 성공적으로 업로드되었습니다!");
      handleUploadClose();

      // 리스트 새로고침
      console.log("[🔄 SheetView] Refreshing song lists...");
      const data = await getAllSongLists();
      console.log("[📋 SheetView] Refreshed data:", data);
      setLists(data);
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const albumCover = "/guitar_head.png"; // 기본 이미지

  // 앨범 커버 이미지 URL 가져오기 함수
  const getAlbumCoverUrl = (song: any) => {
    if (song.coverUrl) {
      console.log(`[🖼️ SheetView] Found cover image: coverUrl = ${song.coverUrl}`);
      return song.coverUrl;
    }
    
    console.log(`[🖼️ SheetView] No cover image found for song:`, song);
    return albumCover; // 기본 이미지 반환
  };

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
            <button onClick={handleUploadClick} className={styles.button}>
              UPLOAD SHEET
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
                          src={getAlbumCoverUrl(song)}
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
                          src={getAlbumCoverUrl(song)}
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
                          src={getAlbumCoverUrl(song)}
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

      {/* 업로드 팝업 */}
      {showUploadPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <div className={styles.popupHeader}>
              <h3>악보 업로드</h3>
              <button
                className={styles.popupClose}
                onClick={handleUploadClose}
                disabled={isUploading}
              >
                ×
              </button>
            </div>

            <div className={styles.popupContent}>
              {/* 제목 입력 */}
              <div className={styles.inputGroup}>
                <label>곡 제목 *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="곡 제목을 입력하세요"
                  disabled={isUploading}
                />
              </div>

              {/* 아티스트 입력 */}
              <div className={styles.inputGroup}>
                <label>아티스트 *</label>
                <input
                  type="text"
                  value={uploadData.artist}
                  onChange={(e) => handleInputChange("artist", e.target.value)}
                  placeholder="아티스트를 입력하세요"
                  disabled={isUploading}
                />
              </div>

              {/* 표지 업로드 */}
              <div className={styles.inputGroup}>
                <label>표지 이미지 *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("cover", e.target.files?.[0] || null)
                  }
                  disabled={isUploading}
                />
                {uploadData.cover && (
                  <div className={styles.fileInfo}>
                    선택된 파일: {uploadData.cover.name}
                  </div>
                )}
              </div>

              {/* Note 악보 업로드 */}
              <div className={styles.inputGroup}>
                <label>Note 악보 *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("noteSheet", e.target.files?.[0] || null)
                  }
                  disabled={isUploading}
                />
                {uploadData.noteSheet && (
                  <div className={styles.fileInfo}>
                    선택된 파일: {uploadData.noteSheet.name}
                  </div>
                )}
              </div>

              {/* Tab 악보 업로드 */}
              <div className={styles.inputGroup}>
                <label>Tab 악보 *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("tabSheet", e.target.files?.[0] || null)
                  }
                  disabled={isUploading}
                />
                {uploadData.tabSheet && (
                  <div className={styles.fileInfo}>
                    선택된 파일: {uploadData.tabSheet.name}
                  </div>
                )}
              </div>

              {/* 업로드 버튼 */}
              <div className={styles.buttonGroup}>
                <button
                  className={styles.cancelBtn}
                  onClick={handleUploadClose}
                  disabled={isUploading}
                >
                  취소
                </button>
                <button
                  className={styles.uploadBtn}
                  onClick={handleUploadSubmit}
                  disabled={
                    isUploading ||
                    !uploadData.title.trim() ||
                    !uploadData.artist.trim() ||
                    !uploadData.cover ||
                    !uploadData.noteSheet ||
                    !uploadData.tabSheet
                  }
                >
                  {isUploading ? "업로드 중..." : "업로드"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SheetView;
