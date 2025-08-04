import axios from "axios";

// ✅ 환경별 API URL 설정
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  const localURL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:8080";
  const deployURL =
    process.env.REACT_APP_API_GUEST_URL || "https://200.200.200.62:8080";

  return isLocal ? localURL : deployURL;
};

const baseURL = getBaseURL();
console.log("🌐 API Base URL:", baseURL);

// ✅ Axios 인스턴스 생성
const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000,
});

// ✅ 요청 인터셉터 – 토큰 자동 주입
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터 – 에러 로깅 및 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Axios Error:", error);
    if (error.response?.status === 401) {
      alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
