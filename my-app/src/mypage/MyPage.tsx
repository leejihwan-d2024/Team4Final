import React, { useState, useEffect } from "react";
import MainMenu from "../mainpage/MainMenu";
import ToggleBox from "./ToggleBox";
import { useParams } from "react-router-dom";
import PasswordChangeForm from "../components/PasswordChangeForm";
import EmailChangeForm from "../components/EmailChangeForm";
import ProfileImageEditor from "../components/ProfileImageEditor";
import api from "../api/GG_axiosInstance";

function MyPage() {
  const { UserId } = useParams<{ UserId: string }>();
  const userStr = localStorage.getItem("user");
  const user = JSON.parse(userStr || "null");

  // 사용자 정보 상태 관리
  const [userInfo, setUserInfo] = useState({
    userId: user?.userId || "",
    userNn: user?.userNn || "",
    userEmail: user?.userEmail || "",
    userName: user?.userName || user?.userNn || "",
    userPhoneno: user?.userPhoneno || "",
    profileImageUrl: user?.profileImageUrl || "",
    userPoint: user?.userPoint || "",
    userActivePoint: user?.userActivePoint || "",
  });
  const [OwneruserInfo, setOwnerUserInfo] = useState({
    userId: user?.userId || "",
    userNn: user?.userNn || "",
    userEmail: user?.userEmail || "",
    userName: user?.userName || user?.userNn || "",
    userPhoneno: user?.userPhoneno || "",
    profileImageUrl: user?.profileImageUrl || "",
    userPoint: user?.userPoint || "",
    userActivePoint: user?.userActivePoint || "",
  });
  console.log(
    userInfo?.userId +
      "/" +
      userInfo?.userNn +
      "/" +
      userInfo?.userEmail +
      "/" +
      userInfo?.userName +
      "/" +
      userInfo.userPoint +
      "/" +
      userInfo.userActivePoint
  );
  console.log(userInfo?.userActivePoint + "유저액티브포인트");
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false);

  // 상태 메시지 관리
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // 로그아웃 함수
  const handleLogout = () => {
    // 로컬 스토리지에서 사용자 정보 삭제
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // 로그인 페이지로 리다이렉트
    window.location.href = "/login";
  };

  // 사용자 정보 로드 함수
  const loadUserInfo = async (userId: string) => {
    setIsLoading(true);
    try {
      // 사용자 기본 정보 조회
      const userResponse = await api.get(`/api/user-profile/${userId}`);
      let profileImageUrl = "";

      // 프로필 이미지 URL 조회
      try {
        const imageResponse = await api.get(`/api/profile/${userId}`);
        if (imageResponse.data.success) {
          profileImageUrl = imageResponse.data.imageUrl;
        }
      } catch (imageError) {
        console.log("프로필 이미지 URL 조회 실패, 기본값 사용");
      }

      if (userResponse.data.success) {
        const userData = userResponse.data.userInfo;
        setUserInfo({
          userId: userData.userId || userId,
          userNn: userData.userNn || "",
          userEmail: userData.userEmail || "",
          userName: userData.userNn || "",
          userPhoneno: userData.userPhoneno || "",
          profileImageUrl:
            userData.userProfileImageUrl || profileImageUrl || "",
          userPoint: userData?.userPoint || "",
          userActivePoint: userData?.userActivePoint || "",
        });
        console.log(userData?.userActivePoint + "포인트");
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      setStatus({
        message: "사용자 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const loadOwnerUserInfo = async (userId: string) => {
    setIsLoading(true);
    try {
      // 사용자 기본 정보 조회
      const userResponse = await api.get(`/api/user-profile/${UserId}`);
      let profileImageUrl = "";

      // 프로필 이미지 URL 조회
      try {
        const imageResponse = await api.get(`/api/profile/${UserId}`);
        if (imageResponse.data.success) {
          profileImageUrl = imageResponse.data.imageUrl;
        }
      } catch (imageError) {
        console.log("프로필 이미지 URL 조회 실패, 기본값 사용");
      }

      if (userResponse.data.success) {
        const userData = userResponse.data.userInfo;
        setOwnerUserInfo({
          userId: userData.userId || UserId,
          userNn: userData.userNn || "",
          userEmail: userData.userEmail || "",
          userName: userData.userNn || "",
          userPhoneno: userData.userPhoneno || "",
          profileImageUrl:
            userData.userProfileImageUrl || profileImageUrl || "",
          userPoint: userData?.userPoint || "",
          userActivePoint: userData?.userActivePoint || "",
        });
        console.log(userData?.userActivePoint + "포인트");
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      setStatus({
        message: "사용자 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    if (userInfo.userId) {
      loadUserInfo(userInfo.userId);
    }
    if (UserId) {
      loadOwnerUserInfo(UserId);
    }
  }, []);

  // 프로필 이미지 업데이트 핸들러
  const handleProfileImageUpdate = (newImageUrl: string) => {
    setUserInfo((prev) => ({
      ...prev,
      profileImageUrl: newImageUrl,
    }));
  };

  // URL 표시/숨김 상태 관리
  const [showImageUrl, setShowImageUrl] = useState(false);

  // 프로필 이미지 관리 모달 상태 관리
  const [showProfileImageManager, setShowProfileImageManager] = useState(false);
  const hasUserId = UserId !== undefined && UserId !== null && UserId !== "";

  // 사용자 정보 모달 상태 추가
  const [showPersonalEditModal, setShowPersonalEditModal] = useState(false);

  return (
    <div style={{ padding: "40px" }}>
      <MainMenu />
      <h2>🧑 프로필 페이지</h2>

      {/* 사용자 정보 섹션 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          사용자 정보
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">로딩 중...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={
                  OwneruserInfo.profileImageUrl ||
                  "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
                }
                alt="프로필 이미지"
                className={`w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-lg ${
                  UserId === user?.userId
                    ? "cursor-pointer hover:opacity-80 transition-opacity"
                    : "cursor-default"
                }`}
                onClick={() =>
                  UserId === user?.userId && setShowProfileImageManager(true)
                }
                onError={(e) => {
                  e.currentTarget.src =
                    "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";
                }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {OwneruserInfo.userName}
                </h3>
                <p className="text-gray-600">{OwneruserInfo.userEmail}</p>
                <p className="text-sm text-gray-500">
                  ID: {OwneruserInfo.userId}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">
                  현재 프로필 이미지 URL
                </h4>
                <button
                  onClick={() => setShowImageUrl(!showImageUrl)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {showImageUrl ? "숨기기" : "보기"}
                </button>
              </div>
              {showImageUrl && (
                <p className="text-sm text-gray-600 break-all bg-white p-2 rounded border">
                  {OwneruserInfo.profileImageUrl}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => UserId && loadOwnerUserInfo(UserId)}
                disabled={isLoading || !UserId}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                정보 새로고침
              </button>
              {UserId === user?.userId && (
                <button
                  onClick={() => setShowPersonalEditModal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  개인정보 수정
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>

      <br />

      {hasUserId ? (
        <span>props로 전달된 사용자 ID: {UserId}</span>
      ) : (
        <span>props로 전달된 UserId가 없습니다.</span>
      )}
      {UserId === user?.userId ? (
        <span>✅ 나의 마이페이지</span>
      ) : (
        <span>❌ 다른 유저의 마이페이지</span>
      )}
      <span>
        사용자
        {user?.userNn ?? "null"}님
      </span>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${(OwneruserInfo?.userActivePoint ?? 0) / 100}%`,
            background: "orange",
          }}
        >
          <span className="progress-text">
            {OwneruserInfo?.userActivePoint ?? "0"}점
          </span>
        </div>
      </div>

      <ToggleBox userId={UserId} />

      {/* 상태 메시지 표시 */}
      {status && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            status.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : status.type === "error"
              ? "bg-red-100 text-red-800 border border-red-300"
              : "bg-blue-100 text-blue-800 border border-blue-300"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* 프로필 이미지 관리 모달 */}
      {showProfileImageManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                프로필 이미지 관리
              </h2>
              <button
                onClick={() => setShowProfileImageManager(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <ProfileImageEditor
              currentImageUrl={
                userInfo.profileImageUrl ||
                "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
              }
              userId={userInfo.userId}
              onImageUpdate={(newImageUrl) => {
                handleProfileImageUpdate(newImageUrl);
                setShowProfileImageManager(false);
              }}
              onStatusChange={(status) => setStatus(status)}
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowProfileImageManager(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보 수정 모달 (내용은 추후 구현) */}
      {showPersonalEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                개인정보 수정
              </h2>
              <button
                onClick={() => setShowPersonalEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            {/* 개인정보 수정 폼 */}
            <PersonalEditForm
              userInfo={OwneruserInfo}
              onClose={() => setShowPersonalEditModal(false)}
              onUpdate={(updated) => {
                setOwnerUserInfo((prev) => ({ ...prev, ...updated }));
                setShowPersonalEditModal(false);
                setStatus({
                  message: "개인정보가 성공적으로 수정되었습니다.",
                  type: "success",
                });
              }}
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
}: {
  userInfo: any;
  onClose: () => void;
  onUpdate: (updated: any) => void;
}) {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 이메일, 닉네임, 전화번호 업데이트
      await api.put(`/api/user-profile/${userInfo.userId}`, {
        userNn: form.userNn,
        userEmail: form.userEmail,
        userPhoneno: form.userPhoneno,
      });
      // 비밀번호 변경 요청 (입력된 경우만)
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
    } catch (err: any) {
      setError(err.response?.data?.message || "수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          닉네임
        </label>
        <input
          type="text"
          name="userNn"
          value={form.userNn}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일
        </label>
        <input
          type="email"
          name="userEmail"
          value={form.userEmail}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          전화번호
        </label>
        <input
          type="text"
          name="userPhoneno"
          value={form.userPhoneno}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 변경
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            name="showPassword"
            checked={form.showPassword}
            onChange={handleChange}
            className="mr-2"
          />
          <span>비밀번호 변경</span>
        </div>
        {form.showPassword && (
          <div className="space-y-2">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="현재 비밀번호"
              required
            />
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="새 비밀번호"
              required
            />
          </div>
        )}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          disabled={loading}
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
