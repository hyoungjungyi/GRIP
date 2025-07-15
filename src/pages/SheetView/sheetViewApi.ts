import {
  getAuthHeaders,
  getAuthHeadersForGet,
  getApiBaseUrl,
} from "../../utils/apiUtils";

const API_BASE_URL = getApiBaseUrl();

// 모든 악보 목록 조회 API
export const getAllSongLists = async () => {
  try {
    console.log("📋 Fetching all song lists");
    const response = await fetch(`${API_BASE_URL}/api/songs/all-lists`, {
      method: "GET",
      headers: getAuthHeadersForGet(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Get all song lists response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to fetch all song lists:", error);
    throw error;
  }
};

// 탭 생성 API
export const generateTabFromAudio = async (audioUrl: string) => {
  try {
    console.log("🎵 Generating tab from audio URL:", audioUrl);
    const response = await fetch(`${API_BASE_URL}/api/songs/tab-generator`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ audio_url: audioUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Generate tab response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to generate tab from audio:", error);
    throw error;
  }
};

// 악보 업로드 API
export const uploadSheet = async (data: {
  title: string;
  artist: string;
  cover: File;
  noteSheet: File;
  tabSheet: File;
}) => {
  try {
    console.log("📤 Uploading sheet:", data.title);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("artist", data.artist);
    formData.append("cover", data.cover);
    formData.append("noteSheet", data.noteSheet);
    formData.append("tabSheet", data.tabSheet);

    const response = await fetch(`${API_BASE_URL}/api/songs/upload-sheet`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("accessToken")
          ? `Bearer ${localStorage.getItem("accessToken")}`
          : "",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Upload sheet response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to upload sheet:", error);
    throw error;
  }
};

// 악보 이미지 조회 API
export const getSheetImage = async (songId: string) => {
  try {
    console.log("🎼 Fetching sheet image for songId:", songId);
    const response = await fetch(`${API_BASE_URL}/api/songs/sheet/${songId}`, {
      method: "GET",
      headers: getAuthHeadersForGet(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Get sheet image response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to fetch sheet image:", error);
    throw error;
  }
};

// 즐겨찾기 추가 API
export const addToSavedSongs = async (songId: number) => {
  try {
    console.log("⭐ Adding to saved songs:", songId);
    const response = await fetch(`${API_BASE_URL}/api/songs/saved`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ songId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Add to saved songs response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to add to saved songs:", error);
    throw error;
  }
};

// 즐겨찾기 제거 API
export const removeFromSavedSongs = async (songId: number) => {
  try {
    console.log("⭐ Removing from saved songs:", songId);
    const response = await fetch(`${API_BASE_URL}/api/songs/saved/${songId}`, {
      method: "DELETE",
      headers: getAuthHeadersForGet(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Remove from saved songs response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to remove from saved songs:", error);
    throw error;
  }
};

// 즐겨찾기 상태 확인 API
export const checkSavedSongStatus = async (songId: number) => {
  try {
    console.log("⭐ 즐겨찾기 상태 확인:", songId);
    
    const response = await fetch(`${API_BASE_URL}/api/songs/saved/status/${songId}`, {
      method: "GET",
      headers: getAuthHeadersForGet(),
    });

    if (!response.ok) {
      console.error("❌ API 응답 오류:", response.status);
      return { success: false, isSaved: false };
    }

    const result = await response.json();
    console.log("✅ 즐겨찾기 상태 결과:", result);
    
    return result;
  } catch (error) {
    console.error("❌ 즐겨찾기 상태 확인 실패:", error);
    return { success: false, isSaved: false };
  }
};

// 즐겨찾기 목록 조회 API
export const getSavedSongs = async () => {
  try {
    console.log("⭐ Fetching saved songs list");
    const response = await fetch(`${API_BASE_URL}/api/songs/saved`, {
      method: "GET",
      headers: getAuthHeadersForGet(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Get saved songs response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to get saved songs:", error);
    throw error;
  }
};
