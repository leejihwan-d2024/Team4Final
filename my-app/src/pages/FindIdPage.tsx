import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/GG_axiosInstance";
import "./FindIdPage.css";

interface FindIdRequest {
  email: string;
}

interface FindIdResponse {
  success: boolean;
  message: string;
  userId?: string;
}

const FindIdPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!email) {
        const errorMsg = "이메일을 입력해주세요.";
        setMessage(errorMsg);
        setIsSuccess(false);
        alert(errorMsg);
        return;
      }

      const response = await api.post<FindIdResponse>("/api/auth/find-id", {
        email: email,
      } as FindIdRequest);

      if (response.data.success) {
        const successMsg =
          "아이디 찾기 이메일이 발송되었습니다. 이메일을 확인해주세요.";
        setMessage(successMsg);
        setIsSuccess(true);
        alert(successMsg);
      } else {
        const errorMsg = response.data.message || "아이디 찾기에 실패했습니다.";
        setMessage(errorMsg);
        setIsSuccess(false);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error("아이디 찾기 오류:", error);
      const errorMsg =
        error.response?.data?.message || "아이디 찾기 중 오류가 발생했습니다.";
      setMessage(errorMsg);
      setIsSuccess(false);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="find-id-container">
      <h2>아이디 찾기</h2>
      <p className="description">
        가입 시 등록한 이메일 주소를 입력하시면
        <br />
        해당 이메일로 아이디를 발송해드립니다.
      </p>

      <form onSubmit={handleSubmit}>
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
          {loading ? "처리 중..." : "아이디 찾기"}
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

export default FindIdPage;
