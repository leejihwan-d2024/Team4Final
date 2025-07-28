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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-11/12 max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">개인정보 수정</h2>
              <button
                onClick={() => setShowPersonalEditModal(false)}
                className="text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <PersonalEditForm
              userInfo={ownerInfo}
              onClose={() => setShowPersonalEditModal(false)}
              onUpdate={handleProfileUpdate}
            />
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.put(`/api/user-profile/${userInfo.userId}`, {
        userNn: form.userNn,
        userEmail: form.userEmail,
        userPhoneno: form.userPhoneno,
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
        userPhoneno: form.userPhoneno,
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
      <input
        type="text"
        name="userNn"
        value={form.userNn}
        onChange={handleChange}
        placeholder="닉네임"
        className="input"
        required
      />
      <input
        type="email"
        name="userEmail"
        value={form.userEmail}
        onChange={handleChange}
        placeholder="이메일"
        className="input"
        required
      />
      <input
        type="text"
        name="userPhoneno"
        value={form.userPhoneno}
        onChange={handleChange}
        placeholder="전화번호"
        className="input"
      />
      <label className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          name="showPassword"
          checked={form.showPassword}
          onChange={handleChange}
        />
        <span>비밀번호 변경</span>
      </label>
      {form.showPassword && (
        <>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="현재 비밀번호"
            className="input"
            required
          />
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="새 비밀번호"
            className="input"
            required
          />
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
