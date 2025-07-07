import React, { useState } from "react";
import React, { useState, useEffect } from "react";
import "./achv.css";
import { useNavigate } from "react-router-dom";
import "./achv.css";
import { useNavigate } from "react-router-dom";

interface Achievement {
  id: number;
  id: string;
  title: string;
  progress: number;
  currentValue: number;
  maxPoint: number;
  claimed: boolean;
  description: string;
}

function Achv() {
  const navigate = useNavigate();

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      title: "🚶 걷기 10,000보",
      progress: 100,
      claimed: false,
      description:
        "하루에 10,000보 이상 걸으면 달성됩니다. 꾸준한 걷기는 건강에 좋아요!",
    },
    {
      id: 2,
      title: "🏃 러닝 30일 연속",
      progress: 45,
      claimed: false,
      description: "30일 동안 하루도 빠짐없이 러닝하면 달성돼요. 도전해보세요!",
    },
    {
      id: 3,
      title: "🌍 누적 거리 500km",
      progress: 90,
      claimed: true,
      description: "지구 반 바퀴를 돌 만큼 달린 당신! 대단해요.",
    },
  ]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleClaim = (id: number) => {
    setAchievements((prev) =>
      prev.map((achv) => (achv.id === id ? { ...achv, claimed: true } : achv))
    );
    alert("🎉 보상을 받았습니다!");
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
          `http://localhost:8080/api/achievements/user/${userId}`
        );
        if (!response.ok) throw new Error("서버 응답 실패");

        const data = await response.json();
        console.log("📥 원본 응답:", data);

        const mappedData = data.map((item: any) => ({
          id: item.achvId?.toString() ?? item.achv_id ?? "없음",
          title: item.achvTitle ?? item.achv_title ?? "제목 없음",
          description: item.achv_content ?? "",
          currentValue: parseInt(item.currentValue) || 0,
          maxPoint: parseInt(item.achvMaxPoint) || 1,
          claimed: item.isCompleted === "Y", // ✅ 이렇게 변경
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
        // ★ 파라미터명 rewardId → achvId로 변경 ★
        `http://localhost:8080/api/achievements/reward?userId=${userId}&achvId=${achvId}`,
        { method: "GET" }
      );
      if (!response.ok) throw new Error("보상 요청 실패");

      const resultText = await response.text();
      console.log("🎁 서버 응답:", resultText);

      setAchievements((prev) =>
        prev.map((achv) =>
          achv.id === achvId ? { ...achv, claimed: true } : achv
        )
      );
      alert(resultText);
    } catch (error) {
      alert("보상 처리 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setClaimingId(null);
    }
>>>>>>> Stashed changes
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

      {/* ✅ 여기 메뉴 클릭 동작 추가됨 */}
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
                    {achv.description}
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
