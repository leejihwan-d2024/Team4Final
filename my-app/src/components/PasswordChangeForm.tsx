import React, { useState } from "react";
import api from "../api/GG_axiosInstance";

interface PasswordChangeFormProps {
  userId: string;
  onStatusChange: (message: string, type: "success" | "error") => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  userId,
  onStatusChange,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      onStatusChange("모든 필드를 입력해주세요.", "error");
      return;
    }

    if (newPassword.length < 6) {
      onStatusChange("새 비밀번호는 6자 이상이어야 합니다.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      onStatusChange(
        "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        "error"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put(`/api/user-profile/${userId}/password`, {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        onStatusChange(response.data.message, "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowForm(false);
      } else {
        onStatusChange(response.data.message, "error");
      }
    } catch (error: any) {
      console.error("비밀번호 변경 실패:", error);
      const message =
        error.response?.data?.message ||
        "비밀번호 변경 중 오류가 발생했습니다.";
      onStatusChange(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        비밀번호 변경
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">비밀번호 변경</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            현재 비밀번호
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="현재 비밀번호를 입력하세요"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            새 비밀번호
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="새 비밀번호를 입력하세요 (6자 이상)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="새 비밀번호를 다시 입력하세요"
            required
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? "변경 중..." : "비밀번호 변경"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
