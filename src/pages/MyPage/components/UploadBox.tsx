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
    // TODO: Upload file to server
    alert(`File uploaded: ${selectedFile.name}`);
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
          <span className={styles.uploadTitle}>Upload File</span>
          <span className={styles.uploadDesc}>
            Click here or <b>drag</b> to upload a video/audio file
          </span>
        </div>
      </div>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <div className={styles.popupHeader}>
              <span>Upload File</span>
              <button className={styles.popupClose} onClick={handleClose}>
                X
              </button>
            </div>
            <input
              type="file"
              accept="video/*,audio/*"
              ref={inputRef}
              style={{ margin: "18px 0" }}
              onChange={handleFileChange}
            />
            {selectedFile && (
              <div style={{ marginBottom: 8 }}>
                Selected: {selectedFile.name}
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className={styles.uploadBtn}
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                Upload
              </button>
              <button className={styles.uploadBtn} onClick={handleClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadBox;
