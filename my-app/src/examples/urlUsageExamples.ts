/**
 * 🌐 URL 관리 사용법 예시
 *
 * 이 파일은 환경변수를 통한 URL 관리 기능의 사용법을 보여줍니다.
 * 다른 개발자들이 쉽게 이해하고 사용할 수 있도록 다양한 예시를 제공합니다.
 */

import {
  getBackendApiUrl,
  getFrontendUrl,
  getApiBaseUrl,
  getFrontendBaseUrl,
} from "../utils/apiUtils";
import api from "../api/GG_axiosInstance";

// =============================================================================
// 📋 1. 기본 사용법
// =============================================================================

/**
 * 백엔드 API URL 가져오기
 */
export const getBackendUrlExample = () => {
  const backendUrl = getBackendApiUrl();
  console.log("백엔드 URL:", backendUrl);
  return backendUrl;
};

/**
 * 프론트엔드 URL 가져오기
 */
export const getFrontendUrlExample = () => {
  const frontendUrl = getFrontendUrl();
  console.log("프론트엔드 URL:", frontendUrl);
  return frontendUrl;
};

// =============================================================================
// 📋 2. API 호출 예시
// =============================================================================

/**
 * ✅ 올바른 API 호출 방법
 */
export const correctApiCallExample = async () => {
  try {
    // GG_axiosInstance 사용 (권장)
    const response = await api.get("/api/users");
    console.log("사용자 목록:", response.data);
    return response.data;
  } catch (error) {
    console.error("API 호출 실패:", error);
  }
};

/**
 * ❌ 잘못된 API 호출 방법 (환경변수 직접 사용)
 */
