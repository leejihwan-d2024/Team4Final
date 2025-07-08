import React, { useState, useEffect } from "react";
import api from "./api/axiosInstance";
import "./auth.css";

function auth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 사용자 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get("/api/auth/status");
      const data = response.data;
      setIsAuthenticated(data.authenticated);
      setUsername(data.username);

      if (data.authenticated) {
        fetchCredentials();
      }
    } catch (error) {
      console.error("Auth status check failed:", error);
    }
  };

  const fetchCredentials = async () => {
    try {
      const response = await api.get("/api/auth/getKeys");
      if (response.status === 200) {
        const data = response.data;
        setCredentials(data.credentials);
      }
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
    }
  };

  const handlePasswordLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/auth/password", {
        username: "test",
        password: "password",
      });
      if (response.status === 200) {
        await checkAuthStatus();
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/signout");
      setIsAuthenticated(false);
      setUsername("");
      setCredentials([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRegisterCredential = async () => {
    setLoading(true);
    try {
      // 1. 등록 옵션 요청
      const optionsResponse = await api.post("/api/auth/registerRequest", {
        username: "test",
      });
      if (optionsResponse.status !== 200) {
        throw new Error("Failed to get registration options");
      }
      const options = optionsResponse.data;

      // 2. 브라우저에서 자격 증명 생성
      const credential = await navigator.credentials.create({
        publicKey: options,
      });

      // 3. 서버에 등록 응답 전송
      const response = await api.post("/api/auth/registerResponse", credential);
      if (response.status === 200) {
        await fetchCredentials();
        alert("자격 증명이 성공적으로 등록되었습니다!");
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("자격 증명 등록에 실패했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    setLoading(true);
    try {
      // 1. 인증 옵션 요청
      const optionsResponse = await api.post("/api/auth/signinRequest", {
        username: "test",
      });
      if (optionsResponse.status !== 200) {
        throw new Error("Failed to get authentication options");
      }
      const options = optionsResponse.data;

      // 2. 브라우저에서 자격 증명 가져오기
      const assertion = await navigator.credentials.get({
        publicKey: options,
      });

      // 3. 서버에 인증 응답 전송
      const response = await api.post("/api/auth/signinResponse", assertion);
      if (response.status === 200) {
        alert("인증이 성공했습니다!");
        await checkAuthStatus();
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("인증에 실패했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCredential = async (credId) => {
    try {
      const response = await api.delete(`/api/auth/removeKey?credId=${credId}`);
      if (response.status === 200) {
        await fetchCredentials();
        alert("자격 증명이 삭제되었습니다!");
      }
    } catch (error) {
      console.error("Remove credential error:", error);
      alert("자격 증명 삭제에 실패했습니다.");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (
        !form.userId ||
        !form.userPw ||
        !form.userNn ||
        !form.userEmail ||
        !form.userPhoneno
      ) {
        setError("모든 필수 항목을 입력하세요.");
        return;
      }

      // UserVO에 맞는 JSON 데이터 생성
      const data = {
        userId: form.userId,
        userPw: form.userPw,
        userNn: form.userNn,
        userEmail: form.userEmail,
        userPhoneno: form.userPhoneno,
        // userDefloc, userProfileImageUrl 등은 필요시 추가
      };

      // axios로 회원가입 요청 (JSON)
      const response = await api.post("/api/auth/register", data);

      if (response.status === 200) {
        alert("회원가입이 완료되었습니다!");
        navigate("/login");
      } else {
        setError(response.data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("서버 연결에 실패했습니다.");
      }
      console.error("회원가입 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>WebAuthn 생체인증 데모</h1>

        {!isAuthenticated ? (
          <div>
            <p>로그인이 필요합니다.</p>
            <button
              onClick={handlePasswordLogin}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "로그인 중..." : "비밀번호로 로그인"}
            </button>
          </div>
        ) : (
          <div>
            <p>안녕하세요, {username}님!</p>

            <div className="auth-section">
              <h3>자격 증명 관리</h3>
              <button
                onClick={handleRegisterCredential}
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? "등록 중..." : "새 자격 증명 등록"}
              </button>

              <button
                onClick={handleAuthenticate}
                disabled={loading || credentials.length === 0}
                className="btn btn-info"
              >
                {loading ? "인증 중..." : "생체인증으로 로그인"}
              </button>
            </div>

            {credentials.length > 0 && (
              <div className="credentials-section">
                <h3>등록된 자격 증명 ({credentials.length}개)</h3>
                <div className="credentials-list">
                  {credentials.map((cred, index) => (
                    <div key={index} className="credential-item">
                      <div>
                        <strong>ID:</strong> {cred.credId.substring(0, 20)}...
                      </div>
                      <div>
                        <strong>카운터:</strong> {cred.counter}
                      </div>
                      <div>
                        <strong>생성일:</strong>{" "}
                        {new Date(cred.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleRemoveCredential(cred.credId)}
                        className="btn btn-danger btn-sm"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleLogout} className="btn btn-secondary">
              로그아웃
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default auth;
