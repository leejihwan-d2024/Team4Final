import axios from "axios";

// 환경변수에서 API URL 가져오기
const getBaseURL = () => {
  console.log("=== API URL 설정 정보 ===");
  console.log("REACT_APP_API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
  console.log("================================");

  return process.env.REACT_APP_API_BASE_URL;
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
