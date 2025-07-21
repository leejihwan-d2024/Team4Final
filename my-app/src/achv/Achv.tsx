import React, { useState, useEffect } from "react";
import "./achv.css";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

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

  // ✅ 모달 관련 상태 추가
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardImageUrl, setRewardImageUrl] = useState<string | null>(null);
  const [rewardBadgeName, setRewardBadgeName] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    const fetchAchievements = async () => {
      try {
        const response = await axios.get("/api/achievements/user", {
          headers: { Authorization: `Bearer ${token}` },
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
      } catch (err) {
        console.error("업적 데이터 로드 실패:", err);
        alert("업적을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const getProgressPercent = (currentValue: number, maxPoint: number) => {
    if (!maxPoint || isNaN(currentValue) || isNaN(maxPoint)) return 0;
    return Math.min(100, Math.round((currentValue / maxPoint) * 100));
  };

  const handleClaim = async (achvId: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (!user || !user.userId) {
      alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
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
        setRewardBadgeName(result.badgeName ?? "획득한 뱃지");
        setRewardImageUrl(result.badgeImageUrl ?? null);
        setShowRewardModal(true);

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

      {/* ✅ 모달 팝업 */}
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
                alt={rewardBadgeName ?? "뱃지"}
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
    </div>
  );
}

export default Achv;
