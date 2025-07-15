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

    console.log("🔍 즐겨찾기 추가 응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Add to saved songs HTTP error:",
        response.status,
        errorText
      );

      // 409 (Conflict) - 이미 추가된 경우, 성공으로 처리
      if (response.status === 409) {
        console.log("⚠️ 이미 즐겨찾기에 추가된 곡 - 성공으로 처리");
        return { success: true, message: "이미 즐겨찾기에 추가된 곡입니다." };
      }

      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(
      "✅ Add to saved songs response:",
      JSON.stringify(result, null, 2)
    );

    // 서버 응답 형태: { success: true, message: string, data: {...} }
    if (result?.success === true) {
      return { success: true, ...result };
    } else {
      console.error(
        "❌ Add to saved songs API returned success=false:",
        result
      );
      throw new Error(result?.message || "API 응답에서 success가 false입니다.");
    }
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

    console.log("🔍 즐겨찾기 제거 응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Remove from saved songs HTTP error:",
        response.status,
        errorText
      );

      // 404 - 이미 제거된 경우, 성공으로 처리
      if (response.status === 404) {
        console.log("⚠️ 이미 즐겨찾기에서 제거된 곡 - 성공으로 처리");
        return { success: true, message: "이미 즐겨찾기에서 제거된 곡입니다." };
      }

      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(
      "✅ Remove from saved songs response:",
      JSON.stringify(result, null, 2)
    );

    // 서버 응답 형태: { success: true, message: string }
    if (result?.success === true) {
      return { success: true, ...result };
    } else {
      console.error(
        "❌ Remove from saved songs API returned success=false:",
        result
      );
      throw new Error(result?.message || "API 응답에서 success가 false입니다.");
    }
  } catch (error) {
    console.error("❌ Failed to remove from saved songs:", error);
    throw error;
  }
};

// 즐겨찾기 상태 확인 API
export const checkSavedSongStatus = async (songId: number) => {
  try {
    console.log("⭐ 즐겨찾기 상태 확인:", songId);

    const response = await fetch(
      `${API_BASE_URL}/api/songs/saved/status/${songId}`,
      {
        method: "GET",
        headers: getAuthHeadersForGet(),
      }
    );

    console.log("🔍 즐겨찾기 상태 확인 응답 상태:", response.status);

    if (!response.ok) {
      console.error("❌ 즐겨찾기 상태 확인 HTTP 오류:", response.status);

      // 401/403 등 인증 오류인 경우 로그인되지 않은 것으로 간주
      if (response.status === 401 || response.status === 403) {
        console.log("🔒 인증 오류 - 즐겨찾기 상태 false로 반환");
        return { success: true, isSaved: false };
      }

      // 기타 오류도 false로 처리
      return { success: true, isSaved: false };
    }

    const result = await response.json();
    console.log("✅ 즐겨찾기 상태 원본 결과:", JSON.stringify(result, null, 2));

    // 서버 응답 형태에 맞춘 처리
    // 서버에서 { success: true, isSaved: boolean, savedId: number|null, savedAt: string|null } 형태로 응답
    let isSaved = false;

    if (result?.success === true) {
      // 서버에서 명시적으로 isSaved 필드를 제공
      isSaved = Boolean(result.isSaved);
      console.log(
        "📍 서버 응답 기반 isSaved:",
        result.isSaved,
        "→ Boolean:",
        isSaved
      );
    } else {
      console.log("📍 서버 응답에서 success가 true가 아님 - false로 설정");
    }

    console.log(`🎯 최종 즐겨찾기 상태: isSaved=${isSaved}`);

    return { success: true, isSaved };
  } catch (error) {
    console.error("❌ 즐겨찾기 상태 확인 실패:", error);
    // 네트워크 오류 등의 경우에도 false로 처리
    return { success: true, isSaved: false };
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
