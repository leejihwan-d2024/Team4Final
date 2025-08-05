/**
 * API URL 관리 유틸리티
 *
 * 이 파일은 환경변수에서 쉼표로 구분된 URL 목록을 파싱하여
 * 현재 접속한 hostname에 맞는 서버 URL을 반환하는 함수들을 제공합니다.
 *
 * 📋 사용법:
 *
 * 1. 백엔드 API 서버 URL 가져오기:
 *    import { getBackendApiUrl } from './utils/apiUtils';
 *    const apiUrl = getBackendApiUrl();
 *
 * 2. 프론트엔드 서버 URL 가져오기:
 *    import { getFrontendUrl } from './utils/apiUtils';
 *    const frontendUrl = getFrontendUrl();
 *
 * 🔧 환경변수 설정:
 *
 * # 백엔드 API 서버들 (포트 8080)
 * REACT_APP_API_BASE_URL=https://localhost:8080/,https://200.200.200.62:8080/,https://200.200.200.72:8080/
 *
 * # 프론트엔드 서버들 (포트 3000)
 * REACT_APP_FRONTEND_URL=https://localhost:3000/,https://200.200.200.62:3000/,https://200.200.200.72:3000/
 *
 * 🎯 동작 원리:
 * 1. 현재 접속한 hostname 확인
 * 2. localhost인 경우: 첫 번째 URL 사용
 * 3. 외부 IP인 경우: hostname과 매칭되는 URL 찾기
 * 4. 매칭되는 URL이 없으면: 첫 번째 URL을 기본값으로 사용
 *
 * @author 개발팀
 * @version 1.0.0
 */

/**
 * 백엔드 API 서버 URL을 가져오는 함수
 *
 * 환경변수 REACT_APP_API_BASE_URL에서 쉼표로 구분된 URL 목록을 파싱하여
 * 현재 접속한 hostname에 맞는 백엔드 서버 URL을 반환합니다.
 *
 * 사용법:
 * const apiUrl = getBackendApiUrl();
 *
 * 환경변수 설정 예시:
 * REACT_APP_API_BASE_URL=https://localhost:8080/,https://200.200.200.62:8080/,https://200.200.200.72:8080/
 *
 * @returns {string} 백엔드 API 서버 URL
 */
export const getBackendApiUrl = (): string => {
  const currentHostname = window.location.hostname;
  console.log("🔧 현재 hostname:", currentHostname);

  // 1. 환경변수 확인
  const apiBaseUrlEnv = process.env.REACT_APP_API_BASE_URL;
  console.log("🔧 환경변수 REACT_APP_API_BASE_URL:", apiBaseUrlEnv);

  if (!apiBaseUrlEnv) {
    console.warn("⚠️ REACT_APP_API_BASE_URL 환경변수가 설정되지 않았습니다.");
    return "https://localhost:8080/";
  }

  // 2. 쉼표로 구분된 URL들을 배열로 변환
  const apiUrls = apiBaseUrlEnv
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  console.log("🔧 파싱된 백엔드 API URL 목록:", apiUrls);

  if (apiUrls.length === 0) {
    console.warn("⚠️ 유효한 백엔드 API URL이 없습니다.");
    return "https://localhost:8080/";
  }

  // 3. localhost 환경 처리
  if (currentHostname === "localhost" || currentHostname === "127.0.0.1") {
    const selectedUrl = apiUrls[0]; // 첫 번째 URL 사용 (보통 localhost)
    console.log("✅ localhost 환경 - 선택된 백엔드 URL:", selectedUrl);
    return selectedUrl;
  }

  // 4. 외부 IP 환경 처리 - 현재 hostname과 매칭되는 URL 찾기
  const matchingURL = apiUrls.find((url) => {
    const urlHostname = new URL(url).hostname;
    const isMatch = urlHostname === currentHostname;
    console.log(
      `🔍 백엔드 URL ${url} (${urlHostname}) vs 현재 ${currentHostname} → ${
        isMatch ? "매칭" : "불일치"
      }`
    );
    return isMatch;
  });

  if (matchingURL) {
    console.log("✅ 매칭되는 백엔드 URL 발견:", matchingURL);
    return matchingURL;
  } else {
    console.log("⚠️ 매칭되는 백엔드 URL이 없어 첫 번째 URL 사용:", apiUrls[0]);
    return apiUrls[0];
  }
};

// 기존 함수명과의 호환성을 위한 별칭
export const getApiBaseUrl = getBackendApiUrl;

/**
 * 프론트엔드 서버 URL을 가져오는 함수
 *
 * 환경변수 REACT_APP_FRONTEND_URL에서 쉼표로 구분된 URL 목록을 파싱하여
 * 현재 접속한 hostname에 맞는 프론트엔드 서버 URL을 반환합니다.
 *
 * 사용법:
 * const frontendUrl = getFrontendUrl();
 *
 * 환경변수 설정 예시:
 * REACT_APP_FRONTEND_URL=https://localhost:3000/,https://200.200.200.62:3000/,https://200.200.200.72:3000/
 *
 * @returns {string} 프론트엔드 서버 URL
 */
export const getFrontendUrl = (): string => {
  const currentHostname = window.location.hostname;
  console.log("🌐 현재 hostname (프론트엔드):", currentHostname);

  // 1. 환경변수 확인
  const frontendUrlEnv = process.env.REACT_APP_FRONTEND_URL;
  console.log("🌐 환경변수 REACT_APP_FRONTEND_URL:", frontendUrlEnv);

  if (!frontendUrlEnv) {
    console.warn("⚠️ REACT_APP_FRONTEND_URL 환경변수가 설정되지 않았습니다.");
    return "https://localhost:3000/";
  }

  // 2. 쉼표로 구분된 URL들을 배열로 변환
  const frontendUrls = frontendUrlEnv
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  console.log("🌐 파싱된 프론트엔드 URL 목록:", frontendUrls);

  if (frontendUrls.length === 0) {
    console.warn("⚠️ 유효한 프론트엔드 URL이 없습니다.");
    return "https://localhost:3000/";
  }

  // 3. localhost 환경 처리
  if (currentHostname === "localhost" || currentHostname === "127.0.0.1") {
    const selectedUrl = frontendUrls[0]; // 첫 번째 URL 사용 (보통 localhost)
    console.log("✅ localhost 환경 - 선택된 프론트엔드 URL:", selectedUrl);
    return selectedUrl;
  }

  // 4. 외부 IP 환경 처리 - 현재 hostname과 매칭되는 URL 찾기
  const matchingURL = frontendUrls.find((url) => {
    const urlHostname = new URL(url).hostname;
    const isMatch = urlHostname === currentHostname;
    console.log(
      `🔍 프론트엔드 URL ${url} (${urlHostname}) vs 현재 ${currentHostname} → ${
        isMatch ? "매칭" : "불일치"
      }`
    );
    return isMatch;
  });

  if (matchingURL) {
    console.log("✅ 매칭되는 프론트엔드 URL 발견:", matchingURL);
    return matchingURL;
  } else {
    console.log(
      "⚠️ 매칭되는 프론트엔드 URL이 없어 첫 번째 URL 사용:",
      frontendUrls[0]
    );
    return frontendUrls[0];
  }
};

// 기존 함수명과의 호환성을 위한 별칭
export const getFrontendBaseUrl = getFrontendUrl;
