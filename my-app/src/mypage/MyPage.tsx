// MyPage.tsx
import React, { useState, useEffect } from "react";
import MainMenu from "../mainpage/MainMenu";
import ToggleBox from "./ToggleBox";
import { Link, useParams } from "react-router-dom";
import ProfileImageEditor from "../components/ProfileImageEditor";
import api from "../api/GG_axiosInstance";

interface UserInfoType {
  userId: string;
  userNn: string;
  userEmail: string;
  userPhoneno?: string;
  userName?: string;
  profileImageUrl?: string;
  userPoint?: string;
  userActivePoint?: string;
  userStatus?: string;
}

interface PersonalEditFormProps {
  userInfo: UserInfoType;
  onClose: () => void;
  onUpdate: (updated: Partial<UserInfoType>) => void;
}

function MyPage() {
  const { UserId } = useParams<{ UserId: string }>();
  const userStr = localStorage.getItem("user");
  const user: UserInfoType | null = JSON.parse(userStr || "null");

  const [userInfo, setUserInfo] = useState<UserInfoType>({
    userId: user?.userId || "",
    userNn: user?.userNn || "",
    userEmail: user?.userEmail || "",
    userName: user?.userName || user?.userNn || "",
    userPhoneno: user?.userPhoneno || "",
    profileImageUrl: user?.profileImageUrl || "",
    userPoint: user?.userPoint || "",
    userActivePoint: user?.userActivePoint || "",
    userStatus: user?.userStatus || "",
  });

  const [ownerInfo, setOwnerInfo] = useState<UserInfoType>(userInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [showProfileImageManager, setShowProfileImageManager] = useState(false);
  const [showPersonalEditModal, setShowPersonalEditModal] = useState(false);

  useEffect(() => {
    if (userInfo.userId) loadUserInfo(userInfo.userId);
  }, []);

  useEffect(() => {
    if (UserId) loadOwnerInfo(UserId);
  }, [UserId]);

  const loadUserInfo = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/api/user-profile/${userId}`);
      const profile = await api.get(`/api/profile/${userId}`).catch(() => null);
      const profileImageUrl = profile?.data?.success
        ? profile.data.imageUrl
        : "";
      if (data.success) {
        setUserInfo({ ...data.userInfo, profileImageUrl });
      }
    } catch {
      setStatus({
        message: "사용자 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadOwnerInfo = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/api/user-profile/${userId}`);
      const profile = await api.get(`/api/profile/${userId}`).catch(() => null);
      const profileImageUrl = profile?.data?.success
        ? profile.data.imageUrl
        : "";
      if (data.success) {
        setOwnerInfo({ ...data.userInfo, profileImageUrl });
      }
    } catch {
      setStatus({
        message: "사용자 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleProfileImageUpdate = (newImageUrl: string) => {
    setUserInfo((prev) => ({ ...prev, profileImageUrl: newImageUrl }));
  };

  const handleProfileUpdate = (updated: Partial<UserInfoType>) => {
    setOwnerInfo((prev) => ({ ...prev, ...updated }));
    setStatus({
      message: "개인정보가 성공적으로 수정되었습니다.",
      type: "success",
    });
  };

  return (
    <div
      className="px-4 py-6 max-w-sm mx-auto w-full"
      style={{ height: 640, display: "flex", flexDirection: "column" }}
    >
      <MainMenu />
      <h2 className="text-lg font-bold mb-4">🧑 프로필 페이지</h2>

      <div className="bg-white rounded-lg shadow-md p-4 mt-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-3">
              <img
                src={
                  ownerInfo.profileImageUrl || "http://img1.kakaocdn.net/..."
                }
                onClick={() =>
                  UserId === user?.userId && setShowProfileImageManager(true)
                }
                alt="프로필"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
              />
              <div className="text-center">
                <p className="font-semibold">{ownerInfo.userName}</p>
                <p className="text-sm text-gray-600">{ownerInfo.userEmail}</p>
                <p className="text-xs text-gray-500">ID: {ownerInfo.userId}</p>
              </div>
            </div>

            <div>
              <button
                onClick={() => UserId && loadOwnerInfo(UserId)}
                className="w-full bg-blue-500 text-white py-2 rounded-md text-sm mb-2"
              >
                정보 새로고침
              </button>
              {UserId === user?.userId && (
                <>
                  <button
                    onClick={() => setShowPersonalEditModal(true)}
                    className="w-full bg-green-500 text-white py-2 rounded-md text-sm mb-2"
                  >
                    개인정보 수정
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-2 rounded-md text-sm"
                  >
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <Link
        to={`/mymeasure/${UserId}`}
        className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-green-600 transition-colors my-[10px]"
      >
        📏 측정데이터 확인
      </Link>

      {status && (
        <div
          className={`mt-4 p-3 text-sm rounded-md border ${
            status.type === "success"
              ? "bg-green-100 border-green-400 text-green-800"
              : status.type === "error"
              ? "bg-red-100 border-red-400 text-red-800"
              : "bg-blue-100 border-blue-400 text-blue-800"
          }`}
        >
          {status.message}
        </div>
      )}

      <div style={{ flexGrow: 1, minHeight: 0, marginTop: "10px" }}>
        <ToggleBox userId={UserId} />
      </div>

      {showProfileImageManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-11/12 max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">프로필 이미지 관리</h2>
              <button
                onClick={() => setShowProfileImageManager(false)}
                className="text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <ProfileImageEditor
              currentImageUrl={userInfo.profileImageUrl}
              userId={userInfo.userId}
              onImageUpdate={(newImageUrl) => {
                handleProfileImageUpdate(newImageUrl);
                setShowProfileImageManager(false);
              }}
              onStatusChange={(status) => setStatus(status)}
            />
            <button
              onClick={() => setShowProfileImageManager(false)}
              className="mt-4 w-full py-2 bg-gray-600 text-white rounded-md"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {showPersonalEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-sm max-h-[90vh] flex flex-col absolute top-4 left-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">개인정보 수정</h2>
              <button
                onClick={() => setShowPersonalEditModal(false)}
                className="text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PersonalEditForm
                userInfo={ownerInfo}
                onClose={() => setShowPersonalEditModal(false)}
                onUpdate={handleProfileUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;

function PersonalEditForm({
  userInfo,
  onClose,
  onUpdate,
}: PersonalEditFormProps) {
  const [form, setForm] = useState({
    userNn: userInfo.userNn,
    userEmail: userInfo.userEmail,
    userPhoneno: userInfo.userPhoneno || "",
    password: "",
    newPassword: "",
    showPassword: false,
  });
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const phone1Ref = React.useRef<HTMLInputElement>(null);
  const phone2Ref = React.useRef<HTMLInputElement>(null);
  const phone3Ref = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 전화번호 분리 및 초기화
  useEffect(() => {
    if (userInfo.userPhoneno) {
      const phoneParts = userInfo.userPhoneno.split("-");
      setPhone1(phoneParts[0] || "");
      setPhone2(phoneParts[1] || "");
      setPhone3(phoneParts[2] || "");
    }
  }, [userInfo.userPhoneno]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 전화번호 합치기
    let phone = "";
    if (phone1 && phone2 && phone3) {
      phone = `${phone1}-${phone2}-${phone3}`;
    }

    try {
      await api.put(`/api/user-profile/${userInfo.userId}`, {
        userNn: form.userNn,
        userEmail: form.userEmail,
        userPhoneno: phone,
      });
      if (form.showPassword && form.password && form.newPassword) {
        await api.post("/api/auth/password/update", {
          oldPassword: form.password,
          newPassword: form.newPassword,
        });
      }
      onUpdate({
        userNn: form.userNn,
        userEmail: form.userEmail,
        userPhoneno: phone,
      });
    } catch (err: unknown) {
      const error = err as any;
      setError(error?.response?.data?.message || "수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label
          htmlFor="userNn"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          닉네임
        </label>
        <input
          type="text"
          id="userNn"
          name="userNn"
          value={form.userNn}
          onChange={handleChange}
          className="input w-full"
          required
        />
      </div>
      <div className="form-group">
        <label
          htmlFor="userEmail"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          이메일
        </label>
        <input
          type="email"
          id="userEmail"
          name="userEmail"
          value={form.userEmail}
          onChange={handleChange}
          className="input w-full"
          required
        />
      </div>
      <div className="form-group">
        <label
          htmlFor="userPhoneno"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          전화번호
        </label>
        <div className="phone-input-group">
          <div className="phone-input-row">
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
          </div>
          <div className="phone-input-row">
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
          </div>
          <div className="phone-input-row">
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
      </div>
      <div className="form-group">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="showPassword"
            checked={form.showPassword}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span>비밀번호 변경</span>
        </label>
      </div>
      {form.showPassword && (
        <>
          <div className="form-group">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              현재 비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              새 비밀번호
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
        </>
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
