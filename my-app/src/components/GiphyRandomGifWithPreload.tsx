import React, { useState, useEffect, useRef } from "react";
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

interface MultipleGiphyResponse {
  data: GiphyData[];
  count: number;
  success: boolean;
}

interface GiphyRandomGifWithPreloadProps {
  autoLoad?: boolean;
  showInfo?: boolean;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  preloadCount?: number;
}

const GiphyRandomGifWithPreload: React.FC<GiphyRandomGifWithPreloadProps> = ({
  autoLoad = true,
  showInfo = true,
  className = "",
  autoRefresh = false,
  refreshInterval = 5000,
  preloadCount = 5,
}) => {
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const [gifQueue, setGifQueue] = useState<GiphyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // GIF 큐에서 다음 GIF 가져오기
  const getNextGif = () => {
    if (gifQueue.length === 0) return null;

    const nextIndex = (currentGifIndex + 1) % gifQueue.length;
    setCurrentGifIndex(nextIndex);
    setImageLoaded(false);
    return gifQueue[nextIndex];
  };

  // 새로운 GIF 세트 로드
  const loadNewGifSet = async () => {
    setLoading(true);
    setError(null);
    setIsPreloading(true);

    try {
      const response = await api.get<MultipleGiphyResponse>(
        `/api/giphy/multiple-random-running?count=${preloadCount}`
      );

      if (response.data.success && response.data.data.length > 0) {
        setGifQueue(response.data.data);
        setCurrentGifIndex(0);
        setImageLoaded(false);
      } else {
        throw new Error("GIF 데이터를 가져올 수 없습니다.");
      }
    } catch (err: any) {
      console.error("Giphy API 오류:", err);
      const errorMessage = err.response?.data?.error || err.message || "GIF를 불러오는데 실패했습니다.";
      
      // 429 에러에 대한 특별한 메시지
      if (err.response?.status === 429 || errorMessage.includes('rate limit')) {
        setError('Giphy API 속도 제한에 도달했습니다. 잠시 후 다시 시도해주세요. (1-2분 대기)');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsPreloading(false);
    }
  };

  // 단일 GIF 로드 (기존 방식)
  const loadSingleGif = async () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);

    try {
      const response = await api.get<GiphyData>("/api/giphy/random-running");
      setGifQueue([response.data]);
      setCurrentGifIndex(0);
    } catch (err: any) {
      console.error("Giphy API 오류:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "GIF를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const clearGif = () => {
    setGifQueue([]);
    setCurrentGifIndex(0);
    setError(null);
    setImageLoaded(false);

    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
      preloadTimeoutRef.current = null;
    }
  };

  // 자동 새로고침 효과 (Preload 방식)
  useEffect(() => {
    if (autoRefresh && imageLoaded && gifQueue.length > 0) {
      // 다음 GIF가 준비되었는지 확인
      const nextIndex = (currentGifIndex + 1) % gifQueue.length;

      if (nextIndex === 0) {
        // 큐의 마지막에 도달했으면 새로운 세트 로드
        preloadTimeoutRef.current = setTimeout(() => {
          loadNewGifSet();
        }, refreshInterval);
      } else {
        // 큐에 남은 GIF가 있으면 다음 GIF로 이동
        preloadTimeoutRef.current = setTimeout(() => {
          setCurrentGifIndex(nextIndex);
          setImageLoaded(false);
        }, refreshInterval);
      }

      return () => {
        if (preloadTimeoutRef.current) {
          clearTimeout(preloadTimeoutRef.current);
        }
      };
    }
  }, [
    imageLoaded,
    currentGifIndex,
    gifQueue.length,
    autoRefresh,
    refreshInterval,
  ]);

  // 초기 로드
  useEffect(() => {
    if (autoLoad) {
      loadNewGifSet();
    }
  }, [autoLoad]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, []);

  const currentGif = gifQueue[currentGifIndex];

  return (
    <div className={`giphy-random-gif-preload ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* 버튼들 */}
        <div className="flex space-x-3">
          <button
            onClick={loadNewGifSet}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-full font-semibold hover:from-red-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {loading ? "🔄 로딩 중..." : `🎲 ${preloadCount}개 GIF 세트`}
          </button>
          <button
            onClick={getNextGif}
            disabled={gifQueue.length <= 1 || loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full font-semibold hover:from-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            ⏭️ 다음 GIF
          </button>
          <button
            onClick={clearGif}
            className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-200 transform hover:scale-105"
          >
            🗑️ 지우기
          </button>
        </div>

        {/* 상태 표시 */}
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>총 GIF: {gifQueue.length}개</span>
          <span>현재: {currentGifIndex + 1}번째</span>
          {isPreloading && (
            <span className="text-blue-600">🔄 미리 로딩 중...</span>
          )}
        </div>

        {/* GIF 컨테이너 */}
        <div className="w-full max-w-md">
          {loading && (
            <div className="text-center py-8 text-gray-600 italic">
              Giphy API에서 GIF 세트를 가져오는 중...
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <strong>오류 발생:</strong>
              <br />
              {error}
            </div>
          )}

          {currentGif && !loading && !error && (
            <div className="text-center">
              <img
                src={currentGif.data.images.original.url}
                alt={currentGif.data.title}
                className="w-full rounded-lg shadow-lg transition-opacity duration-300"
                style={{
                  maxHeight: "400px",
                  objectFit: "contain",
                  opacity: imageLoaded ? 1 : 0.7,
                }}
                onLoad={handleImageLoad}
              />
              <div className="mt-3 font-semibold text-gray-800">
                {currentGif.data.title}
              </div>

              {showInfo && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <div>
                    <strong>등급:</strong>{" "}
                    {currentGif.data.rating.toUpperCase()}
                  </div>
                  <div>
                    <strong>ID:</strong> {currentGif.data.id}
                  </div>
                  {currentGif.usedTag && (
                    <div>
                      <strong>검색 태그:</strong> {currentGif.usedTag}
                    </div>
                  )}
                  <div>
                    <strong>원본:</strong>{" "}
                    <a
                      href={currentGif.data.url}
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

          {!currentGif && !loading && !error && (
            <div className="text-center py-8 text-gray-500 italic border-2 border-dashed border-gray-300 rounded-lg">
              버튼을 클릭하여 GIF 세트를 가져오세요!
            </div>
          )}
        </div>

        {/* 자동 새로고침 상태 */}
        {autoRefresh && (
          <div className="text-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            🔄 자동 새로고침 활성화 (GIF 로드 완료 후 {refreshInterval / 1000}
            초마다)
          </div>
        )}
      </div>
    </div>
  );
};

export default GiphyRandomGifWithPreload;
