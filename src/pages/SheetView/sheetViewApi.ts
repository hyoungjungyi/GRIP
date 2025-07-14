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
