import axios from "axios";

// 환경별 API URL 설정 함수
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  console.log("=== API URL 설정 정보 ===");
  console.log("현재 hostname:", hostname);
  console.log("isLocalhost:", isLocalhost);
  console.log("REACT_APP_API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
  console.log("REACT_APP_API_GUEST_URL:", process.env.REACT_APP_API_GUEST_URL);
  console.log("================================");

  if (isLocalhost) {
    const localhostURL =
      process.env.REACT_APP_API_BASE_URL || "https://localhost:8080";
    console.log("localhost 환경 - API URL:", localhostURL);
    return localhostURL;
  } else {
    const externalURL =
      process.env.REACT_APP_API_GUEST_URL || "https://200.200.200.72:8080";
    console.log("외부 환경 - API URL:", externalURL);
    return externalURL;
  }
};

const baseURL = getBaseURL();
console.log("최종 설정된 API URL:", baseURL);

const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// 요청 인터셉터: 모든 요청에 accessToken 자동 첨부
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log(`Bearer ${accessToken}`);
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
