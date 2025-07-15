import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSheetImage, addToSavedSongs, removeFromSavedSongs, checkSavedSongStatus } from "./sheetViewApi";
import { useToast } from "../../hooks/useToast";
import { useUser } from "../../components/Navbar/UserContext";
import Toast from "../../components/Toast";
import styles from "./SheetView.module.css";

const AlbumDetail: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { user } = useUser();
  const [isFavorite, setIsFavorite] = useState(false);
  const [sheetType, setSheetType] = useState<"tab" | "note">("tab"); // 'tab' 또는 'note'
  const [sheetImageUrl, setSheetImageUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [songData, setSongData] = useState<any>(null);

  // 이미지 확대/축소 및 이동 상태
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // 즐겨찾기 상태 확인 (페이지 로딩시에만)
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!songId) return;
      
      try {
        console.log(`[⭐ AlbumDetail] 즐겨찾기 상태 확인 - songId: ${songId}`);
        const result = await checkSavedSongStatus(parseInt(songId));
        console.log(`[⭐ AlbumDetail] API 결과:`, result);
        
        // 즐겨찾기 상태 설정
        const isCurrentlyFavorite = result?.isSaved === true;
        setIsFavorite(isCurrentlyFavorite);
        console.log(`[⭐ AlbumDetail] 즐겨찾기 상태 설정: ${isCurrentlyFavorite}`);
        
        // 🧪 테스트: songId가 1, 2, 3인 경우 강제로 즐겨찾기 상태
        if (['1', '2', '3'].includes(songId)) {
          console.log(`[🧪 TEST] songId ${songId} 강제로 즐겨찾기 상태로 설정`);
          setIsFavorite(true);
        }
        
      } catch (error) {
        console.error(`[❌ AlbumDetail] 즐겨찾기 상태 확인 실패:`, error);
        setIsFavorite(false);
      }
    };

    loadFavoriteStatus();
  }, [songId]);

  // API로 악보 데이터 불러오기
  useEffect(() => {
    const fetchSheetData = async () => {
      if (!songId) return;

      setLoading(true);
      setImageError(false);
      
      try {
        console.log('[🎼 AlbumDetail] Fetching sheet data for songId:', songId);
        const data = await getSheetImage(songId);
        console.log('[🎼 AlbumDetail] Sheet data received:', data);
        
        setSongData(data);
        
        // 악보 타입에 따라 이미지 URL 설정
        const getSheetUrl = () => {
          if (sheetType === "tab") {
            return data.tabSheetUrl || data.sheet_image_url || "";
          } else {
            return data.noteSheetUrl || "";
          }
        };
        
        const sheetUrl = getSheetUrl();
        console.log(`[🎼 AlbumDetail] Setting ${sheetType} sheet URL:`, sheetUrl);
        setSheetImageUrl(sheetUrl);
        
        if (!sheetUrl) {
          setImageError(true);
        }
        
      } catch (error) {
        console.error('[❌ AlbumDetail] Error fetching sheet data:', error);
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, [songId, sheetType]);

  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load sheet image: ${sheetImageUrl}`);
  };

  const handleFavoriteToggle = async () => {
    if (!songId || favoriteLoading) return;

    // 로그인 상태 확인
    if (!user) {
      showError("로그인이 필요합니다.");
      return;
    }

    setFavoriteLoading(true);
    try {
      console.log(`[⭐ AlbumDetail] 즐겨찾기 토글 시작 - songId: ${songId}, 현재 상태: ${isFavorite}`);
      
      if (isFavorite) {
        // 즐겨찾기 제거
        await removeFromSavedSongs(parseInt(songId));
        setIsFavorite(false);
        showSuccess("즐겨찾기에서 제거되었습니다!");
        console.log(`[⭐ AlbumDetail] 즐겨찾기 제거 완료 - songId: ${songId}`);
      } else {
        // 즐겨찾기 추가
        await addToSavedSongs(parseInt(songId));
        setIsFavorite(true);
        showSuccess("즐겨찾기에 추가되었습니다!");
        console.log(`[⭐ AlbumDetail] 즐겨찾기 추가 완료 - songId: ${songId}`);
      }
    } catch (error: any) {
      console.error(`[❌ AlbumDetail] 즐겨찾기 토글 실패 - songId: ${songId}:`, error);
      
      // 에러 타입에 따른 상세 메시지
      if (error.message?.includes('401')) {
        showError('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else if (error.message?.includes('404')) {
        showError('해당 곡을 찾을 수 없습니다.');
      } else if (error.message?.includes('409')) {
        showError('이미 즐겨찾기에 추가된 곡입니다.');
      } else {
        showError('즐겨찾기 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSheetTypeToggle = () => {
    const newSheetType = sheetType === "tab" ? "note" : "tab";
    setSheetType(newSheetType);
    console.log(`Sheet type changed to:`, newSheetType);

    // useEffect가 sheetType 변경을 감지해서 자동으로 이미지 업데이트
  };

  // 확대/축소 핸들러 (마우스 휠)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 3); // 0.5배 ~ 3배 제한
    setScale(newScale);
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPosition(position);
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setPosition({
      x: lastPosition.x + deltaX,
      y: lastPosition.y + deltaY,
    });
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 이미지 리셋 (원래 크기와 위치로)
  const handleResetImage = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className={styles.albumDetailContainer}>
      {/* 토스트 알림들 */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* 악보 이미지 */}
      <div
        className={styles.sheetImageContainer}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // 마우스가 컨테이너를 벗어나면 드래그 종료
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          overflow: "hidden",
          userSelect: "none", // 텍스트 선택 방지
        }}
      >
        {loading ? (
          <div className={styles.loadingPlaceholder}>악보를 불러오는 중...</div>
        ) : sheetImageUrl && !imageError ? (
          <img
            src={sheetImageUrl}
            alt={`Song ${songId} ${sheetType} sheet music`}
            className={styles.sheetImage}
            onError={handleImageError}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${
                position.y / scale
              }px)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
              pointerEvents: "none", // 이미지 자체의 드래그 방지
            }}
            draggable={false} // HTML5 드래그 방지
          />
        ) : imageError ? (
          <div className={styles.loadingPlaceholder}>
            {sheetType === "tab" ? "Tab" : "Note"} 악보를 찾을 수 없습니다.
            <br />
            {songData ? (
              <>
                곡명: {songData.title} - {songData.artist}
                <br />
                악보 URL: {sheetImageUrl || "없음"}
              </>
            ) : (
              "악보 데이터를 불러올 수 없습니다."
            )}
          </div>
        ) : (
          <div className={styles.loadingPlaceholder}>악보를 불러오는 중...</div>
        )}
      </div>

      {/* 우측 하단 버튼들 */}
      <div className={styles.controlButtons}>
        {/* 이미지 리셋 버튼 */}
        <button
          className={`${styles.controlButton} ${styles.resetButton}`}
          onClick={handleResetImage}
          title="이미지 원래 크기로 리셋"
        >
          ⌂
        </button>

        {/* 타브/계이름 전환 버튼 */}
        <button
          className={`${styles.controlButton} ${styles.sheetTypeButton}`}
          onClick={handleSheetTypeToggle}
          title={
            sheetType === "tab" ? "계이름 악보로 전환" : "타브 악보로 전환"
          }
        >
          {sheetType === "tab" ? "♪" : "TAB"}
        </button>

        {/* 즐겨찾기 버튼 */}
        <button
          className={`${styles.controlButton} ${styles.favoriteButton} ${
            isFavorite ? styles.favoriteActive : ""
          } ${favoriteLoading ? styles.loading : ""} ${!user ? styles.disabled : ""}`}
          onClick={handleFavoriteToggle}
          disabled={favoriteLoading || !user}
          title={
            !user
              ? "로그인이 필요합니다"
              : favoriteLoading 
                ? "처리 중..." 
                : isFavorite 
                  ? "즐겨찾기 해제" 
                  : "즐겨찾기 추가"
          }
        >
          {favoriteLoading ? "⏳" : isFavorite ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
};

export default AlbumDetail;
