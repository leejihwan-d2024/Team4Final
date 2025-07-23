import React, { useState } from "react";
import api from "../api/GG_axiosInstance";

interface EmailChangeFormProps {
  userId: string;
  currentEmail: string;
  onStatusChange: (message: string, type: "success" | "error") => void;
  onEmailChange: (newEmail: string) => void;
}

const EmailChangeForm: React.FC<EmailChangeFormProps> = ({
  userId,
  currentEmail,
  onStatusChange,
  onEmailChange,
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!newEmail) {
      onStatusChange("새 이메일을 입력해주세요.", "error");
      return;
    }

    if (!validateEmail(newEmail)) {
      onStatusChange("유효한 이메일 주소를 입력해주세요.", "error");
      return;
    }

    if (newEmail === currentEmail) {
      onStatusChange("현재 이메일과 동일한 이메일입니다.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put(`/api/user-profile/${userId}/email`, {
        newEmail,
      });

      if (response.data.success) {
        onStatusChange(response.data.message, "success");
        onEmailChange(newEmail);
        setNewEmail("");
        setShowForm(false);
      } else {
        onStatusChange(response.data.message, "error");
      }
    } catch (error: any) {
      console.error("이메일 변경 실패:", error);
      const message =
        error.response?.data?.message || "이메일 변경 중 오류가 발생했습니다.";
      onStatusChange(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        이메일 변경
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">이메일 변경</h3>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          현재 이메일: <span className="font-medium">{currentEmail}</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            새 이메일
          </label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="새 이메일을 입력하세요"
            required
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? "변경 중..." : "이메일 변경"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setNewEmail("");
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

export default EmailChangeForm;
