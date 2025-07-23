import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/GG_axiosInstance";
import PasswordChangeForm from "../components/PasswordChangeForm";
import EmailChangeForm from "../components/EmailChangeForm";

// 타입 정의
interface User {
  userNn?: string;
  userId?: string;
  userEmail?: string;
  profileImageUrl?: string;
}

interface UserInfo {
  userId: string;
  userName: string;
  userEmail: string;
  profileImageUrl: string;
  provider?: string; // 카카오, 일반 사용자 구분용
}

// ProfileImageEditor 컴포넌트 정의
interface ProfileImageEditorProps {
  currentImageUrl: string;
  userId: string;
  onImageUpdate: (newImageUrl: string) => void;
  onStatusChange: (status: {
    message: string;
    type: "success" | "error" | "info";
  }) => void;
}

const ProfileImageEditor: React.FC<ProfileImageEditorProps> = ({
  currentImageUrl,
  userId,
  onImageUpdate,
  onStatusChange,
}) => {
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [isValid, setIsValid] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // currentImageUrl이 변경될 때 내부 상태 동기화
  useEffect(() => {
    setImageUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setIsValid(url === "" || url.startsWith("http"));
  };

  const handleUpdate = async () => {
    if (!isValid || !imageUrl || !userId) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await api.put(`/api/profile/${userId}`, {
        imageUrl: imageUrl.trim(),
      });

      if (response.data.success) {
        onImageUpdate(imageUrl.trim());
        onStatusChange({
          message: "프로필 이미지가 업데이트되었습니다!",
          type: "success",
        });
      } else {
        onStatusChange({
          message: response.data.message || "업데이트에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("프로필 이미지 업데이트 실패:", error);

      // 네트워크 오류와 서버 오류를 구분
      if (error.code === "NETWORK_ERROR" || !error.response) {
        onStatusChange({
          message: "네트워크 연결을 확인해주세요.",
          type: "error",
        });
      } else {
        onStatusChange({
          message: `업데이트 실패: ${
            error.response?.data?.message || error.message
          }`,
          type: "error",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!userId) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await api.delete(`/api/profile/${userId}`);
      if (response.data.success) {
        const defaultUrl =
          "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";
        setImageUrl(defaultUrl);
        onImageUpdate(defaultUrl);
        onStatusChange({
          message: "프로필 이미지가 기본값으로 초기화되었습니다.",
          type: "success",
        });
      } else {
        onStatusChange({
          message: response.data.message || "초기화에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("프로필 이미지 초기화 실패:", error);

      // 네트워크 오류와 서버 오류를 구분
      if (error.code === "NETWORK_ERROR" || !error.response) {
        onStatusChange({
          message: "네트워크 연결을 확인해주세요.",
          type: "error",
        });
      } else {
        onStatusChange({
          message: `초기화 실패: ${
            error.response?.data?.message || error.message
          }`,
          type: "error",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이미지 URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={handleUrlChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            isValid
              ? "border-gray-300 focus:ring-blue-500"
              : "border-red-500 focus:ring-red-500"
          }`}
          placeholder="https://example.com/image.jpg"
          disabled={isUpdating}
        />
        {!isValid && (
          <p className="text-red-500 text-sm mt-1">
            유효한 URL을 입력해주세요.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          disabled={!isValid || !imageUrl || isUpdating}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {isUpdating ? "업데이트 중..." : "업데이트"}
        </button>
        <button
          onClick={handleReset}
          disabled={isUpdating}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400"
        >
          {isUpdating ? "초기화 중..." : "기본값으로 초기화"}
        </button>
      </div>

      {imageUrl && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">미리보기</h4>
          <img
            src={
              imageUrl ||
              "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
            }
            alt="프로필 미리보기"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
            onError={(e) => {
              e.currentTarget.src =
                "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";
            }}
          />
        </div>
      )}
    </div>
  );
};

const TestMain: React.FC = () => {
  const navigate = useNavigate();
  const hasLogged = useRef(false);

  // 로컬 스토리지에서 사용자 정보 가져오기
  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;

  const [userInfo, setUserInfo] = useState<UserInfo>({
    userId: user?.userId || "",
    userName: user?.userNn || "사용자",
    userEmail: user?.userEmail || "user@example.com",
    profileImageUrl: "",
    provider: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // 상태 메시지 자동 제거
  useEffect(() => {
    if (status && status.type === "success") {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // loadUserInfo 함수를 useCallback으로 감싸서 무한 루프 방지
  const loadUserInfo = useCallback(async (userId: string) => {
    console.log("=== loadUserInfo 실행 ===");
    console.log("userId:", userId);

    if (!userId) {
      console.log("사용자 ID가 없음");
      setStatus({ message: "사용자 ID가 없습니다.", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      console.log("API 호출 시작:", `/api/profile/${userId}`);
      // 실제 API 호출
      const response = await api.get(`/api/profile/${userId}`);
      console.log("API 응답:", response.data);

      if (response.data.success) {
        const imageUrl = response.data.imageUrl || "";
        const provider = response.data.provider || "";
        console.log("설정할 이미지 URL:", imageUrl);
        console.log("사용자 provider:", provider);
        setUserInfo((prev) => ({
          ...prev,
          profileImageUrl: imageUrl,
          provider: provider,
        }));
        setStatus({
          message: "사용자 정보가 로드되었습니다.",
          type: "success",
        });
      } else {
        console.log("API 성공했지만 데이터 없음");
        // API 호출은 성공했지만 데이터가 없는 경우 기본 이미지 설정
        const defaultImageUrl =
          "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";
        setUserInfo((prev) => ({
          ...prev,
          profileImageUrl: defaultImageUrl,
        }));
        setStatus({
          message: "기본 프로필 이미지가 설정되었습니다.",
          type: "info",
        });
      }
    } catch (error: any) {
      console.error("사용자 정보 로드 실패:", error);

      // 네트워크 오류와 서버 오류를 구분
      if (error.code === "NETWORK_ERROR" || !error.response) {
        console.log("네트워크 오류");
        setStatus({
          message: "네트워크 연결을 확인해주세요.",
          type: "error",
        });
      } else {
        console.log("서버 오류:", error.response?.data);
        // 서버 오류 시에도 기본 이미지 설정
        const defaultImageUrl =
          "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";
        setUserInfo((prev) => ({
          ...prev,
          profileImageUrl: defaultImageUrl,
        }));
        setStatus({
          message: `사용자 정보 로드 실패: ${
            error.response?.data?.message || error.message
          }`,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
      console.log("=== loadUserInfo 완료 ===");
    }
  }, []);

  // 페이지 로드 시 사용자 정보 조회 (한 번만 실행)
  useEffect(() => {
    console.log("=== useEffect 실행 ===");
    console.log("user?.userId:", user?.userId);

    // 로그인 상태 확인
    if (!user) {
      console.log("사용자가 없음 - 로그인 페이지로 이동");
      setStatus({
        message: "로그인이 필요합니다. 로그인 페이지로 이동합니다.",
        type: "error",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    // 사용자 ID가 있는 경우에만 처리
    if (user.userId) {
      console.log("사용자 정보 로드 시작:", user.userId);
      // 사용자 정보 업데이트 (한 번만)
      setUserInfo((prev) => ({
        ...prev,
        userId: user.userId!,
        userName: user.userNn || user.userId || "사용자",
        userEmail: user.userEmail || "user@example.com",
      }));

      // 사용자 정보 로드
      loadUserInfo(user.userId);
    } else {
      console.log("사용자 ID가 없음:", user.userId);
    }
  }, [user?.userId]); // user.userId만 의존성으로 설정

  const handleProfileImageUpdate = (newImageUrl: string) => {
    setUserInfo((prev) => ({
      ...prev,
      profileImageUrl: newImageUrl,
    }));

    setStatus({
      message: "프로필 이미지가 업데이트되었습니다!",
      type: "success",
    });
  };

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
    navigate("/main");
  };

  const handleGoToHome = (): void => {
    navigate("/FirstPage");
  };

  // 카카오 로그인 여부 확인 (userId가 kakao_로 시작하거나, 닉네임이 카카오사용자_로 시작하는지 확인)
  const isKakaoUser =
    user?.userId?.startsWith("kakao_") ||
    user?.userNn?.startsWith("카카오사용자_");

  // 디버깅 로그 추가 (개발 환경에서만, 한 번만 실행)
  if (!hasLogged.current && process.env.NODE_ENV === "development") {
    console.log("=== TestMain 페이지 - 사용자 정보 확인 ===");
    console.log("localStorage user string:", userString);
    console.log("파싱된 사용자 정보:", user);
    console.log("카카오 사용자 여부:", isKakaoUser);
    console.log("================================");
    hasLogged.current = true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            테스트 메인 페이지
          </h1>
          <p className="text-gray-600">프로필 이미지 URL 관리 테스트</p>
        </div>

        {/* 상태 메시지 */}
        {status && (
          <div
            className={`p-4 rounded-lg text-center font-medium mb-6 ${
              status.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : status.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사용자 정보 섹션 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
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
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-lg"
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
                    <p className="text-sm text-gray-500">
                      ID: {userInfo.userId}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    현재 프로필 이미지 URL
                  </h4>
                  <p className="text-sm text-gray-600 break-all bg-white p-2 rounded border">
                    {userInfo.profileImageUrl}
                  </p>
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

          {/* 프로필 이미지 편집 섹션 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              프로필 이미지 관리
            </h2>
            <ProfileImageEditor
              currentImageUrl={
                userInfo.profileImageUrl ||
                "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
              }
              userId={userInfo.userId}
              onImageUpdate={handleProfileImageUpdate}
              onStatusChange={setStatus}
            />
          </div>

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
                  onStatusChange={(message, type) =>
                    setStatus({ message, type })
                  }
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
                  onStatusChange={(message, type) =>
                    setStatus({ message, type })
                  }
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
        </div>

        {/* 추가 기능 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            추가 기능
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">URL 테스트</h3>
              <p className="text-sm text-blue-600">
                이미지 URL의 유효성을 실시간으로 확인할 수 있습니다.
              </p>
              
            </div>
                  
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                실시간 미리보기
              </h3>
              <p className="text-sm text-green-600">
                입력한 URL의 이미지를 즉시 미리보기로 확인할 수 있습니다.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">
                기본값 초기화
              </h3>
              <p className="text-sm text-purple-600">
                프로필 이미지를 기본 이미지로 되돌릴 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* API 테스트 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            API 테스트
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={async () => {
                  if (!userInfo.userId) {
                    setStatus({
                      message: "사용자 ID가 없습니다.",
                      type: "error",
                    });
                    return;
                  }
                  try {
                    const response = await api.get(
                      `/api/profile/${userInfo.userId}`
                    );
                    setStatus({
                      message: `조회 성공: ${response.data.imageUrl}`,
                      type: "success",
                    });
                  } catch (error: any) {
                    setStatus({
                      message: `조회 실패: ${
                        error.response?.data?.message || error.message
                      }`,
                      type: "error",
                    });
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                프로필 조회 테스트
              </button>

              {/* 카카오 사용자가 아닌 경우에만 프로필 이미지 관련 버튼들 표시 */}
              {userInfo.provider !== "KAKAO" && (
                <>
                  <button
                    onClick={async () => {
                      if (!userInfo.userId) {
                        setStatus({
                          message: "사용자 ID가 없습니다.",
                          type: "error",
                        });
                        return;
                      }
                      try {
                        const response = await api.put(
                          `/api/profile/${userInfo.userId}`,
                          {
                            imageUrl: userInfo.profileImageUrl,
                          }
                        );
                        setStatus({
                          message: `업데이트 성공: ${response.data.message}`,
                          type: "success",
                        });
                      } catch (error: any) {
                        setStatus({
                          message: `업데이트 실패: ${
                            error.response?.data?.message || error.message
                          }`,
                          type: "error",
                        });
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    프로필 업데이트 테스트
                  </button>

                  <button
                    onClick={async () => {
                      if (!userInfo.userId) {
                        setStatus({
                          message: "사용자 ID가 없습니다.",
                          type: "error",
                        });
                        return;
                      }
                      try {
                        // 카카오 사용자 테스트용 이미지 URL
                        const testImageUrl =
                          "https://cdn.pixabay.com/photo/2023/07/30/00/12/cat-8157889_1280.png";
                        const response = await api.put(
                          `/api/profile/kakao/${userInfo.userId}`,
                          {
                            imageUrl: testImageUrl,
                          }
                        );
                        setStatus({
                          message: `카카오 프로필 업데이트 성공: ${response.data.message}`,
                          type: "success",
                        });
                        // 성공 시 로컬 상태도 업데이트
                        setUserInfo((prev) => ({
                          ...prev,
                          profileImageUrl: testImageUrl,
                        }));
                      } catch (error: any) {
                        setStatus({
                          message: `카카오 프로필 업데이트 실패: ${
                            error.response?.data?.message || error.message
                          }`,
                          type: "error",
                        });
                      }
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    카카오 프로필 테스트
                  </button>
                </>
              )}

              {/* 카카오 사용자인 경우 안내 메시지 표시 */}
              {userInfo.provider === "KAKAO" && (
                <div className="px-4 py-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
                  <p className="text-sm">
                    <strong>카카오 사용자</strong>: 프로필 이미지는 카카오
                    계정에서 관리됩니다.
                  </p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 네비게이션 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            페이지 이동
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={handleGoToLogin}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              로그인 페이지
            </button>
            <button
              onClick={handleGoToJoin}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              메인 페이지
            </button>
            <button
              onClick={handleGoToHome}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              첫 페이지
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMain;
