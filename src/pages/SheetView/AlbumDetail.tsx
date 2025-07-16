import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSheetImage, addToSavedSongs, removeFromSavedSongs, checkSavedSongStatus, deleteSong } from "./sheetViewApi";
import { useToast } from "../../hooks/useToast";
import { useUser } from "../../components/Navbar/UserContext";
import { FaStar, FaRegStar, FaTrashAlt, FaRedo, FaMusic } from "react-icons/fa";

import Toast from "../../components/Toast";
import styles from "./SheetView.module.css";

// 즐겨찾기 상태 변경 이벤트를 위한 타입 정의
declare global {
  interface WindowEventMap {
    'favoriteChanged': CustomEvent<{ songId: number; isFavorite: boolean }>;
  }
}

const AlbumDetail: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { user } = useUser();
  const [isFavorite, setIsFavorite] = useState(false);
  const [sheetType, setSheetType] = useState<"tab" | "note">("tab"); // 'tab' 또는 'note'
  const [sheetImageUrl, setSheetImageUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [songData, setSongData] = useState<any>(null);

  // 이미지 확대/축소 및 이동 상태
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // 즐겨찾기 상태 확인 (페이지 로딩시)
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!songId) {
        console.log('[⭐ AlbumDetail] songId가 없음');
        setIsFavorite(false);
        return;
      }

      // 로그인 상태 확인
      const token = localStorage.getItem("accessToken") || localStorage.getItem("jwt_token");
      if (!user || !token) {
        console.log('[⭐ AlbumDetail] 로그인되지 않음 - 즐겨찾기 false');
        setIsFavorite(false);
        return;
      }
      
      try {
        console.log(`[⭐ AlbumDetail] 즐겨찾기 상태 확인 시작 - songId: ${songId}`);
        const result = await checkSavedSongStatus(parseInt(songId));
        console.log(`[⭐ AlbumDetail] API 응답:`, result);
        
        // API에서 isSaved 값을 받아서 컴포넌트의 isFavorite state에 설정
        const isSaved = Boolean(result?.isSaved);
        setIsFavorite(isSaved);
        
        console.log(`[⭐ AlbumDetail] 즐겨찾기 상태 설정 완료: isSaved=${result?.isSaved} → isFavorite=${isSaved}`);
        
      } catch (error) {
        console.error(`[❌ AlbumDetail] 즐겨찾기 상태 확인 실패:`, error);
        setIsFavorite(false);
      }
    };

    // 컴포넌트 마운트 시 즐겨찾기 상태 바로 확인
    loadFavoriteStatus();
  }, [songId, user]);

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

    // 로그인 확인
    const token = localStorage.getItem("accessToken") || localStorage.getItem("jwt_token");
    if (!user || !token) {
      showError("로그인이 필요합니다.");
      return;
    }

    setFavoriteLoading(true);
    const previousState = isFavorite; // 실패시 복원용
    
    try {
      console.log(`[⭐ AlbumDetail] 즐겨찾기 토글 - songId: ${songId}, 현재 isFavorite: ${isFavorite}`);
      
      if (isFavorite) {
        // 즐겨찾기 제거
        console.log(`[⭐ AlbumDetail] 즐겨찾기 제거 요청 시작`);
        const result = await removeFromSavedSongs(parseInt(songId));
        console.log(`[⭐ AlbumDetail] 즐겨찾기 제거 API 응답:`, result);
        
        if (result?.success) {
          setIsFavorite(false);
          showSuccess("즐겨찾기에서 제거되었습니다!");
          console.log(`[✅ AlbumDetail] 즐겨찾기 제거 완료 - isFavorite: true → false`);
          
          // 다른 컴포넌트에 상태 변경 알림
          window.dispatchEvent(new CustomEvent('favoriteChanged', { 
            detail: { songId: parseInt(songId), isFavorite: false } 
          }));
        } else {
          throw new Error('즐겨찾기 제거에 실패했습니다.');
        }
      } else {
        // 즐겨찾기 추가
        console.log(`[⭐ AlbumDetail] 즐겨찾기 추가 요청 시작`);
        const result = await addToSavedSongs(parseInt(songId));
        console.log(`[⭐ AlbumDetail] 즐겨찾기 추가 API 응답:`, result);
        
        if (result?.success) {
          setIsFavorite(true);
          showSuccess("즐겨찾기에 추가되었습니다!");
          console.log(`[✅ AlbumDetail] 즐겨찾기 추가 완료 - isFavorite: false → true`);
          
          // 다른 컴포넌트에 상태 변경 알림
          window.dispatchEvent(new CustomEvent('favoriteChanged', { 
            detail: { songId: parseInt(songId), isFavorite: true } 
          }));
        } else {
          throw new Error('즐겨찾기 추가에 실패했습니다.');
        }
      }
    } catch (error: any) {
      console.error(`[❌ AlbumDetail] 즐겨찾기 토글 실패:`, error);
      
      // 실패시 이전 상태로 복원
      setIsFavorite(previousState);
      
      // 간단한 에러 메시지
      if (error.message?.includes('401') || error.message?.includes('403')) {
        showError('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        showError('즐겨찾기 처리 중 오류가 발생했습니다.');
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

  // 곡 삭제 핸들러
  const handleDeleteSong = async () => {
    if (!songId || isDeleting) return;

    // 로그인 확인
    const token = localStorage.getItem("accessToken") || localStorage.getItem("jwt_token");
    if (!user || !token) {
      showError("로그인이 필요합니다.");
      return;
    }

    // 삭제 확인
    const confirmDelete = window.confirm(
      `정말로 이 곡을 삭제하시겠습니까?\n\n곡명: ${songData?.title || 'Unknown'}\n아티스트: ${songData?.artist || 'Unknown'}\n\n⚠️ 삭제된 데이터는 복구할 수 없습니다.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    
    try {
      console.log(`[🗑️ AlbumDetail] 곡 삭제 요청 - songId: ${songId}`);
      const result = await deleteSong(parseInt(songId));
      console.log(`[🗑️ AlbumDetail] 곡 삭제 API 응답:`, result);
      
      if (result?.success) {
        showSuccess(`곡이 성공적으로 삭제되었습니다.`);
        console.log(`[✅ AlbumDetail] 곡 삭제 완료 - songId: ${songId}`);
        
        // SheetView 페이지로 이동
        setTimeout(() => {
          navigate('/sheet-view');
        }, 1500);
      } else {
        throw new Error(result?.message || '곡 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error(`[❌ AlbumDetail] 곡 삭제 실패:`, error);
      
      // 에러 메시지 처리
      if (error.message?.includes('404')) {
        showError('해당 곡을 찾을 수 없습니다.');
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        showError('삭제 권한이 없습니다. 다시 로그인해주세요.');
      } else {
        showError('곡 삭제 중 오류가 발생했습니다.');
      }
    } finally {
      setIsDeleting(false);
    }
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
          className={`${styles.controlButton} ${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ""} ${favoriteLoading ? styles.loading : ""} ${!user ? styles.disabled : ""}`}
          onClick={handleFavoriteToggle}
          disabled={favoriteLoading || !user}
          title={!user ? "로그인이 필요합니다" : favoriteLoading ? "처리 중..." : isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        >
          {favoriteLoading ? "⏳" : isFavorite ? <FaStar /> : <FaRegStar />}
        </button>

        <button
          className={`${styles.controlButton} ${styles.resetButton}`}
          onClick={handleResetImage}
          title="이미지 원래 크기로 리셋"
        >
          <FaRedo />
        </button>

        <button
          className={`${styles.controlButton} ${styles.sheetTypeButton}`}
          onClick={handleSheetTypeToggle}
          title={sheetType === "tab" ? "계이름 악보로 전환" : "타브 악보로 전환"}
        >
          {sheetType === "tab" ? <FaMusic /> : "TAB" }
        </button>

        <button
          className={`${styles.controlButton} ${styles.deleteButton} ${isDeleting ? styles.loading : ""} ${!user ? styles.disabled : ""}`}
          onClick={handleDeleteSong}
          disabled={isDeleting || !user}
          title={!user ? "로그인이 필요합니다" : isDeleting ? "삭제 중..." : "곡 삭제"}
        >
          {isDeleting ? "⏳" : <FaTrashAlt />}
        </button>
      </div>
    </div>
  );
};

export default AlbumDetail;
