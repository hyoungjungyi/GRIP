import React from "react";
import { useParams } from "react-router-dom";
import styles from "./SheetView.module.css";

const AlbumDetail: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();

  // TODO: 실제 API로 songId에 해당하는 악보/정보 불러오기

  return (
    <div className={styles.container}>
      <h1>Album Detail</h1>
      <p>Song ID: {songId}</p>
      {/* 여기에 악보 및 상세 정보 표시 */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 18, color: "#888" }}>
          악보 및 곡 상세 정보가 여기에 표시됩니다.
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
