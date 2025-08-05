import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/GG_axiosInstance";
import { isWebAuthnCapable } from "../utils/mobileDetector";
import kakaoLoginImage from "../img/kakao_login_large_narrow.png";
import "./login.css";
import { getApiBaseUrl } from "../utils/apiUtils";

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
        const redirectPath =
          localStorage.getItem("redirectAfterLogin") || "/main";
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
        console.log("에러 응답 타입:", typeof errorData);
        console.log("에러 응답 키들:", Object.keys(errorData));
        console.log("에러 응답 전체 구조:", JSON.stringify(errorData, null, 2));

        // 백엔드에서 보내는 다양한 형태의 오류 메시지를 처리
        let errorMessage = "";

        // 417 상태 코드는 특별히 처리 (로그인 실패)
        if (error.response.status === 417) {
          // 모든 가능한 필드를 체크하여 메시지 찾기
          const possibleMessageFields = [
            "error",
            "message",
            "details",
            "errorMessage",
            "msg",
            "error_msg",
            "errorMessage",
            "error_message",
            "detail",
            "reason",
            "description",
            "info",
            "text",
            "content",
          ];

          for (const field of possibleMessageFields) {
            if (errorData[field] && typeof errorData[field] === "string") {
              errorMessage = errorData[field];
              console.log(`417 오류에서 메시지 발견 (${field}):`, errorMessage);
              break;
            }
          }

          // 메시지를 찾지 못한 경우 기본 메시지 사용
          if (!errorMessage) {
            errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
            console.log("417 오류에서 메시지를 찾지 못해 기본 메시지 사용");
          }
        } else {
          // 다른 상태 코드의 경우 기존 로직 유지
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.errorMessage) {
            errorMessage = errorData.errorMessage;
          } else if (errorData.msg) {
            errorMessage = errorData.msg;
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          } else {
            errorMessage = `서버 오류: ${error.response.status} - ${error.response.statusText}`;
          }
        }

        console.log("최종 표시할 오류 메시지:", errorMessage);
        setError(errorMessage);
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

      // 백엔드로 전송할 데이터 준비
      const kakaoLoginData = {
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
      } as KakaoLoginRequest;

      console.log("=== 백엔드로 전송할 카카오 로그인 데이터 ===");
      console.log("accessToken:", kakaoLoginData.accessToken);
      console.log("userInfo.id:", kakaoLoginData.userInfo.id);
      console.log("userInfo.email:", kakaoLoginData.userInfo.email);
      console.log("userInfo.nickname:", kakaoLoginData.userInfo.nickname);
      console.log(
        "userInfo.profileImage:",
        kakaoLoginData.userInfo.profileImage
      );
      console.log("================================");

      // 백엔드로 카카오 로그인 요청
      const loginResponse = await api.post<KakaoLoginResponse>(
        "/api/auth/kakao/login",
        kakaoLoginData
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
        const redirectPath =
          localStorage.getItem("redirectAfterLogin") || "/main";
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

      // 카카오 로그인 오류 처리도 일반 로그인과 동일하게 개선
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log("카카오 로그인 서버 에러 응답:", errorData);
        console.log("카카오 에러 응답 타입:", typeof errorData);
        console.log("카카오 에러 응답 키들:", Object.keys(errorData));

        let errorMessage = "";

        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.details) {
          errorMessage = errorData.details;
        } else if (errorData.errorMessage) {
          errorMessage = errorData.errorMessage;
        } else if (errorData.msg) {
          errorMessage = errorData.msg;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else {
          errorMessage = `카카오 로그인 오류: ${error.response.status} - ${error.response.statusText}`;
        }

        console.log("카카오 최종 표시할 오류 메시지:", errorMessage);
        setError(errorMessage);
      } else {
        setError("카카오 로그인에 실패했습니다: " + error.message);
      }
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

  // 강제 로그인 함수 (사용자 1111)
  const handleForceLogin = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const loginRequest: LoginRequest = {
        username: "1111",
        password: "1111",
      };

      const response = await api.post<LoginResponse>(
        "/api/auth/login",
        loginRequest
      );

      if (response.data.accessToken) {
        // JWT 토큰 저장
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("accessToken", response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        // 사용자 정보 저장
        const userInfo = {
          userId: response.data.userId || "1111",
          userNn: response.data.userNn || response.data.name || "1111",
          userEmail: response.data.userEmail || response.data.email || "",
        };
        localStorage.setItem("user", JSON.stringify(userInfo));

        navigate("/testmain");
      } else {
        throw new Error("로그인 응답에 토큰이 없습니다.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "강제 로그인 중 오류가 발생했습니다."
      );
      console.error("강제 로그인 오류:", err);
    } finally {
      setLoading(false);
    }
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
      {/* 강제 로그인 버튼 - 최상단 좌측 */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={handleForceLogin}
          disabled={loading}
          style={{
            background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
            color: "white",
            border: "none",
            borderRadius: "15px",
            padding: "6px 12px",
            fontSize: "11px",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 6px rgba(255, 107, 107, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            fontWeight: "500",
            transition: "all 0.2s ease",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 3px 8px rgba(255, 107, 107, 0.3)";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 2px 6px rgba(255, 107, 107, 0.2)";
          }}
          title="사용자 1111 강제 로그인"
        >
          ⚡ 1111 로그인
        </button>
      </div>

      {/* 지문인식 버튼 - 최상단 우측 (모바일에서만 표시) */}
      {isWebAuthnCapable() && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/publickey")}
            style={{
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              borderRadius: "15px",
              padding: "6px 12px",
              fontSize: "11px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(102, 126, 234, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 3px 8px rgba(102, 126, 234, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 2px 6px rgba(102, 126, 234, 0.2)";
            }}
            title="지문인식 등록/로그인"
          >
            🔐 지문인식
          </button>
        </div>
      )}

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

        {/* 모바일에서만 지문인식 로그인 버튼 표시 */}
        {isWebAuthnCapable() && (
          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "12px",
              borderRadius: "8px",
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(102, 126, 234, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(102, 126, 234, 0.3)";
            }}
            title="지문인식으로 로그인"
          >
            🔐 지문인식으로 로그인
          </button>
        )}
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
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "auto",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        >
          회원가입
        </button>
        <button
          className="btn btn-sns"
          onClick={handleKakaoLogin}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "auto",
            transition: "all 0.2s ease",
            opacity: loading ? 0.6 : 1,
            marginBottom: 0,
            boxSizing: "border-box",
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1.02)";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="카카오 로그인"
        >
          <img
            src={kakaoLoginImage}
            alt="카카오 로그인"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "100%",
              maxHeight: "60px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default Login;
