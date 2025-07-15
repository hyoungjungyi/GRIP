import {
  getAuthHeaders,
  getAuthHeadersForGet,
  getApiBaseUrl,
} from "../../utils/apiUtils";

const API_BASE_URL = getApiBaseUrl();

// 크로매틱 연습 총량 저장 API
export const saveChromaticPracticeToServer = async (practiceData: {
  date: string;
  totalPracticeTime: number;
  details: Array<{
    fingering: string;
    bpm: number;
    practiceTime: number;
  }>;
}) => {
  try {
    console.log("📤 Saving chromatic practice to server:", practiceData);
    const response = await fetch(
      `${API_BASE_URL}/api/metronome/chromatic/total`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(practiceData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Save chromatic practice response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to save chromatic practice to server:", error);
    throw error;
  }
};

// 크로매틱 연습 기록 삭제 API
export const deleteChromaticPracticeFromServer = async (practiceId: number) => {
  try {
    console.log("🗑️ Deleting chromatic practice from server:", practiceId);
    const response = await fetch(
      `${API_BASE_URL}/api/practice/chromatic/${practiceId}`,
      {
        method: "DELETE",
        headers: getAuthHeadersForGet(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Delete chromatic practice response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to delete chromatic practice from server:", error);
    throw error;
  }
};

// 최근 크로매틱 연습 프리셋 조회 API
export const getLastChromaticPreset = async () => {
  try {
    console.log("📊 Getting last chromatic preset");
    const response = await fetch(`${API_BASE_URL}/api/metronome/last`, {
      method: "GET",
      headers: getAuthHeadersForGet(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("ℹ️ No previous chromatic preset found");
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Get last chromatic preset response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to get last chromatic preset:", error);
    return null; // 에러 시 null 반환하여 기본 동작 유지
  }
};
