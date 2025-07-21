import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/GG_axiosInstance";
import "./login.css";

// 타입 정의
interface LoginRequest {
  username: string;
  password: string;
  // deviceInfo는 백엔드에서 자동 생성하므로 제외
}

interface LoginResponse {
  username?: string;
  userId?: string;
  name?: string;
  userNn?: string;
  email?: string;
  userEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

interface KakaoUserInfo {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
  properties?: {
    nickname?: string;
    profile_image?: string;
  };
}

interface KakaoAuthResponse {
  access_token: string;
}

interface KakaoLoginRequest {
  accessToken: string;
  userInfo: {
    id: number;
    email?: string;
    nickname?: string;
    profileImage?: string;
  };
  // deviceInfo는 백엔드에서 자동 생성하므로 제외
}

interface KakaoLoginResponse {
  userId?: string;
  username?: string;
  name?: string;
  userNn?: string;
  email?: string;
  userEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

// Kakao SDK 타입 확장
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        login: (options: {
          throughTalk?: boolean;
          persistAccessToken?: boolean;
          success: (response: KakaoAuthResponse) => void;
          fail: (error: any) => void;
        }) => void;
      };
      API: {
        request: (options: {
          url: string;
          success: (response: KakaoUserInfo) => void;
          fail: (error: any) => void;
        }) => void;
      };
    };
  }
}

