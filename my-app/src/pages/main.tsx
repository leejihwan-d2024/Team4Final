import React from "react";
import { useNavigate } from "react-router-dom";

// 타입 정의
interface User {
  userNn?: string;
  userId?: string;
  userEmail?: string;
}

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const handleGoToLogin = (): void => {
    navigate("/login");
  };

  const handleGoToJoin = (): void => {
    navigate("/join");
  };

  const handleGoToHome = (): void => {
    navigate("/FirstPage");
  };

  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h1 style={{ color: "#333", marginBottom: "20px" }}>
          환영합니다, {user?.userNn || user?.userId || "사용자"}님!
        </h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          이곳은 메인 페이지입니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={handleGoToHome}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#0056b3";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#007bff";
            }}
          >
            홈으로 이동
          </button>

          <button
            onClick={handleGoToLogin}
            style={{
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#1e7e34";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#28a745";
            }}
          >
            로그인 페이지로
          </button>

          <button
            onClick={handleGoToJoin}
            style={{
              padding: "12px 24px",
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#e0a800";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#ffc107";
            }}
          >
            회원가입 페이지로
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "12px 24px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#c82333";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#dc3545";
            }}
          >
            로그아웃
          </button>
        </div>

        {user && (
          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#495057" }}>
              사용자 정보
            </h3>
            <p style={{ margin: "5px 0", color: "#6c757d" }}>
              <strong>ID:</strong> {user.userId}
            </p>
            <p style={{ margin: "5px 0", color: "#6c757d" }}>
              <strong>닉네임:</strong> {user.userNn}
            </p>
            <p style={{ margin: "5px 0", color: "#6c757d" }}>
              <strong>이메일:</strong> {user.userEmail}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
