import React, { useState } from "react";
import axios from "axios";

interface ProfileImageEditorProps {
  currentImageUrl?: string;
  userId: string;
  onImageUpdate?: (newUrl: string) => void;
}

const ProfileImageEditor: React.FC<ProfileImageEditorProps> = ({
  currentImageUrl = "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg",
  userId,
  onImageUpdate,
}) => {
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [newUrl, setNewUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [previewImage, setPreviewImage] = useState(currentImageUrl);

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
    const url = newUrl.trim();

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

  const startEditing = () => {
    setIsEditing(true);
    setNewUrl(imageUrl);
    setPreviewImage(imageUrl);
    setStatus(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNewUrl("");
    setPreviewImage(imageUrl);
    setStatus(null);
  };

  const updateImageUrl = async () => {
    const url = newUrl.trim();

    if (!url) {
      setStatus({ message: "URL을 입력해주세요.", type: "error" });
      return;
    }

    if (!isValidImageUrl(url)) {
      setStatus({ message: "유효한 이미지 URL이 아닙니다.", type: "error" });
      return;
    }

    setIsLoading(true);
    setStatus({ message: "프로필 이미지를 업데이트하는 중...", type: "info" });

    try {
      // 백엔드 API 호출
      const response = await axios.post("/api/profile/update-url", null, {
        params: {
          userId: userId,
          imageUrl: url,
        },
      });

      if (response.data.success) {
        setImageUrl(url);
        setPreviewImage(url);
        setIsEditing(false);
        setStatus({
          message: "프로필 이미지가 성공적으로 업데이트되었습니다!",
          type: "success",
        });

        // 부모 컴포넌트에 알림
        if (onImageUpdate) {
          onImageUpdate(url);
        }

        setTimeout(() => {
          setStatus(null);
        }, 3000);
      } else {
        setStatus({
          message:
            response.data.message || "프로필 이미지 업데이트에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Profile image update error:", error);
      setStatus({
        message:
          error.response?.data?.message ||
          "프로필 이미지 업데이트 중 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefault = () => {
    const defaultUrl =
      "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";
    setImageUrl(defaultUrl);
    setPreviewImage(defaultUrl);
    setStatus({
      message: "프로필 이미지가 기본값으로 초기화되었습니다.",
      type: "info",
    });

    if (onImageUpdate) {
      onImageUpdate(defaultUrl);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        프로필 이미지 관리
      </h3>

      {/* 현재 이미지 표시 */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <img
            src={imageUrl}
            alt="프로필 이미지"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">미리보기</span>
            </div>
          )}
        </div>
      </div>

      {/* 편집 모드 */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              새로운 이미지 URL
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="새로운 이미지 URL을 입력하세요"
              disabled={isLoading}
            />
          </div>

          {/* 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">미리보기</p>
            <img
              src={previewImage}
              alt="미리보기"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 mx-auto"
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={testImageUrl}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400"
            >
              URL 테스트
            </button>
            <button
              onClick={updateImageUrl}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? "업데이트 중..." : "업데이트"}
            </button>
            <button
              onClick={cancelEditing}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-500 text-white rounded-full text-sm font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-400"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        /* 일반 모드 */
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">현재 이미지 URL</p>
            <p className="text-xs text-gray-500 break-all bg-gray-100 p-2 rounded">
              {imageUrl}
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              URL 수정
            </button>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-gray-500 text-white rounded-full text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              기본값으로 초기화
            </button>
          </div>
        </div>
      )}

      {/* 상태 메시지 */}
      {status && (
        <div
          className={`p-3 rounded-lg text-center text-sm font-medium ${
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
    </div>
  );
};

export default ProfileImageEditor;
