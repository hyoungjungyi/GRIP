import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./SheetView.module.css";

const AlbumDetail: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [sheetType, setSheetType] = useState<"tab" | "note">("tab"); // 'tab' 또는 'note'
  const [sheetImageUrl, setSheetImageUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);

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

  return (
    <div className={styles.albumDetailContainer}>
      {/* 악보 이미지 */}
      <div className={styles.sheetImageContainer}>
        {sheetImageUrl && !imageError ? (
          <img
            src={sheetImageUrl}
            alt={`Song ${songId} ${sheetType} sheet music`}
            className={styles.sheetImage}
            onError={handleImageError}
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
