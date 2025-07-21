import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { login, checkServerStatus } from "../api/authApi";
import { logDeviceInfo } from "../utils/deviceUtils";
import { AuthResponse } from "../types/auth";
import "./LoginForm.css";

type ServerStatus = "checking" | "online" | "offline";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [serverStatus, setServerStatus] = useState<ServerStatus>("checking");

  // 컴포넌트 마운트 시 서버 상태 확인 및 디바이스 정보 로깅
  useEffect(() => {
    const checkServer = async () => {
      try {
        await checkServerStatus();
        setServerStatus("online");
        logDeviceInfo(); // 디바이스 정보 로깅
      } catch (error) {
        console.error("서버 연결 실패:", error);
        setServerStatus("offline");
        setError("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
      }
    };

    checkServer();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result: AuthResponse = await login(username, password);
      console.log("로그인 성공:", result);

      // 로그인 성공 처리
      if (result.accessToken) {
        // 토큰 저장
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);

        // 사용자 정보 저장
        if (result.user?.username) {
          localStorage.setItem("username", result.user.username);
        }

        // 로그인 성공 후 리다이렉트 또는 상태 업데이트
        alert("로그인에 성공했습니다!");
        // window.location.href = '/dashboard'; // 또는 React Router 사용
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      setError(
        error instanceof Error ? error.message : "로그인에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "password") {
      setPassword(value);
    }
    // 에러 메시지 초기화
    if (error) {
      setError("");
    }
  };

  const handleKakaoLogin = () => {
    // 카카오 로그인 구현
    alert("카카오 로그인 기능은 별도로 구현해야 합니다.");
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">로그인</h2>

        {/* 서버 상태 표시 */}
        <div className={`server-status ${serverStatus}`}>
          {serverStatus === "checking" && "서버 연결 확인 중..."}
          {serverStatus === "online" && "서버 연결됨"}
          {serverStatus === "offline" && "서버 연결 실패"}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              아이디
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleInputChange}
              placeholder="아이디를 입력하세요"
              required
              className="form-input"
              disabled={loading || serverStatus === "offline"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              required
              className="form-input"
              disabled={loading || serverStatus === "offline"}
            />
          </div>

          {/* 에러 메시지 표시 */}
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading || serverStatus === "offline"}
            className="login-button"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 추가 링크들 */}
        <div className="login-links">
          <a href="/find-id" className="link">
            아이디 찾기
          </a>
          <span className="separator">|</span>
          <a href="/find-password" className="link">
            비밀번호 찾기
          </a>
          <span className="separator">|</span>
          <a href="/register" className="link">
            회원가입
          </a>
        </div>

        {/* 카카오 로그인 버튼 */}
        <div className="social-login">
          <button
            className="kakao-login-button"
            disabled={loading || serverStatus === "offline"}
            onClick={handleKakaoLogin}
          >
            카카오로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
