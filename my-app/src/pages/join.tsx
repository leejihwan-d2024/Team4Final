import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/GG_axiosInstance";
import "./join.css";

// 타입 정의
interface JoinFormData {
  userId: string;
  userPw: string;
  userNn: string;
  userEmail: string;
  userPhoneno: string;
  profileImageUrl: string;
}

interface JoinRequest {
  userId: string;
  userEmail: string;
  userPw: string;
  userNn: string;
  userPhoneno: string;
  userProfileImageUrl?: string;
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
    profileImageUrl: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>(
    "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
  );
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const phone1Ref = React.useRef<HTMLInputElement>(null);
  const phone2Ref = React.useRef<HTMLInputElement>(null);
  const phone3Ref = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
      ];
      const pathname = urlObj.pathname.toLowerCase();
      return (
        imageExtensions.some((ext) => pathname.endsWith(ext)) ||
        url.includes("placeholder.com") ||
        url.includes("via.placeholder.com")
      );
    } catch {
      return false;
    }
  };

  const testImageUrl = () => {
    const url = form.profileImageUrl.trim();

    if (!url) {
      setStatus({ message: "URL을 입력해주세요.", type: "error" });
      return;
    }

    if (!isValidImageUrl(url)) {
      setStatus({ message: "유효한 이미지 URL이 아닙니다.", type: "error" });
      return;
    }

    setStatus({ message: "이미지를 불러오는 중...", type: "info" });

    const testImg = new Image();
    testImg.onload = () => {
      setPreviewImage(url);
      setStatus({ message: "이미지 URL이 유효합니다!", type: "success" });
    };

    testImg.onerror = () => {
      setStatus({
        message: "이미지를 불러올 수 없습니다. URL을 확인해주세요.",
        type: "error",
      });
    };

    testImg.src = url;
  };

  const clearImageUrl = () => {
    setForm((prev) => ({ ...prev, profileImageUrl: "" }));
    setPreviewImage(
      "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
    );
    setStatus({ message: "프로필 이미지가 초기화되었습니다.", type: "info" });
  };

  // 전화번호 입력 핸들러
  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    part: "phone1" | "phone2" | "phone3"
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (part === "phone1") {
      setPhone1(value.slice(0, 3));
      if (value.length === 3) {
        phone2Ref.current?.focus();
      }
    } else if (part === "phone2") {
      setPhone2(value.slice(0, 4));
      if (value.length === 4) {
        phone3Ref.current?.focus();
      }
    } else if (part === "phone3") {
      setPhone3(value.slice(0, 4));
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

      // 전화번호 합치기
      let phone = "";
      if (phone1 && phone2 && phone3) {
        phone = `${phone1}-${phone2}-${phone3}`;
      }

      // UserVO에 맞는 JSON 데이터 생성
      const data: JoinRequest = {
        userId: form.userId,
        userEmail: form.userEmail,
        userPw: form.userPw,
        userNn: form.userNn,
        userPhoneno: phone,
        userProfileImageUrl: form.profileImageUrl || undefined,
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
          <div className="phone-input-group">
            <input
              type="text"
              name="phone1"
              value={phone1}
              onChange={(e) => handlePhoneChange(e, "phone1")}
              maxLength={3}
              ref={phone1Ref}
              className="phone-input"
              placeholder="010"
              autoComplete="off"
            />
            <span className="phone-hyphen">-</span>
            <input
              type="text"
              name="phone2"
              value={phone2}
              onChange={(e) => handlePhoneChange(e, "phone2")}
              maxLength={4}
              ref={phone2Ref}
              className="phone-input"
              placeholder="0000"
              autoComplete="off"
            />
            <span className="phone-hyphen">-</span>
            <input
              type="text"
              name="phone3"
              value={phone3}
              onChange={(e) => handlePhoneChange(e, "phone3")}
              maxLength={4}
              ref={phone3Ref}
              className="phone-input"
              placeholder="0000"
              autoComplete="off"
            />
          </div>
        </div>

        {/* 프로필 이미지 URL 섹션 */}
        <div className="form-group image-group">
          <label htmlFor="profileImageUrl">프로필 이미지 URL (선택)</label>
          <div className="profile-image-section">
            <div className="profile-preview-container">
              <img
                src={previewImage}
                alt="프로필 이미지"
                className="profile-preview"
              />
            </div>
            <input
              type="url"
              id="profileImageUrl"
              name="profileImageUrl"
              value={form.profileImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="profile-url-input"
            />
            <div className="profile-url-buttons">
              <button
                type="button"
                onClick={testImageUrl}
                className="btn btn-test"
                disabled={loading}
              >
                URL 테스트
              </button>
              <button
                type="button"
                onClick={clearImageUrl}
                className="btn btn-clear"
                disabled={loading}
              >
                초기화
              </button>
            </div>
            <div className="profile-url-help">
              이미지 URL을 입력하세요 (예: https://example.com/image.jpg)
            </div>
          </div>
        </div>

        {/* 상태 메시지 */}
        {status && (
          <div className={`status-message status-${status.type}`}>
            {status.message}
          </div>
        )}

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
