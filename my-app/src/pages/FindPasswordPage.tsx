import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/GG_axiosInstance";
import "./FindPasswordPage.css";

interface FindPasswordRequest {
  userId: string;
  email: string;
}

interface FindPasswordResponse {
  success: boolean;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const FindPasswordPage: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    console.log("=== 비밀번호 찾기 요청 시작 ===");
    console.log("아이디:", userId);
    console.log("이메일:", email);
    console.log("================================");

    try {
      if (!userId || !email) {
        const errorMsg = "아이디와 이메일을 모두 입력해주세요.";
        setMessage(errorMsg);
        setIsSuccess(false);
        alert(errorMsg);
        alert(errorMsg);
        return;
      }

      console.log("=== API 요청 시작 ===");
      const response = await api.post<ApiResponse>("/api/auth/find-password", {
        userId: userId,
        email: email,
      } as FindPasswordRequest);

      console.log("=== API 응답 수신 ===");
      console.log("응답 상태:", response.status);
      console.log("응답 데이터:", response.data);

      if (response.data.success) {
        const successMsg =
          "비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.";
        setMessage(successMsg);
        setIsSuccess(true);
        alert(successMsg);
        alert(successMsg);
      } else {
        const errorMsg =
          response.data.message || "비밀번호 찾기에 실패했습니다.";
        setMessage(errorMsg);
        setIsSuccess(false);
        alert(errorMsg);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error("비밀번호 찾기 오류:", error);
      const errorMsg =
        error.response?.data?.message ||
        "비밀번호 찾기 중 오류가 발생했습니다.";
      setMessage(errorMsg);
      setIsSuccess(false);
      alert(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
      console.log("=== 비밀번호 찾기 요청 완료 ===");
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="find-password-container">
      <h2>비밀번호 찾기</h2>
      <p className="description">
        가입 시 등록한 아이디와 이메일 주소를 입력하시면
        <br />
        해당 이메일로 비밀번호 재설정 링크를 발송해드립니다.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">아이디</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={handleUserIdChange}
            placeholder="아이디를 입력하세요"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일 주소</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="example@email.com"
            required
            disabled={loading}
          />
        </div>

        {message && (
          <div className={`message ${isSuccess ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "처리 중..." : "비밀번호 찾기"}
        </button>
      </form>

      <div className="actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBackToLogin}
          disabled={loading}
        >
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default FindPasswordPage;
