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
  badgeImage?: string;
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
          // ✅ 수정: 중복 방지를 위해 id가 없으면 index로 대체
          id: item.achvId?.toString() ?? item.achv_id ?? `fallback-${index}`,
          title: item.achvTitle ?? item.achv_title ?? "제목 없음",
          description: item.achvContent ?? "",
          currentValue: parseInt(item.currentValue) || 0,
          maxPoint: parseInt(item.achvMaxPoint) || 1,
          claimed: item.isCompleted === "Y",
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
        alert(`🎉 ${result.badgeName} 뱃지를 획득했습니다!`);
        if (result.badgeImage) {
          const img = new Image();
          img.src = result.badgeImage;
          img.alt = result.badgeName ?? "뱃지";
          img.style.maxWidth = "150px";
          const w = window.open("", "_blank", "width=300,height=300");
          if (w) {
            w.document.write(`<h2>${result.badgeName}</h2>`);
            w.document.body.appendChild(img);
          }
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
