import React, { useState, useEffect } from "react";
import MainMenu from "../mainpage/MainMenu";
import ToggleBox from "./ToggleBox";
import { Link, useParams } from "react-router-dom";
import PasswordChangeForm from "../components/PasswordChangeForm";
import EmailChangeForm from "../components/EmailChangeForm";
import ProfileImageEditor from "../components/ProfileImageEditor";
import api from "../api/GG_axiosInstance";
import MyMeasure from "./MyMeasurement";

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
    profileImageUrl: user?.profileImageUrl || "",
    userPoint: user?.userPoint || "",
    userActivePoint: user?.userActivePoint || "",
  });
  const [OwneruserInfo, setOwnerUserInfo] = useState({
    userId: user?.userId || "",
    userNn: user?.userNn || "",
    userEmail: user?.userEmail || "",
    userName: user?.userName || user?.userNn || "",
    profileImageUrl: user?.profileImageUrl || "",
    userPoint: user?.userPoint || "",
    userActivePoint: user?.userActivePoint || "",
  });

  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false);

  // 상태 메시지 관리
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

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
          profileImageUrl:
            userData.userProfileImageUrl || profileImageUrl || "",
          userPoint: userData?.userPoint || "",
          userActivePoint: userData?.userActivePoint || "",
        });
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
          profileImageUrl:
            userData.userProfileImageUrl || profileImageUrl || "",
          userPoint: userData?.userPoint || "",
          userActivePoint: userData?.userActivePoint || "",
        });
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

  return (
    <div style={{ padding: "40px" }}>
      <MainMenu />
      <h2>🧑 프로필 페이지</h2>
      <Link
        to={`/mymeasure/${UserId}`}
        className="text-blue-700 hover:underline"
      >
        📞 측정데이터
      </Link>
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
                  userInfo.profileImageUrl ||
                  "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
                }
                alt="프로필 이미지"
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowProfileImageManager(true)}
                onError={(e) => {
                  e.currentTarget.src =
                    "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";
                }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {userInfo.userName}
                </h3>
                <p className="text-gray-600">{userInfo.userEmail}</p>
                <p className="text-sm text-gray-500">ID: {userInfo.userId}</p>
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
                  {userInfo.profileImageUrl}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => loadUserInfo(userInfo.userId)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                정보 새로고침
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

      {/* 계정 정보 변경 섹션 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          계정 정보 변경
        </h2>
        <div className="space-y-4">
          {/* 비밀번호 변경 */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              비밀번호 변경
            </h3>
            <PasswordChangeForm
              userId={userInfo.userId}
              onStatusChange={(message, type) => setStatus({ message, type })}
            />
          </div>

          {/* 이메일 변경 */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              이메일 변경
            </h3>
            <EmailChangeForm
              userId={userInfo.userId}
              currentEmail={userInfo.userEmail}
              onStatusChange={(message, type) => setStatus({ message, type })}
              onEmailChange={(newEmail) => {
                setUserInfo((prev) => ({
                  ...prev,
                  userEmail: newEmail,
                }));
              }}
            />
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default MyPage;
