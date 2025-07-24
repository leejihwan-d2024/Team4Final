import React, { useState, useEffect } from "react";
import "./achv.css";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import MainMenu from "../mainpage/MainMenu";

function isValidDate(value: string) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

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

interface Badge {
  achvTitle: string;
  achievedDate: string;
  badgeImageUrl: string;
  badgeName: string;
}

function Achv() {
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("user") || "null")?.userId;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardImageUrl, setRewardImageUrl] = useState<string | null>(null);
  const [rewardBadgeName, setRewardBadgeName] = useState<string | null>(null);

  const fetchUserBadges = async () => {
    const token = localStorage.getItem("token");
    if (!userId) return;

    try {
      const response = await axios.get("/api/achievements/badges", {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId },
      });

      const camelCaseBadges = response.data.map((item: any) => ({
        achvTitle: item.ACHVTITLE ?? item.achvTitle ?? "제목 없음",
        achievedDate: item.ACHIEVEDDATE ?? item.achievedDate ?? "",
        badgeImageUrl:
          item.BADGEIMAGEURL?.trim() || item.badgeImageUrl?.trim() || "",
        badgeName: item.BADGENAME?.trim() || item.badgeName?.trim() || "",
      }));
      setUserBadges(camelCaseBadges);
    } catch (err) {
      console.error("❌ 볃지 목록 로드 실패:", err);
    }
  };

  const fetchAchievements = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const url = showCompletedOnly
        ? "/api/achievements/completed"
        : "/api/achievements/user";

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId },
      });

      const data = response.data;
      const mappedData = data.map((item: any) => ({
        id: item.achvId?.toString() ?? item.achv_id ?? "없음",
        title: item.achvTitle ?? item.achv_title ?? "제목 없음",
        description: item.achvContent ?? "",
        currentValue: parseInt(item.currentValue) || 0,
        maxPoint: parseInt(item.achvMaxPoint) || 1,
        claimed: item.isCompleted === "Y",
      }));
      setAchievements(mappedData);
    } catch (error) {
      console.error("❌ 업적 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
    fetchUserBadges();
  }, [showCompletedOnly]);

  const getProgressPercent = (currentValue: number, maxPoint: number) => {
    if (!maxPoint || isNaN(currentValue) || isNaN(maxPoint)) return 0;
    return Math.min(100, Math.round((currentValue / maxPoint) * 100));
  };

  const handleClaim = async (achvId: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (!user || !user.userId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setClaimingId(achvId);

    try {
      const response = await axios.get("/api/achievements/reward", {
        params: { userId: user.userId, achvId },
        headers: { Authorization: `Bearer ${token}` },
      });

      const result: BadgeRewardResponse = response.data;

      if (result.result === "SUCCESS") {
        setRewardBadgeName(result.badgeName ?? "획득한 볃지");
        setRewardImageUrl(result.badgeImageUrl ?? null);
        setShowRewardModal(true);
        setAchievements((prev) =>
          prev.map((achv) =>
            achv.id === achvId ? { ...achv, claimed: true } : achv
          )
        );
        fetchUserBadges();
      } else {
        alert("보상 수령 불가: " + result.result);
      }
    } catch (error) {
      alert("보상 처리 오류");
      console.error(error);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="achievement-page">
      <div className="header">
        <h1>🏆 나의 업적</h1>
        <MainMenu />
      </div>

      <div className="filter-bar">
        <button
          className={!showCompletedOnly ? "active" : ""}
          onClick={() => setShowCompletedOnly(false)}
        >
          전체 보기
        </button>
        <button
          className={showCompletedOnly ? "active" : ""}
          onClick={() => setShowCompletedOnly(true)}
        >
          달성한 업적만
        </button>
      </div>

      {/* ✅ 테스트용 진행도 증가 버튼 */}
      {achievements.map((achv) => {
        return (
          <div key={achv.id}>
            <div>{achv.title}</div>

            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                try {
                  await axios.post("/api/achievements/increase", null, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { achvId: achv.id },
                  });
                  alert("해당 업적 진행도가 +1 증가했습니다.");
                  fetchAchievements();
                } catch (err) {
                  console.error("업적 증가 실패", err);
                  alert("업적 증가 중 오류 발생");
                }
              }}
            >
              +1 테스트
            </button>
          </div>
        );
      })}

      {loading ? (
        <div className="loading">업적을 불러오는 중...</div>
      ) : (
        <div className="achievement-list">
          {achievements.map((achv) => {
            const progressPercent = getProgressPercent(
              achv.currentValue,
              achv.maxPoint
            );
            const isClaimable = progressPercent >= 100 && !achv.claimed;

            return (
              <div
                key={achv.id}
                className="achievement-card"
                onClick={() =>
                  setExpandedId((prev) => (prev === achv.id ? null : achv.id))
                }
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
                      if (isClaimable) handleClaim(achv.id);
                      else alert("아직 조건이 충출되지 않았습니다.");
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
                    {achv.description?.trim()
                      ? achv.description
                      : "설명이 준비되지 않았습니다."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showRewardModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRewardModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{rewardBadgeName}</h2>
            {rewardImageUrl && (
              <img
                src={rewardImageUrl}
                alt={rewardBadgeName ?? "볃지"}
                className="reward-image"
              />
            )}
            <button
              onClick={() => setShowRewardModal(false)}
              className="close-button"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {userBadges.length > 0 && (
        <div className="badge-list">
          <h2>🎖 나가 획득한 볃지</h2>
          <div className="badge-grid">
            {userBadges.map((badge, idx) => (
              <div key={idx} className="badge-item">
                <img src={badge.badgeImageUrl} alt={badge.badgeName} />
                <div className="badge-name">{badge.badgeName}</div>
                <div className="badge-date">
                  {isValidDate(badge.achievedDate)
                    ? new Date(badge.achievedDate).toLocaleDateString("ko-KR")
                    : "날짜 없음"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Achv;