export const incorrectApiCallExample = async () => {
  try {
    // 이 방법은 사용하지 마세요!
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}api/users`
    );
    const data = await response.json();
    console.log("사용자 목록:", data);
    return data;
  } catch (error) {
    console.error("API 호출 실패:", error);
  }
};

// =============================================================================
// 📋 3. 환경별 URL 확인
// =============================================================================

/**
 * 현재 환경의 URL 정보 출력
 */
export const logCurrentEnvironment = () => {
  console.log("=== 🌐 현재 환경 정보 ===");
  console.log("현재 hostname:", window.location.hostname);
  console.log("현재 URL:", window.location.href);
  console.log("백엔드 URL:", getBackendApiUrl());
  console.log("프론트엔드 URL:", getFrontendUrl());
  console.log("========================");
};

// =============================================================================
// 📋 4. 기존 코드와의 호환성
// =============================================================================

/**
 * 기존 함수명 사용 예시 (호환성 유지)
 */
export const compatibilityExample = () => {
  // 새로운 함수명
  const backendUrl1 = getBackendApiUrl();
  const frontendUrl1 = getFrontendUrl();

  // 기존 함수명 (동일한 결과)
  const backendUrl2 = getApiBaseUrl();
  const frontendUrl2 = getFrontendBaseUrl();

  console.log("새 함수명 결과:", backendUrl1, frontendUrl1);
  console.log("기존 함수명 결과:", backendUrl2, frontendUrl2);

  // 결과가 동일함을 확인
  console.log("백엔드 URL 일치:", backendUrl1 === backendUrl2);
  console.log("프론트엔드 URL 일치:", frontendUrl1 === frontendUrl2);
};

// =============================================================================
// 📋 5. 실제 사용 시나리오
// =============================================================================

/**
 * 사용자 프로필 정보 가져오기
 */
export const getUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/api/user-profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("프로필 정보 가져오기 실패:", error);
    throw error;
  }
};

/**
 * 측정 데이터 가져오기
 */
export const getMeasurementData = async (userId: string) => {
  try {
    const response = await api.get(`/getrecentmeasure/${userId}`);
    return response.data;
  } catch (error) {
    console.error("측정 데이터 가져오기 실패:", error);
    throw error;
  }
};

/**
 * 크루 정보 가져오기
 */
export const getCrewData = async (userId: string) => {
  try {
    const [joinResponse, createResponse] = await Promise.all([
      api.get(`/api/crews/getrecentjoin/${userId}`),
      api.get(`/api/crews/getrecentcreate/${userId}`),
    ]);

    return {
      joined: joinResponse.data,
      created: createResponse.data,
    };
  } catch (error) {
    console.error("크루 데이터 가져오기 실패:", error);
    throw error;
  }
};

// =============================================================================
// 📋 6. 디버깅 도구
// =============================================================================

/**
 * URL 선택 과정 디버깅
 */
export const debugUrlSelection = () => {
  console.log("=== 🔍 URL 선택 디버깅 ===");

  // 환경변수 확인
  console.log("REACT_APP_API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
  console.log("REACT_APP_FRONTEND_URL:", process.env.REACT_APP_FRONTEND_URL);

  // URL 파싱 확인
  const backendUrl = getBackendApiUrl();
  const frontendUrl = getFrontendUrl();

  console.log("선택된 백엔드 URL:", backendUrl);
  console.log("선택된 프론트엔드 URL:", frontendUrl);
  console.log("========================");
};

/**
 * 환경변수 유효성 검사
 */
export const validateEnvironmentVariables = () => {
  const issues = [];

  // 백엔드 URL 확인
  if (!process.env.REACT_APP_API_BASE_URL) {
    issues.push("REACT_APP_API_BASE_URL가 설정되지 않았습니다.");
  }

  // 프론트엔드 URL 확인
  if (!process.env.REACT_APP_FRONTEND_URL) {
    issues.push("REACT_APP_FRONTEND_URL가 설정되지 않았습니다.");
  }

  // URL 형식 확인
  if (
    process.env.REACT_APP_API_BASE_URL &&
    !process.env.REACT_APP_API_BASE_URL.includes(",")
  ) {
    console.log("✅ 단일 백엔드 URL 설정됨");
  } else if (process.env.REACT_APP_API_BASE_URL) {
    console.log("✅ 다중 백엔드 URL 설정됨");
  }

  if (issues.length > 0) {
    console.warn("⚠️ 환경변수 문제 발견:", issues);
    return false;
  }

  console.log("✅ 환경변수 설정 완료");
  return true;
};

// =============================================================================
// 📋 7. 사용법 요약
// =============================================================================

/**
 * 📖 사용법 요약
 *
 * 1. 환경변수 설정:
 *    REACT_APP_API_BASE_URL=https://localhost:8080/,https://200.200.200.72:8080/
 *    REACT_APP_FRONTEND_URL=https://localhost:3000/,https://200.200.200.72:3000/
 *
 * 2. API 호출:
 *    import api from './api/GG_axiosInstance';
 *    const response = await api.get('/api/users');
 *
 * 3. URL 가져오기:
 *    import { getBackendApiUrl, getFrontendUrl } from './utils/apiUtils';
 *    const backendUrl = getBackendApiUrl();
 *    const frontendUrl = getFrontendUrl();
 *
 * 4. 디버깅:
 *    브라우저 콘솔에서 URL 선택 과정 확인 가능
 */
export const usageSummary = () => {
  console.log(`
📖 URL 관리 사용법 요약:

1. 환경변수 설정:
   REACT_APP_API_BASE_URL=https://localhost:8080/,https://200.200.200.72:8080/
   REACT_APP_FRONTEND_URL=https://localhost:3000/,https://200.200.200.72:3000/

2. API 호출:
   import api from './api/GG_axiosInstance';
   const response = await api.get('/api/users');

3. URL 가져오기:
   import { getBackendApiUrl, getFrontendUrl } from './utils/apiUtils';
   const backendUrl = getBackendApiUrl();
   const frontendUrl = getFrontendUrl();

4. 디버깅:
   브라우저 콘솔에서 URL 선택 과정 확인 가능
  `);
};
