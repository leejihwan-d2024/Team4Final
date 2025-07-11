import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "./login.css";

// 타입 정의
interface LoginRequest {
  username: string;
  password: string;
  deviceInfo: {
    deviceId: string;
    deviceType: string;
  };
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
}

interface KakaoLoginResponse {
  user: any;
  token?: string;
  message?: string;
}

// Kakao SDK 타입 확장
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      Auth: {
        login: (options: {
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
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // 카카오 SDK 로드
  useEffect(() => {
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
  }, []);

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

      // 요청 데이터 로깅
      const requestData = {
        username: userId,
        password: userPw,
        deviceInfo: {
          deviceId: "web-" + Date.now(),
          deviceType: "web",
        },
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
        alert("로그인 성공!");
        navigate("/main");
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
      if (!window.Kakao) {
        setError("카카오 SDK가 로드되지 않았습니다.");
        return;
      }

      // 카카오 로그인 실행
      const response: KakaoAuthResponse = await new Promise(
        (resolve, reject) => {
          window.Kakao.Auth.login({
            success: resolve,
            fail: reject,
          });
        }
      );

      // 카카오 사용자 정보 가져오기
      const userInfo: KakaoUserInfo = await new Promise((resolve, reject) => {
        window.Kakao.API.request({
          url: "/v2/user/me",
          success: resolve,
          fail: reject,
        });
      });

      // 백엔드로 카카오 로그인 요청
      const loginResponse = await api.post<KakaoLoginResponse>(
        "/auth/kakao/login",
        {
          accessToken: response.access_token,
          userInfo: {
            id: userInfo.id,
            email: userInfo.kakao_account?.email,
            nickname: userInfo.properties?.nickname,
            profileImage: userInfo.properties?.profile_image,
          },
        } as KakaoLoginRequest
      );

      if (loginResponse.status === 200) {
        const result = loginResponse.data;
        localStorage.setItem("user", JSON.stringify(result.user));
        if (result.token) localStorage.setItem("token", result.token);
        alert("카카오 로그인 성공!");
        navigate("/main");
      } else {
        setError(loginResponse.data.message || "카카오 로그인에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("카카오 로그인 오류:", error);
      setError("카카오 로그인에 실패했습니다.");
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserId(e.target.value);
  };

  const handleUserPwChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserPw(e.target.value);
  };

  const handleJoinClick = (): void => {
    navigate("/join");
  };

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
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
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
          카카오톡 로그인
        </button>
      </div>
    </div>
  );
};

export default Login;
