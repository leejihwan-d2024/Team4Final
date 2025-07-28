import React, { useState, useEffect } from "react";
import api from "../api/GG_axiosInstance";

interface GiphyData {
  data: {
    id: string;
    title: string;
    url: string;
    rating: string;
    images: {
      original: {
        url: string;
        width: string;
        height: string;
      };
      fixed_height: {
        url: string;
        width: string;
        height: string;
      };
    };
  };
  meta: {
    status: number;
    msg: string;
  };
  usedTag?: string;
}

interface GiphyRandomGifProps {
  autoLoad?: boolean;
  showInfo?: boolean;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const GiphyRandomGif: React.FC<GiphyRandomGifProps> = ({
  autoLoad = true,
  showInfo = true,
  className = "",
  autoRefresh = false,
  refreshInterval = 5000,
}) => {
  const [gifData, setGifData] = useState<GiphyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const loadRandomGif = async () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);

    try {
      const response = await api.get<GiphyData>("/api/giphy/random-running");
      setGifData(response.data);
    } catch (err: any) {
      console.error("Giphy API 오류:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "GIF를 불러오는데 실패했습니다.";

      // 429 에러에 대한 특별한 메시지
      if (err.response?.status === 429 || errorMessage.includes("rate limit")) {
        setError(
          "Giphy API 속도 제한에 도달했습니다. 잠시 후 다시 시도해주세요. (1-2분 대기)"
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const clearGif = () => {
    setGifData(null);
    setError(null);
    setImageLoaded(false);
  };

  // 자동 새로고침 효과
  useEffect(() => {
    if (autoRefresh && imageLoaded && gifData) {
      const timer = setTimeout(() => {
        loadRandomGif();
      }, refreshInterval);

      return () => clearTimeout(timer);
    }
  }, [imageLoaded, gifData, autoRefresh, refreshInterval]);

  useEffect(() => {
    if (autoLoad) {
      loadRandomGif();
    }
  }, [autoLoad]);

  return (
    <div className={`giphy-random-gif ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* 버튼들 */}
        <div className="flex space-x-3">
          <button
            onClick={loadRandomGif}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-full font-semibold hover:from-red-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {loading ? "🔄 로딩 중..." : "🎲 랜덤 러닝 GIF"}
          </button>
          <button
            onClick={clearGif}
            className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-200 transform hover:scale-105"
          >
            🗑️ 지우기
          </button>
        </div>

        {/* GIF 컨테이너 */}
        <div className="w-full max-w-md">
          {loading && (
            <div className="text-center py-8 text-gray-600 italic">
              Giphy API에서 랜덤 러닝 GIF를 가져오는 중...
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <strong>오류 발생:</strong>
              <br />
              {error}
            </div>
          )}

          {gifData && !loading && !error && (
            <div className="text-center">
              <img
                src={gifData.data.images.original.url}
                alt={gifData.data.title}
                className="w-full rounded-lg shadow-lg"
                style={{ maxHeight: "400px", objectFit: "contain" }}
                onLoad={handleImageLoad}
              />
              <div className="mt-3 font-semibold text-gray-800">
                {gifData.data.title}
              </div>

              {showInfo && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <div>
                    <strong>등급:</strong> {gifData.data.rating.toUpperCase()}
                  </div>
                  <div>
                    <strong>ID:</strong> {gifData.data.id}
                  </div>
                  {gifData.usedTag && (
                    <div>
                      <strong>검색 태그:</strong> {gifData.usedTag}
                    </div>
                  )}
                  <div>
                    <strong>원본:</strong>{" "}
                    <a
                      href={gifData.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Giphy 페이지 보기
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {!gifData && !loading && !error && (
            <div className="text-center py-8 text-gray-500 italic border-2 border-dashed border-gray-300 rounded-lg">
              버튼을 클릭하여 랜덤 러닝 GIF를 가져오세요!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiphyRandomGif;
