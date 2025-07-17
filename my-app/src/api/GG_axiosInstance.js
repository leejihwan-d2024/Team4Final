import axios from "axios";

// 환경별 API URL 설정
const getBaseURL = () => {
  // 현재 호스트에 따라 자동 감지
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  console.log("=== API URL 설정 정보 ===");
  console.log("현재 hostname:", hostname);
  console.log("isLocalhost:", isLocalhost);
  console.log("REACT_APP_API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
  console.log("REACT_APP_API_GUEST_URL:", process.env.REACT_APP_API_GUEST_URL);
  console.log("================================");

  if (isLocalhost) {
    // localhost 환경에서는 REACT_APP_API_BASE_URL 사용
    const localhostURL =
      process.env.REACT_APP_API_BASE_URL || "https://localhost:8080";
    console.log("localhost 환경 - API URL:", localhostURL);
    return localhostURL;
  } else {
    // 외부 환경에서는 REACT_APP_API_GUEST_URL 사용
    const externalURL =
      process.env.REACT_APP_API_GUEST_URL || "https://200.200.200.72:8080";
    console.log("외부 환경 - API URL:", externalURL);
    return externalURL;
  }
};

const baseURL = getBaseURL();
console.log("최종 설정된 API URL:", baseURL);

// 전역 변수로 설정하여 다른 파일에서도 접근 가능하도록 함
window.REACT_APP_CURRENT_API_URL = baseURL;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

export default api;
