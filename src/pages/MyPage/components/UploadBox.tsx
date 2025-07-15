import React, { useRef, useState, useEffect } from "react";
import styles from "./UploadBox.module.css";
import { useUser } from "../../../components/Navbar/UserContext";

const UploadBox: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [songTitle, setSongTitle] = useState("");
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  // 기존 제목 리스트 가져오기
  const fetchExistingTitles = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsLoadingTitles(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/files/titles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setExistingTitles(result.data.titles || []);
        console.log("[📋 Titles Loaded]", result.data.titles);
      }
    } catch (error) {
      console.error("[❌ Titles Loading Error]", error);
    } finally {
      setIsLoadingTitles(false);
    }
  };

  const handleBoxClick = () => {
    setShowPopup(true);
    fetchExistingTitles(); // 팝업 열릴 때 기존 제목들 로드
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !songTitle.trim()) {
      alert("파일과 노래 제목을 모두 입력해주세요.");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsUploading(true);

    try {
      // 토큰 확인 - accessToken 키 사용
      const token = localStorage.getItem("accessToken");
      console.log("[🔐 Token Debug]", {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : "없음",
        userInfo: user,
        allStorageKeys: Object.keys(localStorage),
      });

      if (!token) {
        alert("로그인 토큰이 없습니다. 다시 로그인해주세요.");
        return;
      }
      // 파일 타입 확인 (오디오 vs 비디오)
      const isAudio = selectedFile.type.startsWith("audio/");
      const isVideo = selectedFile.type.startsWith("video/");

      if (!isAudio && !isVideo) {
        alert("오디오 또는 비디오 파일만 업로드 가능합니다.");
        return;
      }

      // API 엔드포인트 결정
      const endpoint = isAudio
        ? "/api/files/upload-audio"
        : "/api/files/upload-video";
      const fileFieldName = isAudio ? "audio" : "video";

      // FormData 생성
      const formData = new FormData();
      formData.append(fileFieldName, selectedFile);
      formData.append("songTitle", songTitle.trim());

      console.log("[📤 Upload Request]", {
        endpoint: `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        songTitle: songTitle.trim(),
        fileFieldName,
      });

      // API 요청
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log("[📨 Response]", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[❌ Upload Error]", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData.message || `업로드 실패: ${response.status}`);
      }

      const result = await response.json();

      alert(
        `${isAudio ? "오디오" : "비디오"} 파일이 성공적으로 업로드되었습니다!`
      );
      console.log("업로드 성공:", result);

      // 상태 초기화
      setShowPopup(false);
      setSelectedFile(null);
      setSongTitle("");
    } catch (error) {
      console.error("업로드 오류:", error);
      alert(
        `업로드 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    setSelectedFile(null);
    setSongTitle("");
    setExistingTitles([]);
    setShowTitleDropdown(false);
    setIsUploading(false);
  };

  // 제목 선택 핸들러
  const handleTitleSelect = (title: string) => {
    setSongTitle(title);
    setShowTitleDropdown(false);
  };

  // 제목 입력 핸들러
  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSongTitle(e.target.value);
    setShowTitleDropdown(
      e.target.value.length > 0 && existingTitles.length > 0
    );
  };

  // 제목 필터링
  const filteredTitles = existingTitles.filter((title) =>
    title.toLowerCase().includes(songTitle.toLowerCase())
  );

  // 외부 클릭 감지로 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const titleInput = titleInputRef.current;
      const dropdown = dropdownRef.current;
      
      // 제목 입력 필드나 드롭다운 영역 클릭이 아닌 경우에만 닫기
      if (titleInput && !titleInput.contains(target) && 
          dropdown && !dropdown.contains(target)) {
        setShowTitleDropdown(false);
      }
    };

    if (showTitleDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTitleDropdown]);

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
      fetchExistingTitles(); // 드롭 시에도 기존 제목들 로드
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

            {/* 파일 선택 */}
            <input
              type="file"
              accept="video/*,audio/*"
              ref={inputRef}
              style={{ margin: "18px 0" }}
              onChange={handleFileChange}
            />

            {selectedFile && (
              <div style={{ marginBottom: 12 }}>
                <strong>선택된 파일:</strong> {selectedFile.name}
                <br />
                <small style={{ color: "#666" }}>
                  타입: {selectedFile.type} | 크기:{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </small>
              </div>
            )}

            {/* 노래 제목 입력 */}
            <div style={{ marginBottom: 16, position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                노래 제목:
                {isLoadingTitles && (
                  <span
                    style={{ fontSize: "12px", color: "#666", marginLeft: 8 }}
                  >
                    (기존 제목 로딩 중...)
                  </span>
                )}
                {existingTitles.length > 0 && (
                  <span
                    style={{ fontSize: "12px", color: "#666", marginLeft: 8 }}
                  >
                    (기존 제목 {existingTitles.length}개 available)
                  </span>
                )}
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={songTitle}
                onChange={handleTitleInputChange}
                onFocus={() => setShowTitleDropdown(existingTitles.length > 0)}
                placeholder={
                  existingTitles.length > 0
                    ? "기존 제목 선택 또는 새로 입력하세요"
                    : "노래 제목을 입력하세요"
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                disabled={isUploading}
              />

              {/* 제목 드롭다운 */}
              {showTitleDropdown && filteredTitles.length > 0 && (
                <div
                  ref={dropdownRef}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderTop: "none",
                    borderRadius: "0 0 4px 4px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {filteredTitles.map((title, index) => (
                    <div
                      key={index}
                      onMouseDown={(e) => {
                        e.preventDefault(); // 포커스 유지
                        e.stopPropagation(); // 이벤트 전파 방지
                        handleTitleSelect(title);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTitleSelect(title);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom:
                          index < filteredTitles.length - 1
                            ? "1px solid #eee"
                            : "none",
                        backgroundColor: "white",
                        fontSize: "14px",
                        userSelect: "none", // 텍스트 선택 방지
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      {title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className={styles.uploadBtn}
                onClick={handleUpload}
                disabled={!selectedFile || !songTitle.trim() || isUploading}
                style={{
                  opacity:
                    !selectedFile || !songTitle.trim() || isUploading ? 0.6 : 1,
                  cursor:
                    !selectedFile || !songTitle.trim() || isUploading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isUploading ? "업로드 중..." : "Upload"}
              </button>
              <button
                className={styles.uploadBtn}
                onClick={handleClose}
                disabled={isUploading}
              >
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
