// 목업 테스트 중이므로 주석 처리
// import {
//   getAuthHeadersForGet,
//   getApiBaseUrl,
// } from "../../../utils/apiUtils";

// const API_BASE_URL = getApiBaseUrl(); // 목업 테스트 중이므로 주석 처리

// 월별 연습 달성 상태 조회 API
export const getMonthlyAchievementStatus = async (year: number, month: number) => {
  try {
    console.log(`📅 Fetching monthly achievement status for ${year}-${month + 1}`);
    
    // 목업 데이터 생성 (테스트용)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mockData: AchievementStatus[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      // 랜덤하게 성공/실패/null 할당
      const random = Math.random();
      if (random < 0.4) {
        mockData.push('success');
      } else if (random < 0.7) {
        mockData.push('failure');
      } else {
        mockData.push(null);
      }
    }
    
    // 특정 날짜에 고정 데이터 설정 (테스트용)
    if (daysInMonth >= 15) {
      mockData[0] = 'success';   // 1일 - 성공
      mockData[1] = 'failure';   // 2일 - 실패
      mockData[2] = null;        // 3일 - 기록 없음
      mockData[4] = 'success';   // 5일 - 성공
      mockData[6] = 'failure';   // 7일 - 실패
      mockData[9] = 'success';   // 10일 - 성공
      mockData[14] = 'success';  // 15일 - 성공
    }
    
    const result = {
      year,
      month: month + 1,
      daily_status: mockData
    };
    
    console.log("✅ Get monthly achievement status response (MOCK):", result);
    return result;
    
    /* 실제 API 호출 코드 (주석 처리)
    const response = await fetch(
      `${API_BASE_URL}/api/practice/monthly-status?year=${year}&month=${month + 1}`,
      {
        method: "GET",
        headers: getAuthHeadersForGet(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Get monthly achievement status response:", result);
    return result;
    */
  } catch (error) {
    console.error("❌ Failed to fetch monthly achievement status:", error);
    // 에러 시 빈 배열 반환 (UI 깨짐 방지)
    return { year, month: month + 1, daily_status: [] };
  }
};

// 월별 달성 상태 타입 정의
export type AchievementStatus = 'success' | 'failure' | null;

export interface MonthlyStatusResponse {
  year: number;
  month: number;
  daily_status: AchievementStatus[]; // 배열 길이는 해당 월의 일수와 동일
}
