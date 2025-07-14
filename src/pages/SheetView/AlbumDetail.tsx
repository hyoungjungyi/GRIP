import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./SheetView.module.css";

const AlbumDetail: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [sheetType, setSheetType] = useState<"tab" | "note">("tab"); // 'tab' 또는 'note'
  const [sheetImageUrl, setSheetImageUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  // 이미지 확대/축소 및 이동 상태
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // TODO: 실제 API로 songId에 해당하는 악보/정보 불러오기
  useEffect(() => {
    // 악보 타입에 따라 이미지 경로 설정
    const getSheetImagePath = () => {
      if (!songId) return "";

      const basePath = "/MusicSheets";
      // songId가 0일 때 기본 사진 사용
      if (songId === "0") {
        const suffix = sheetType === "tab" ? "tabs" : "notes";
        return `${basePath}/${suffix}/i-love-you-so-easy-fingerstyle-guitar-${suffix}_orig.webp`;
      }

      // 기본 파일 구조 (향후 다른 곡들을 위해)
      const folder = sheetType === "tab" ? "tabs" : "notes";
      return `${basePath}/${folder}/${songId}.png`;
    };

    setImageError(false); // 새 이미지 로드 시 에러 상태 초기화
    setSheetImageUrl(getSheetImagePath());
  }, [songId, sheetType]); // sheetType 의존성 추가

  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load sheet image: ${sheetImageUrl}`);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // TODO: 서버에 즐겨찾기 상태 저장
    console.log(`Song ${songId} favorite:`, !isFavorite);
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
        {sheetImageUrl && !imageError ? (
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
            악보를 찾을 수 없습니다.
            <br />
            파일 경로: {sheetImageUrl}
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
          }`}
          onClick={handleFavoriteToggle}
          title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
};

export default AlbumDetail;
