// API 공통 유틸리티 함수들

// 인증 헤더 생성 함수
export const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };
};

// GET 요청용 인증 헤더 (Content-Type 제외)
export const getAuthHeadersForGet = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };
};

// API Base URL 가져오기
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL;
};

// 공통 에러 처리 함수
export const handleApiError = (error: any, context: string) => {
  console.error(`❌ ${context}:`, error);

  // 401 Unauthorized 에러 처리
  if (error.status === 401) {
    console.warn("🔑 Authentication failed. Redirecting to login...");
    localStorage.removeItem("accessToken");
    // TODO: 로그인 페이지로 리다이렉트 또는 로그인 모달 표시
  }

  throw error;
};
