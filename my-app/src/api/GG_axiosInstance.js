import axios from "axios";

console.log("API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
console.log("FRONTEND_URL:", process.env.REACT_APP_FRONTEND_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    console.log("=== API 요청 시작 ===");
    console.log("URL:", config.url);
    console.log("Method:", config.method?.toUpperCase());
    console.log("Base URL:", config.baseURL);

    // Authorization 헤더에 토큰 추가
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("토큰 추가됨:", token.substring(0, 20) + "...");
    } else {
      console.log("토큰 없음");
    }

    console.log("요청 데이터:", config.data);
    console.log("================================");
    return config;
  },
  (error) => {
    console.error("=== API 요청 오류 ===");
    console.error("오류:", error);
    console.error("================================");
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 관련 응답 처리
api.interceptors.response.use(
  (response) => {
    console.log("=== API 응답 성공 ===");
    console.log("URL:", response.config.url);
    console.log("Status:", response.status);

    // 로그인 응답에서 토큰 처리
    if (response.config.url?.includes("/api/auth/login") && response.data) {
      console.log("=== 로그인 응답 토큰 처리 ===");
      if (response.data.accessToken) {
        console.log(
          "Access Token 받음:",
          response.data.accessToken.substring(0, 20) + "..."
        );
        localStorage.setItem("token", response.data.accessToken);
      }
      if (response.data.refreshToken) {
        console.log(
          "Refresh Token 받음:",
          response.data.refreshToken.substring(0, 20) + "..."
        );
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
      console.log(
        "사용자 정보:",
        response.data.username || response.data.userId
      );
      console.log("================================");
    }

    // 토큰 갱신 응답 처리
    if (response.config.url?.includes("/api/auth/refresh") && response.data) {
      console.log("=== 토큰 갱신 응답 처리 ===");
      if (response.data.accessToken) {
        console.log(
          "새로운 Access Token 받음:",
          response.data.accessToken.substring(0, 20) + "..."
        );
        localStorage.setItem("token", response.data.accessToken);
      }
      console.log("================================");
    }

    console.log("응답 데이터:", response.data);
    console.log("================================");
    return response;
  },
  (error) => {
    console.error("=== API 응답 오류 ===");
    console.error("URL:", error.config?.url);
    console.error("Status:", error.response?.status);
    console.error("오류 메시지:", error.response?.data);

    // 401 오류 시 토큰 갱신 시도
    if (error.response?.status === 401) {
      console.log("=== 401 오류 - 토큰 갱신 시도 ===");
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        console.log("Refresh Token으로 갱신 시도");

        // 토큰 갱신 요청 (Promise 체인 사용)
        axios
          .post(
            `${
              process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"
            }/api/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          )
          .then((refreshResponse) => {
            if (refreshResponse.status === 200) {
              console.log("토큰 갱신 성공");
              localStorage.setItem("token", refreshResponse.data.accessToken);

              // 원래 요청 재시도
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
              return axios(originalRequest);
            }
          })
          .catch((refreshError) => {
            console.log("토큰 갱신 실패:", refreshError);
            // 토큰 갱신 실패 시 로그인 페이지로 이동
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
          });
      } else {
        console.log("Refresh Token 없음 - 로그인 페이지로 이동");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      console.log("================================");
    }

    console.error("================================");
    return Promise.reject(error);
  }
);

export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

export default api;