const Login: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [userPw, setUserPw] = useState<string>("");
  const [autoLogin, setAutoLogin] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingLogin, setCheckingLogin] = useState<boolean>(true);
  const navigate = useNavigate();

  // 카카오 SDK 로드 및 로그인 상태 확인
  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          // 토큰 유효성 검증
          const response = await api.get("/api/auth/auto-login");
          if (response.status === 200) {
            const redirectPath =
              localStorage.getItem("redirectAfterLogin") || "/main";
            localStorage.removeItem("redirectAfterLogin");
            console.log("이미 로그인된 상태입니다. 이동:", redirectPath);
            navigate(redirectPath);
            return;
          }
        } catch (error) {
          console.log(
            "토큰이 만료되었거나 유효하지 않습니다. 로그인 페이지를 표시합니다."
          );
          // 토큰이 유효하지 않으면 localStorage에서 제거
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      }

      // 로그인 상태 확인 완료
      setCheckingLogin(false);
    };

    checkLoginStatus();

    // 카카오 SDK 로드
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao) {
        window.Kakao.init(process.env.REACT_APP_KAKAO_APP_KEY || "");
      }
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.head.querySelector(
        'script[src="https://developers.kakao.com/sdk/js/kakao.js"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [navigate]);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!userId || !userPw) {
        setError("ID와 비밀번호를 입력하세요.");
        return;
      }

      // 모바일 환경 감지 및 디버깅 정보
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      console.log("=== 일반 로그인 시작 ===");
      console.log("모바일 환경 감지:", isMobile);
      console.log("브라우저 정보:", navigator.userAgent);
      console.log("현재 페이지 URL:", window.location.href);
      console.log("현재 hostname:", window.location.hostname);
      console.log("환경변수 API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
      console.log(
        "환경변수 API_GUEST_URL:",
        process.env.REACT_APP_API_GUEST_URL
      );
      console.log(
        "실제 사용되는 API URL:",
        (window as any).REACT_APP_CURRENT_API_URL
      );
      console.log(
        "환경 구분:",
        window.location.hostname === "localhost"
          ? "localhost 환경"
          : "외부 IP 환경"
      );

      // 요청 데이터 로깅
      const requestData = {
        username: userId,
        password: userPw,
        // deviceInfo는 백엔드에서 자동 생성하므로 제외
      };
      console.log("로그인 요청 데이터:", JSON.stringify(requestData, null, 2));
      console.log("username 값:", requestData.username);
      console.log("password 값:", requestData.password);

      // axios로 로그인 요청
      const response = await api.post<LoginResponse>(
        "/api/auth/login",
        requestData as LoginRequest
      );

      if (response.status === 200) {
        const result = response.data;
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: result.username || result.userId,
            userNn: result.name || result.userNn,
            userEmail: result.email || result.userEmail,
          })
        );
        if (result.accessToken)
          localStorage.setItem("token", result.accessToken);
        if (result.refreshToken)
          localStorage.setItem("refreshToken", result.refreshToken);

        // 자동 로그인 설정 저장
        if (autoLogin) {
          localStorage.setItem("autoLogin", "true");
        } else {
          localStorage.removeItem("autoLogin");
        }

        alert("로그인 성공!");
        console.log("겨겨겨결과", JSON.stringify(result, null, 2));
        const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        setError(response.data.message || "로그인에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("로그인 오류 상세:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
      });

      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log("서버 에러 응답:", errorData);

        if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.message) {
          setError(errorData.message);
        } else if (errorData.details) {
          setError(errorData.details);
        } else {
          setError(
            `서버 오류: ${error.response.status} - ${error.response.statusText}`
          );
        }
      } else {
        setError("서버 연결에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async (): Promise<void> => {
    try {
      console.log("=== 카카오 로그인 시작 ===");
      console.log("카카오 SDK 초기화 상태:", window.Kakao?.isInitialized());
      console.log("브라우저 정보:", navigator.userAgent);

      if (!window.Kakao) {
        setError("카카오 SDK가 로드되지 않았습니다.");
        return;
      }

      if (!window.Kakao.isInitialized()) {
        setError("카카오 SDK가 초기화되지 않았습니다.");
        return;
      }

      // 모바일 환경 감지
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      console.log("모바일 환경 감지:", isMobile);

      // 카카오 로그인 실행 (모바일에서는 웹 로그인만 사용)
      const response: KakaoAuthResponse = await new Promise(
        (resolve, reject) => {
          window.Kakao.Auth.login({
            throughTalk: false, // 카카오톡 앱 로그인 강제 비활성화
            persistAccessToken: true, // 액세스 토큰 유지
            success: (authResponse) => {
              console.log("카카오 로그인 성공:", authResponse);
              resolve(authResponse);
            },
            fail: (error) => {
              console.error("카카오 로그인 실패:", error);
              console.error("실패 상세 정보:", {
                error: error,
                userAgent: navigator.userAgent,
                isMobile: isMobile,
                kakaoInitialized: window.Kakao?.isInitialized(),
              });
              reject(error);
            },
          });
        }
      );

      // 카카오 사용자 정보 가져오기
      const userInfo: KakaoUserInfo = await new Promise((resolve, reject) => {
        window.Kakao.API.request({
          url: "/v2/user/me",
          success: (response) => {
            console.log("=== 카카오 API 사용자 정보 응답 ===");
            console.log("전체 응답:", response);
            console.log("kakao_account:", response.kakao_account);
            console.log("properties:", response.properties);
            console.log("================================");
            resolve(response);
          },
          fail: reject,
        });
      });

      // 백엔드로 카카오 로그인 요청
      const loginResponse = await api.post<KakaoLoginResponse>(
        "/api/auth/kakao/login",
        {
          accessToken: response.access_token,
          userInfo: {
            id: userInfo.id,
            email: userInfo.kakao_account?.email,
            nickname:
              userInfo.kakao_account?.profile?.nickname ||
              userInfo.properties?.nickname,
            profileImage:
              userInfo.kakao_account?.profile?.profile_image_url ||
              userInfo.properties?.profile_image,
          },
          // deviceInfo는 백엔드에서 자동 생성하므로 제외
        } as KakaoLoginRequest
      );

      if (loginResponse.status === 200) {
        const result = loginResponse.data;

        console.log("=== 카카오 로그인 응답 상세 ===");
        console.log("백엔드 응답 전체:", result);
        console.log("result.name:", result.name);
        console.log("result.userNn:", result.userNn);
        console.log("result.username:", result.username);
        console.log("result.userId:", result.userId);
        console.log(
          "카카오 API 닉네임:",
          userInfo.kakao_account?.profile?.nickname
        );
        console.log(
          "카카오 API properties 닉네임:",
          userInfo.properties?.nickname
        );
        console.log("================================");

        // 사용자 정보를 올바른 형식으로 저장
        const savedUserInfo = {
          userId: `kakao_${userInfo.id}`, // 카카오 사용자임을 명시적으로 표시
          userNn:
            result.name ||
            result.userNn ||
            userInfo.kakao_account?.profile?.nickname ||
            userInfo.properties?.nickname ||
            `카카오사용자_${userInfo.id}`,
          userEmail:
            result.email || result.userEmail || userInfo.kakao_account?.email,
        };

        console.log("=== 카카오 로그인 성공 - 사용자 정보 저장 ===");
        console.log("저장할 사용자 정보:", savedUserInfo);
        console.log("================================");

        localStorage.setItem("user", JSON.stringify(savedUserInfo));
        if (result.accessToken)
          localStorage.setItem("token", result.accessToken);

        // 자동 로그인 설정 저장 (카카오 로그인도 동일하게 적용)
        if (autoLogin) {
          localStorage.setItem("autoLogin", "true");
        } else {
          localStorage.removeItem("autoLogin");
        }

        alert("카카오 로그인 성공!");
        const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        setError(loginResponse.data.message || "카카오 로그인에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("=== 카카오 로그인 오류 상세 ===");
      console.error("오류 타입:", error.constructor.name);
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
      console.error("================================");
      setError("카카오 로그인에 실패했습니다: " + error.message);
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserId(e.target.value);
  };

  const handleUserPwChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserPw(e.target.value);
  };

  const handleAutoLoginChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setAutoLogin(e.target.checked);
  };

  const handleJoinClick = (): void => {
    navigate("/join");
  };

  // 로그인 상태 확인 중일 때 로딩 화면 표시
  if (checkingLogin) {
    return (
      <div className="login-container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>로그인 상태 확인 중...</h2>
          <div style={{ marginTop: "20px" }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="userId">ID</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={handleUserIdChange}
            autoComplete="username"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="userPw">비밀번호</label>
          <input
            type="password"
            id="userPw"
            value={userPw}
            onChange={handleUserPwChange}
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoLogin}
              onChange={handleAutoLoginChange}
              disabled={loading}
            />
            <span className="checkmark"></span>
            자동 로그인
          </label>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
        <div className="find-account-links">
          <button
            type="button"
            className="btn-link"
            onClick={() => navigate("/find-id")}
            disabled={loading}
          >
            아이디 찾기
          </button>
          <span className="separator">|</span>
          <button
            type="button"
            className="btn-link"
            onClick={() => navigate("/find-password")}
            disabled={loading}
          >
            비밀번호 찾기
          </button>
        </div>
      </form>
      <div className="login-actions">
        <button
          className="btn btn-secondary"
          onClick={handleJoinClick}
          disabled={loading}
        >
          회원가입
        </button>
        <button
          className="btn btn-sns"
          onClick={handleKakaoLogin}
          disabled={loading}
          style={{ backgroundColor: "#FEE500", color: "#000" }}
        >
          카카오 로그인
        </button>
      </div>
    </div>
  );
};

export default Login;
