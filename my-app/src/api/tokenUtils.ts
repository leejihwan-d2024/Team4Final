import api from "./axiosInstance";

// 토큰 갱신 함수
export const refreshToken = async (): Promise<boolean> => {
  console.log("=== 토큰 갱신 시작 ===");

  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.log("Refresh Token이 없습니다.");
      console.log("================================");
      return false;
    }

    console.log("Refresh Token으로 갱신 요청");
    const response = await api.post("/api/auth/refresh", {
      refreshToken: refreshToken,
    });

    if (response.status === 200) {
      console.log("=== 토큰 갱신 성공 ===");
      const result = response.data;

      if (result.accessToken) {
        localStorage.setItem("token", result.accessToken);
        console.log(
          "새로운 Access Token 저장됨:",
          result.accessToken.substring(0, 20) + "..."
        );
      }

      console.log("================================");
      return true;
    } else {
      console.log("토큰 갱신 실패:", response.status);
      console.log("================================");
      return false;
    }
  } catch (error: any) {
    console.error("=== 토큰 갱신 오류 ===");
    console.error("오류:", error.response?.data || error.message);
    console.error("================================");

    // 토큰 갱신 실패 시 모든 토큰 제거
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    return false;
  }
};

// 토큰 유효성 검사 함수
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("토큰이 없습니다.");
    return false;
  }

  try {
    // JWT 토큰의 만료 시간 확인 (간단한 방식)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    console.log("=== 토큰 유효성 검사 ===");
    console.log("토큰 만료 시간:", new Date(payload.exp * 1000));
    console.log("현재 시간:", new Date(currentTime * 1000));
    console.log("토큰 유효:", payload.exp > currentTime);
    console.log("================================");

    return payload.exp > currentTime;
  } catch (error) {
    console.error("토큰 파싱 오류:", error);
    return false;
  }
};

// 로그아웃 함수
export const logout = (): void => {
  console.log("=== 로그아웃 처리 ===");

  const user = localStorage.getItem("user");
  if (user) {
    const userInfo = JSON.parse(user);
    console.log("로그아웃 사용자:", userInfo.userId);
  }

  // 모든 토큰과 사용자 정보 제거
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // 자동 로그인 설정도 제거
  localStorage.removeItem("autoLoginEnabled");

  console.log("모든 토큰과 사용자 정보 제거됨");
  console.log("자동 로그인 설정 해제됨");
  console.log("================================");
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): any => {
  const user = localStorage.getItem("user");
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

// 토큰 정보 로깅
export const logTokenInfo = (): void => {
  console.log("=== 현재 토큰 정보 ===");

  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const user = localStorage.getItem("user");

  console.log("Access Token:", token ? token.substring(0, 20) + "..." : "없음");
  console.log(
    "Refresh Token:",
    refreshToken ? refreshToken.substring(0, 20) + "..." : "없음"
  );
  console.log("사용자 정보:", user ? JSON.parse(user) : "없음");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("토큰 만료 시간:", new Date(payload.exp * 1000));
      console.log("토큰 발급 시간:", new Date(payload.iat * 1000));
    } catch (error) {
      console.log("토큰 파싱 실패:", error);
    }
  }

  console.log("================================");
};

// 자동 로그인 함수
export const autoLogin = async (): Promise<boolean> => {
  console.log("=== 자동 로그인 시도 ===");

  const token = localStorage.getItem("token");
  const storedRefreshToken = localStorage.getItem("refreshToken");
  const user = localStorage.getItem("user");

  // 토큰이 없으면 자동 로그인 불가
  if (!token || !storedRefreshToken || !user) {
    console.log("저장된 토큰 또는 사용자 정보가 없습니다.");
    console.log("================================");
    return false;
  }

  try {
    // Access Token 유효성 검사
    if (isTokenValid()) {
      console.log("Access Token이 유효합니다. 자동 로그인 성공!");
      console.log("사용자 정보:", JSON.parse(user));
      console.log("================================");
      return true;
    } else {
      console.log(
        "Access Token이 만료되었습니다. Refresh Token으로 갱신 시도..."
      );

      // Refresh Token으로 토큰 갱신
      const success = await refreshToken();
      if (success) {
        console.log("토큰 갱신 성공! 자동 로그인 성공!");
        console.log("================================");
        return true;
      } else {
        console.log("토큰 갱신 실패. 자동 로그인 실패!");
        console.log("================================");
        return false;
      }
    }
  } catch (error) {
    console.error("자동 로그인 중 오류 발생:", error);
    console.log("================================");
    return false;
  }
};

// 자동 로그인 상태 확인 및 처리
export const checkAndHandleAutoLogin = async (): Promise<boolean> => {
  console.log("=== 자동 로그인 상태 확인 ===");

  const isLoggedIn = await autoLogin();

  if (isLoggedIn) {
    console.log("자동 로그인 성공 - 메인 페이지로 이동");
    // 서버에 자동 로그인 확인 요청
    try {
      const response = await api.get("/api/auth/auto-login");
      if (response.status === 200) {
        console.log("서버 자동 로그인 확인 성공");
        return true;
      }
    } catch (error) {
      console.error("서버 자동 로그인 확인 실패:", error);
    }
    return true;
  } else {
    console.log("자동 로그인 실패 - 로그인 페이지 유지");
    // 토큰 정리
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return false;
  }
};
