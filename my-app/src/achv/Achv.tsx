import React, { useState, useEffect } from "react";
import "./achv.css";
import { useNavigate } from "react-router-dom";

interface Achievement {
  id: string;
  title: string;
  currentValue: number;
  maxPoint: number;
  claimed: boolean;
  description: string;
}

interface BadgeRewardResponse {
  result: "SUCCESS" | "ALREADY_CLAIMED" | "NO_REWARD_MAPPING";
  badgeName?: string;
  badgeImageUrl?: string;
}

function Achv() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const userId = "1";

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(
          `https://localhost:8080/api/achievements/user/${userId}`
        );
        if (!response.ok) throw new Error("서버 응답 실패");

        const data = await response.json();
        console.log("📥 원본 응답:", data);

        const mappedData = data.map((item: any, index: number) => ({
          id: item.achvId?.toString() ?? item.achv_id ?? `fallback-${index}`,
          title: item.achvTitle ?? item.achv_title ?? "제목 없음",
          description: item.achvContent ?? "",
          currentValue: parseInt(item.currentValue) || 0,
          maxPoint: parseInt(item.achvMaxPoint) || 1,
          claimed: item.isComplate === "Y", // ✅ 수정됨
        }));

        console.log("📦 매핑 후 업적 목록:", mappedData);
        setAchievements(mappedData);
      } catch (err) {
        console.error("업적 데이터 로드 실패:", err);
        alert("업적을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  const getProgressPercent = (currentValue: number, maxPoint: number) => {
    if (!maxPoint || isNaN(currentValue) || isNaN(maxPoint)) return 0;
    return Math.min(100, Math.round((currentValue / maxPoint) * 100));
  };

  const handleClaim = async (achvId: string) => {
    setClaimingId(achvId);
    try {
      const response = await fetch(
        `https://localhost:8080/api/achievements/reward?userId=${userId}&achvId=${achvId}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("보상 요청 실패");

      const result: BadgeRewardResponse = await response.json();

      if (result.result === "SUCCESS") {
        const popup = window.open(
          "",
          "_blank",
          "width=380,height=480,top=180,left=600"
        );

        if (popup) {
          popup.document.write(`
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <title>🎖️ 뱃지 획득</title>
          <style>
            body {
              margin: 0;
              font-family: "Segoe UI", sans-serif;
              background: linear-gradient(135deg, #f0f4f8, #ffffff);
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .popup-container {
              background: #fff;
              padding: 30px 24px;
              border-radius: 20px;
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
              text-align: center;
              animation: fadeIn 0.5s ease-out;
              max-width: 320px;
            }
            .popup-title {
              font-size: 1.6rem;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 16px;
            }
            .popup-image {
              width: 140px;
              height: 140px;
              object-fit: cover;
              border-radius: 16px;
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
              margin-bottom: 16px;
            }
            .popup-message {
              font-size: 1rem;
              color: #4a4a4a;
              margin-top: 10px;
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.85);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          </style>
        </head>
        <body>
          <div class="popup-container">
            <div class="popup-title">🎉 ${result.badgeName} 획득!</div>
            <img src="${result.badgeImageUrl}" alt="badge" class="popup-image" />
            <div class="popup-message">프로필에서 확인해보세요!</div>
          </div>
        </body>
      </html>
    `);
        }
        setAchievements((prev) =>
          prev.map((achv) =>
            achv.id === achvId ? { ...achv, claimed: true } : achv
          )
        );
      } else if (result.result === "ALREADY_CLAIMED") {
        alert("이미 보상을 받았습니다.");
      } else {
        alert("보상 정보가 없습니다.");
      }
    } catch (error) {
      alert("보상 처리 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setClaimingId(null);
    }
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="achievement-page">
      <div className="header">
        <h1>🏆 나의 업적</h1>
        <button className="menu-button" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="menu-bar">
          <ul>
            <li
              onClick={() => {
                navigate("/profile");
                setMenuOpen(false);
              }}
            >
              프로필
            </li>
            <li
              onClick={() => {
                navigate("/settings");
                setMenuOpen(false);
              }}
            >
              설정
            </li>
            <li
              onClick={() => {
                alert("🔒 로그아웃 되었습니다!");
                setMenuOpen(false);
              }}
            >
              로그아웃
            </li>
          </ul>
        </div>
      )}

      {loading ? (
        <div className="loading">업적을 불러오는 중...</div>
      ) : (
        <div className="achievement-list">
          {achievements.map((achv, index) => {
            const progressPercent = getProgressPercent(
              achv.currentValue,
              achv.maxPoint
            );

            const isClaimable = progressPercent >= 100 && !achv.claimed;

            return (
              <div
                key={`achv-${achv.id || `idx-${index}`}`} // ✅ 수정: key 중복 방지 fallback 추가
                className="achievement-card"
                onClick={() => toggleExpand(achv.id)}
              >
                <div className="achievement-top">
                  <span className="achievement-label">{achv.title}</span>
                  <input
                    type="button"
                    value={achv.claimed ? "완료됨 ✅" : "받기"}
                    className={`reward-button ${achv.claimed ? "done" : ""}`}
                    disabled={!isClaimable || claimingId === achv.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isClaimable) {
                        alert("아직 조건이 충족되지 않았습니다.");
                      } else {
                        handleClaim(achv.id);
                      }
                    }}
                  />
                </div>

                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <span className="progress-text">{progressPercent}%</span>
                  </div>
                </div>

                {expandedId === achv.id && (
                  <div className="achievement-description">
                    {achv.description?.trim() !== ""
                      ? achv.description
                      : "설명이 준비되지 않았습니다."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Achv;
