import React, { useRef, useState } from "react";
import styles from "./UploadBox.module.css";

const UploadBox: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBoxClick = () => {
    setShowPopup(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    // TODO: 서버로 파일 업로드 처리
    alert(`파일 업로드: ${selectedFile.name}`);
    setShowPopup(false);
    setSelectedFile(null);
  };

  const handleClose = () => {
    setShowPopup(false);
    setSelectedFile(null);
  };

  // 드래그 앤 드롭 이벤트
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setShowPopup(true);
    }
  };

  return (
    <>
      <div
        className={`${styles.uploadBox} ${isDragOver ? styles.dragOver : ""}`}
        onClick={handleBoxClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.uploadIcon}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#fff" />
            <path
              d="M24 34V18"
              stroke="#1976d2"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M18 24L24 18L30 24"
              stroke="#1976d2"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="12" y="34" width="24" height="4" rx="2" fill="#1976d2" />
          </svg>
        </div>
        <div className={styles.uploadText}>
          <span className={styles.uploadTitle}>파일 업로드</span>
          <span className={styles.uploadDesc}>
            여기를 클릭하거나 <b>드래그</b>하여 영상/음원 파일을 업로드하세요
          </span>
        </div>
      </div>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <div className={styles.popupHeader}>
              <span>파일 업로드</span>
              <button className={styles.popupClose} onClick={handleClose}>
                X
              </button>
            </div>
            <input
              type="file"
              accept="video/*,audio/*"
              ref={inputRef}
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            {selectedFile && (
              <div className={styles.fileInfo}>
                선택된 파일: {selectedFile.name}
              </div>
            )}
            <div className={styles.buttonRow}>
              <button
                className={styles.uploadBtn}
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                업로드
              </button>
              <button className={styles.uploadBtn} onClick={handleClose}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadBox;
