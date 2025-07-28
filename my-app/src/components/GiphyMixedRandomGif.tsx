import React, { useState, useEffect, useRef } from "react";
import api from "../api/GG_axiosInstance";

interface GiphyMixedRandomGifProps {
  autoLoad?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showInfo?: boolean;
  cleanMode?: boolean;
}

const GiphyMixedRandomGif: React.FC<GiphyMixedRandomGifProps> = ({
  autoLoad = true,
  autoRefresh = false,
  refreshInterval = 10000,
  showInfo = true,
  cleanMode = false,
}) => {
  const [gifList, setGifList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<string[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(3000); // 3초
  const [currentGifDuration, setCurrentGifDuration] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // API 호출 함수
  const loadMixedRandomGifs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/giphy/mixed-random");
      const data = response.data;

      if (data.success && data.data) {
        setGifList(data.data);
        setTotalCount(data.data.length);
        setCurrentIndex(0);

        // 3개씩 preload 시작
        preloadNextBatch(0);

        // 경고 메시지가 있으면 표시
        if (data.warning) {
          console.warn("Giphy API 경고:", data.warning);
        }
      } else {
        setError(data.error || "GIF를 불러오는데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Giphy Mixed API 오류:", err);
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

  // 3개씩 preload하는 함수
  const preloadNextBatch = (startIndex: number) => {
    if (startIndex >= gifList.length) return;

    setIsPreloading(true);
    setLoadedCount(0);

    const endIndex = Math.min(startIndex + 3, gifList.length);
    const batch = gifList.slice(startIndex, endIndex);
    const newPreloadedImages: string[] = [];

    let loadedInBatch = 0;

    batch.forEach((gif, index) => {
      const gifUrl = gif.data?.images?.original?.url;
      if (!gifUrl) return;

      const img = new Image();
      img.onload = () => {
        loadedInBatch++;
        newPreloadedImages.push(gifUrl);

        if (loadedInBatch === batch.length) {
          // 현재 배치의 모든 이미지가 로드됨
          setPreloadedImages((prev) => [...prev, ...newPreloadedImages]);
          setLoadedCount(loadedInBatch);
          setIsPreloading(false);

          // 다음 배치가 있으면 preload 시작
          if (endIndex < gifList.length) {
            setTimeout(() => preloadNextBatch(endIndex), 1000);
          }
        }
      };
      img.onerror = () => {
        loadedInBatch++;
        if (loadedInBatch === batch.length) {
          setIsPreloading(false);
        }
      };
      img.src = gifUrl;
    });
  };

  // 다음 GIF로 이동
  const nextGif = () => {
    if (gifList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % gifList.length);

    // 자동 진행 재시작
    if (autoAdvance) {
      startAutoAdvance();
    }
  };

  // GIF 재생 시간 계산 (밀리초)
  const calculateGifDuration = (gifUrl: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // GIF의 실제 재생 시간을 추정
        // 일반적으로 GIF는 10-15fps 정도로 재생됨
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(3000); // 기본값 3초
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // GIF의 실제 재생 시간을 측정하는 더 정확한 방법
        let frameCount = 0;
        let lastFrameTime = Date.now();
        let totalDuration = 0;

        const drawFrame = () => {
          const currentTime = Date.now();
          const frameTime = currentTime - lastFrameTime;
          lastFrameTime = currentTime;

          ctx.drawImage(img, 0, 0);
          frameCount++;
          totalDuration += frameTime;

          // GIF가 실제로 재생되는 동안만 측정
          // 최대 10초까지 측정하되, 프레임 간격이 일정하지 않으면 중단
          if (totalDuration < 10000 && frameTime < 200) {
            // 200ms 이상 간격이면 중단
            requestAnimationFrame(drawFrame);
          } else {
            // 측정된 시간을 기반으로 재생 시간 추정
            const estimatedDuration = Math.max(totalDuration, 3000); // 최소 3초
            resolve(estimatedDuration);
          }
        };

        drawFrame();
      };

      img.onerror = () => {
        resolve(3000); // 에러 시 기본값
      };

      img.src = gifUrl;
    });
  };

  // 자동 진행 시작
  const startAutoAdvance = () => {
    // 기존 타이머 정리
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
    }

    // 고정된 시간 간격 사용 (더 안정적)
    let delay = 5000; // 기본 5초

    // 현재 GIF 정보 표시용
    const currentGif = gifList[currentIndex];
    setCurrentGifDuration(delay);

    // 새 타이머 설정
    autoAdvanceRef.current = setTimeout(() => {
      if (autoAdvance && gifList.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % gifList.length);
        startAutoAdvance(); // 재귀적으로 다음 타이머 설정
      }
    }, delay);
  };

  // 자동 진행 정지
  const stopAutoAdvance = () => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  };

  // 이전 GIF로 이동
  const prevGif = () => {
    if (gifList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + gifList.length) % gifList.length);

    // 자동 진행 재시작
    if (autoAdvance) {
      startAutoAdvance();
    }
  };

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh && !loading) {
      intervalRef.current = setInterval(() => {
        loadMixedRandomGifs();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loading]);

  // 자동 진행 설정
  useEffect(() => {
    if (autoAdvance && gifList.length > 0 && !loading) {
      startAutoAdvance();
    } else {
      stopAutoAdvance();
    }

    return () => {
      stopAutoAdvance();
    };
  }, [autoAdvance, gifList.length, loading, autoAdvanceDelay]);

  // 초기 로드
  useEffect(() => {
    if (autoLoad) {
      loadMixedRandomGifs();
    }
  }, [autoLoad]);

  // 현재 GIF 정보
  const currentGif = gifList[currentIndex];
  const gifUrl = currentGif?.data?.images?.original?.url;
  const source = currentGif?.source;
  const usedTag = currentGif?.usedTag;
  const order = currentGif?.order;

  return (
    <div
      style={{
        border: cleanMode ? "none" : "2px solid #ddd",
        borderRadius: cleanMode ? "0" : "10px",
        padding: cleanMode ? "0" : "20px",
        margin: cleanMode ? "0" : "10px",
        backgroundColor: cleanMode ? "transparent" : "#f9f9f9",
        maxWidth: cleanMode ? "100%" : "500px",
      }}
    >
      {!cleanMode && (
        <h3 style={{ marginBottom: "15px", color: "#333" }}>
          🎬 혼합 랜덤 GIF (Giphy + 사용자 URL)
        </h3>
      )}

      {/* 로딩 상태 */}
      {loading && !cleanMode && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div>🔄 GIF 로딩 중...</div>
        </div>
      )}

      {/* Preload 상태 */}
      {isPreloading && !cleanMode && (
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            backgroundColor: "#e3f2fd",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        >
          <div>📥 Preload 중... ({loadedCount}/3)</div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !cleanMode && (
        <div
          style={{
            color: "red",
            padding: "10px",
            backgroundColor: "#ffebee",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* GIF 표시 */}
      {gifUrl && !loading && (
        <div
          style={{
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: cleanMode ? "400px" : "auto",
          }}
        >
          <img
            ref={(el) => {
              imageRefs.current[currentIndex] = el;
            }}
            src={gifUrl}
            alt="Random Running GIF"
            style={{
              maxWidth: "100%",
              maxHeight: cleanMode ? "400px" : "300px",
              borderRadius: cleanMode ? "0" : "8px",
              border: cleanMode ? "none" : "1px solid #ccc",
              display: "block",
              margin: "0 auto",
            }}
            onLoad={() => {
              // 이미지 로드 완료 시 처리
            }}
          />

          {/* 정보 표시 */}
          {showInfo && !cleanMode && (
            <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
              <div>📍 순서: {order}/4</div>
              <div>
                🔗 출처:{" "}
                {source === "giphy"
                  ? "Giphy API"
                  : source === "user_url_fallback"
                  ? "사용자 URL (대체)"
                  : "사용자 URL"}
              </div>
              {usedTag && <div>🏷️ 태그: {usedTag}</div>}
              {currentGif?.fallback_reason && (
                <div style={{ color: "#ff9800", fontSize: "12px" }}>
                  ⚠️ 대체 사유:{" "}
                  {currentGif.fallback_reason === "429_rate_limit"
                    ? "API 제한"
                    : "API 오류"}
                </div>
              )}
            </div>
          )}

          {/* 네비게이션 버튼 */}
          {!cleanMode && (
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={prevGif}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                ⬅️ 이전
              </button>
              <span
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "5px",
                }}
              >
                {currentIndex + 1} / {gifList.length}
              </span>
              <button
                onClick={nextGif}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                다음 ➡️
              </button>
            </div>
          )}

          {/* 자동 진행 컨트롤 */}
          {!cleanMode && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: autoAdvance ? "#4caf50" : "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {autoAdvance ? "⏸️ 자동정지" : "▶️ 자동시작"}
              </button>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {autoAdvance ? "5.0초 간격" : "수동 모드"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 컨트롤 버튼 */}
      {!cleanMode && (
        <div
          style={{
            marginTop: "15px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={loadMixedRandomGifs}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            🔄 새로고침
          </button>
        </div>
      )}

      {/* 상태 정보 */}
      {!cleanMode && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "#999",
            textAlign: "center",
          }}
        >
          <div>
            총 {gifList.length}개 GIF | Preloaded: {preloadedImages.length}개
          </div>
          <div>
            패턴:{" "}
            {gifList.length > 0 && gifList[0]?.source === "user_url_fallback"
              ? "사용자 URL만 (API 오류)"
              : "Giphy → URL → Giphy → URL"}
          </div>
          <div>{autoAdvance ? "🔄 5초 간격 자동 진행" : "⏸️ 수동 모드"}</div>
        </div>
      )}
    </div>
  );
};

export default GiphyMixedRandomGif;
