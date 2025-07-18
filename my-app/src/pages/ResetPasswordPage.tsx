import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/GG_axiosInstance";
import "./ResetPasswordPage.css";

interface ResetPasswordRequest {
  userId: string;
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isValidToken, setIsValidToken] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // URL 파라미터에서 userId와 token 가져오기
    const urlUserId = searchParams.get("userId");
    const urlToken = searchParams.get("token");

    if (urlUserId && urlToken) {
      setUserId(urlUserId);
      setToken(urlToken);
      setIsValidToken(true);
    } else {
      setMessage("유효하지 않은 링크입니다.");
      setIsValidToken(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!newPassword || !confirmPassword) {
        const errorMsg = "새 비밀번호를 입력해주세요.";
        setMessage(errorMsg);
        setIsSuccess(false);
        alert(errorMsg);
        return;
      }

      if (newPassword !== confirmPassword) {
        const errorMsg = "비밀번호가 일치하지 않습니다.";
        setMessage(errorMsg);
        setIsSuccess(false);
        alert(errorMsg);
        return;
      }

      if (newPassword.length < 6) {
        const errorMsg = "비밀번호는 최소 6자 이상이어야 합니다.";
        setMessage(errorMsg);
        setIsSuccess(false);
        alert(errorMsg);
        return;
      }

      const response = await api.post<ResetPasswordResponse>(
        "/api/auth/reset-password",
        {
          userId: userId,
          token: token,
          newPassword: newPassword,
        } as ResetPasswordRequest
      );

      if (response.data.success) {
        const successMsg =
          "비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.";
        setMessage(successMsg);
        setIsSuccess(true);
        alert(successMsg);

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        const errorMsg =
          response.data.message || "비밀번호 재설정에 실패했습니다.";
        setMessage(errorMsg);
        setIsSuccess(false);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error("비밀번호 재설정 오류:", error);
      const errorMsg =
        error.response?.data?.message ||
        "비밀번호 재설정 중 오류가 발생했습니다.";
      setMessage(errorMsg);
      setIsSuccess(false);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  if (!isValidToken) {
    return (
      <div className="reset-password-container">
        <h2>비밀번호 재설정</h2>
        <div className="message error">{message}</div>
        <div className="actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBackToLogin}
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <h2>비밀번호 재설정</h2>
      <p className="description">
        새로운 비밀번호를 입력해주세요.
        <br />
        비밀번호는 최소 6자 이상이어야 합니다.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="newPassword">새 비밀번호</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={handleNewPasswordChange}
            placeholder="새 비밀번호를 입력하세요"
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">새 비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="새 비밀번호를 다시 입력하세요"
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        {message && (
          <div className={`message ${isSuccess ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "처리 중..." : "비밀번호 변경"}
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

export default ResetPasswordPage;
