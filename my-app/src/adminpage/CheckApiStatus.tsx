import React, { useEffect, useState } from "react";
import api from "../api/GG_axiosInstance";

interface ApiStatus {
  code: number | null;
  text: string;
  color: string;
  emoji: string;
}

interface CheckStatusProps {
  path: string;
  method?: "get" | "post" | "put" | "delete";
  title?: string; // ✅ 선택적 title 추가
}

const getStatusStyle = (statusCode: number | null): ApiStatus => {
  if (statusCode === null) {
    return { code: null, text: "확인 중...", color: "gray", emoji: "⏳" };
  }
  if (statusCode >= 200 && statusCode < 300) {
    return {
      code: statusCode,
      text: `${statusCode} 정상 연결`,
      color: "green",
      emoji: "📡",
    };
  } else if (statusCode >= 400 && statusCode < 500) {
    return {
      code: statusCode,
      text: `${statusCode} 클라이언트 오류`,
      color: "orange",
      emoji: "⚠️",
    };
  } else if (statusCode >= 500) {
    return {
      code: statusCode,
      text: `${statusCode} 서버 오류`,
      color: "red",
      emoji: "⛔",
    };
  }
  return {
    code: statusCode,
    text: `${statusCode} 알 수 없음`,
    color: "gray",
    emoji: "❓",
  };
};

const CheckStatus: React.FC<CheckStatusProps> = ({
  path,
  method = "get",
  title,
}) => {
  const [status, setStatus] = useState<ApiStatus>(getStatusStyle(null));

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await api.request({ url: path, method });
        setStatus(getStatusStyle(response.status));
      } catch (error: any) {
        if (error.response) {
          setStatus(getStatusStyle(error.response.status));
        } else {
          setStatus({
            code: 0,
            text: "연결 실패 (네트워크 오류)",
            color: "gray",
            emoji: "❌",
          });
        }
      }
    };

    checkApi();
  }, [path, method]);

  return (
    <div style={{ fontWeight: "bold", padding: "8px", color: status.color }}>
      {/* ✅ title이 있으면 title 출력, 없으면 path 출력 */}
      {title ?? path} : {status.emoji} {status.text}
    </div>
  );
};

export default CheckStatus;
