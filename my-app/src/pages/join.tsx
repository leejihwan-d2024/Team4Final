import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "./join.css";

// 타입 정의
interface JoinFormData {
  userId: string;
  userPw: string;
  userNn: string;
  userEmail: string;
  userPhoneno: string;
  profileImage: File | null;
  profileImageUrl: string;
}

interface JoinRequest {
  userId: string;
  userEmail: string;
  userPw: string;
  userNn: string;
}

interface JoinResponse {
  message?: string;
  error?: string;
}

const Join: React.FC = () => {
  const [form, setForm] = useState<JoinFormData>({
    userId: "",
    userPw: "",
    userNn: "",
    userEmail: "",
    userPhoneno: "",
    profileImage: null,
    profileImageUrl: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files && files[0]) {
      const file = files[0];
      setForm((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        if (ev.target?.result) {
          setForm((prev) => ({
            ...prev,
            profileImageUrl: ev.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleJoin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.userId || !form.userPw || !form.userNn || !form.userEmail) {
        setError("ID, 비밀번호, 닉네임, 이메일은 필수 항목입니다.");
        return;
      }

      // UserVO에 맞는 JSON 데이터 생성
      const data: JoinRequest = {
        userId: form.userId,
        userEmail: form.userEmail,
        userPw: form.userPw,
        userNn: form.userNn,
      };

      // 요청 데이터 로깅
      console.log("회원가입 요청 데이터:", data);

      // axios로 회원가입 요청 (JSON)
      const response = await api.post<JoinResponse>("/api/auth/register", data);

      if (response.status === 200) {
        alert("회원가입이 완료되었습니다!");
        navigate("/login");
      } else {
        setError(response.data.message || "회원가입에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("회원가입 오류 상세:", {
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

  const handleImageButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBackClick = (): void => {
    navigate("/login");
  };

  return (
    <div className="join-container">
      <h2>회원가입</h2>
      <form onSubmit={handleJoin}>
        <div className="form-group">
          <label htmlFor="userId">ID</label>
          <input
            type="text"
            id="userId"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userPw">비밀번호</label>
          <input
            type="password"
            id="userPw"
            name="userPw"
            value={form.userPw}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userNn">닉네임</label>
          <input
            type="text"
            id="userNn"
            name="userNn"
            value={form.userNn}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userEmail">이메일</label>
          <input
            type="email"
            id="userEmail"
            name="userEmail"
            value={form.userEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userPhoneno">전화번호 (선택)</label>
          <input
            type="tel"
            id="userPhoneno"
            name="userPhoneno"
            value={form.userPhoneno}
            onChange={handleChange}
          />
        </div>
        <div className="form-group image-group">
          <label htmlFor="profileImage">프로필 이미지</label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={handleImageButtonClick}
            className="btn btn-image"
          >
            이미지 첨부
          </button>
          {form.profileImageUrl && (
            <img
              src={form.profileImageUrl}
              alt="미리보기"
              className="profile-preview"
            />
          )}
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "가입 중..." : "가입"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBackClick}
          disabled={loading}
        >
          뒤로가기
        </button>
      </form>
    </div>
  );
};

export default Join;
