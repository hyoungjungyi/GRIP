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
  const [isGenerating, setIsGenerating] = useState(false); // Generate 로딩 상태 추가
  const [uploadData, setUploadData] = useState({
    title: "",
    artist: "",
    cover: null as File | null,
    noteSheet: null as File | null,
    tabSheet: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // 곡 리스트를 다시 불러오는 함수
  const refreshSongLists = async () => {
    try {
      console.log("[🔄 SheetView] Refreshing song lists...");
      const data = await getAllSongLists();
      console.log("[📋 SheetView] Refreshed API Response:", data);
      console.log("[📋 SheetView] Refreshed Ongoing songs:", data?.ongoing);
      console.log("[📋 SheetView] Refreshed Recommend songs:", data?.recommend);
      console.log("[📋 SheetView] Refreshed Generated songs:", data?.generated);
      setLists(data);
      setError(false); // 에러 상태 초기화
    } catch (error) {
      console.error("Error refreshing song lists:", error);
      setError(true);
    }
  };

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

    if (isGenerating) {
      return; // 이미 생성 중이면 중복 실행 방지
    }

    setIsGenerating(true);
    console.log("🎵 YouTube → 기타 TAB 생성 시작:", link);

    try {
      const data = await generateTabFromAudio(link);
      console.log("✅ TAB 생성 완료:", data);
      
      // 성공 메시지 표시
      alert(
        `🎸 기타 TAB 생성 완료!\n` +
        `곡명: ${data.song_info?.title || 'Unknown'}\n` +
        `아티스트: ${data.song_info?.artist || 'Unknown'}\n` +
        `Song ID: ${data.song_id || 'N/A'}`
      );

      // 입력 필드 초기화
      setLink("");

      // 화면 재구성 - 곡 리스트 다시 불러오기
      console.log("🔄 화면 재구성 중...");
      await refreshSongLists();
      
    } catch (error: any) {
      console.error("❌ TAB 생성 실패:", error);
      alert(
        `❌ 기타 TAB 생성 실패\n` +
        `오류: ${error.message || '알 수 없는 오류'}\n` +
        `YouTube 링크를 확인해주세요.`
      );
    } finally {
      setIsGenerating(false);
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
    // coverUrl이 존재하고 유효한 문자열인지 확인
    if (song?.coverUrl && typeof song.coverUrl === 'string' && song.coverUrl.trim() !== '') {
      console.log(`[🖼️ SheetView] Found cover image: coverUrl = ${song.coverUrl}`);
      return song.coverUrl;
    }
    
    // coverUrl이 null, undefined, 빈 문자열인 경우 기본 이미지 사용
    console.log(`[🖼️ SheetView] No valid cover image found for song (coverUrl: ${song?.coverUrl}), using default:`, song);
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
              disabled={isGenerating}
              style={{
                opacity: isGenerating ? 0.7 : 1,
              }}
            />
            <button 
              onClick={handleGenerate} 
              className={styles.glassButton}
              disabled={isGenerating}
              style={{
                opacity: isGenerating ? 0.7 : 1,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
              }}
            >
              {isGenerating && <div className={styles.spinner}></div>}
              <img src="../src/assets/ai.png" alt="AI" className={styles.aiBadgeImage} />
              <span>{isGenerating ? "GENERATING..." : "GENERATE"}</span>
            </button>
            <button 
              onClick={handleUploadClick} 
              className={styles.buttonGlassBlack}
              disabled={isGenerating}
            >
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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== albumCover) {
                              console.log(`[🖼️ SheetView] Image load failed, using default: ${target.src}`);
                              target.src = albumCover;
                            }
                          }}
                        />
                        <div className={styles.albumTitle} title={song.title}>{song.title}</div>
                        <div className={styles.albumArtist} title={song.artist}>{song.artist}</div>
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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== albumCover) {
                              console.log(`[🖼️ SheetView] Image load failed, using default: ${target.src}`);
                              target.src = albumCover;
                            }
                          }}
                        />
                        <div className={styles.albumTitle} title={song.title}>{song.title}</div>
                        <div className={styles.albumArtist} title={song.artist}>{song.artist}</div>
                        <div className={styles.albumGenre} title={song.genre}>{song.genre}</div>
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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== albumCover) {
                              console.log(`[🖼️ SheetView] Image load failed, using default: ${target.src}`);
                              target.src = albumCover;
                            }
                          }}
                        />
                        <div className={styles.albumTitle} title={song.title}>{song.title}</div>
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

      {/* Generate 로딩 오버레이 */}
      {isGenerating && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingText}>기타 TAB 생성 중...</div>
            <div className={styles.loadingSubText}>YouTube 영상을 분석하고 있습니다</div>
          </div>
        </div>
      )}

      {/* 업로드 팝업 */}
      {showUploadPopup && (
        <div className={styles.goalPopupOverlay}>
          <div className={styles.goalPopupBox}>
            <div className={styles.goalPopupHeader}>
              <span>Upload Sheet</span>
              <button
                className={styles.goalPopupClose}
                onClick={handleUploadClose}
                disabled={isUploading}
              >
                ×
              </button>
            </div>

            <div className={styles.goalPopupContent}>
              {/* 제목 입력 */}
              <div className={styles.goalPopupTimeSection}>
                <label className={styles.goalPopupTimeLabel}>곡 제목 *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="곡 제목을 입력하세요"
                  className={styles.goalPopupTimeInput}
                  disabled={isUploading}
                />
              </div>

              {/* 아티스트 입력 */}
              <div className={styles.goalPopupTimeSection}>
                <label className={styles.goalPopupTimeLabel}>아티스트 *</label>
                <input
                  type="text"
                  value={uploadData.artist}
                  onChange={(e) => handleInputChange("artist", e.target.value)}
                  placeholder="아티스트를 입력하세요"
                  className={styles.goalPopupTimeInput}
                  disabled={isUploading}
                />
              </div>

              {/* 표지 업로드 */}
              <div className={styles.goalPopupTimeSection}>
                <label className={styles.goalPopupTimeLabel}>표지 이미지 *</label>
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
              <div className={styles.goalPopupTimeSection}>
                <label className={styles.goalPopupTimeLabel}>Note 악보 *</label>
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
              <div className={styles.goalPopupTimeSection}>
                <label className={styles.goalPopupTimeLabel}>Tab 악보 *</label>
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

              {/* 버튼 */}
              <div className={styles.goalPopupBtnRow}>
                <button
                  className={styles.goalPopupSaveBtn}
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
                <button
                  className={styles.goalPopupCancelBtn}
                  onClick={handleUploadClose}
                  disabled={isUploading}
                >
                  취소
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
