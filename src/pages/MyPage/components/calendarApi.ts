import {
  getAuthHeadersForGet,
  getApiBaseUrl,
} from "../../../utils/apiUtils";

const API_BASE_URL = getApiBaseUrl();

// 월별 연습 달성 상태 조회 API
export const getMonthlyAchievementStatus = async (year: number, month: number) => {
  try {
    console.log(`📅 Fetching monthly achievement status for ${year}-${month + 1}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/practice/monthly-status?year=${year}&month=${month + 1}`,
      {
        method: "GET",
        headers: getAuthHeadersForGet(),
      }
    );

    if (!response.ok) {
      console.error(`❌ Monthly status API error: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Get monthly achievement status response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to fetch monthly achievement status:", error);
    // 에러 시 빈 배열 반환 (UI 깨짐 방지)
    return { year, month: month + 1, daily_status: [] };
  }
};

// 특정 날짜의 연습 상세 데이터 조회 API
export const getPracticeHistoryByDate = async (date: string) => {
  try {
    console.log(`📅 Fetching practice history for date: ${date}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/practice/history?date=${date}`,
      {
        method: "GET",
        headers: getAuthHeadersForGet(),
      }
    );

    if (!response.ok) {
      console.error(`❌ Practice history API error: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Get practice history response:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to fetch practice history:", error);
    throw error;
  }
};

// 월별 달성 상태 타입 정의
export type AchievementStatus = 'success' | 'failure' | null;

export interface MonthlyStatusResponse {
  year: number;
  month: number;
  daily_status: AchievementStatus[]; // 배열 길이는 해당 월의 일수와 동일
}

// 연습 데이터 인터페이스
export interface PracticeData {
  date: string;
  total_time: number;
  achieved: boolean;
  recording_url?: string;
  chromatic?: Array<{
    fingering: string;
    bpm: number;
    duration: number;
  }>;
}
