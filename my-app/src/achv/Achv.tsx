import React, { useState } from "react";
import "./achv.css";
import { useNavigate } from "react-router-dom";

interface Achievement {
  id: number;
  title: string;
  progress: number;
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
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const toggleExpand = (id: number) => {
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

      <div className="achievement-list">
        {achievements.map((achv) => (
          <div
            key={achv.id}
            className="achievement-card"
            onClick={() => toggleExpand(achv.id)}
          >
            <div className="achievement-top">
              <span className="achievement-label">{achv.title}</span>
              {achv.claimed ? (
                <input
                  type="button"
                  value="완료됨 ✅"
                  disabled
                  className="reward-button done"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <input
                  type="button"
                  value="받기"
                  className="reward-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClaim(achv.id);
                  }}
                  disabled={achv.progress < 100}
                />
              )}
            </div>

            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${achv.progress}%` }}
              >
                {achv.progress}%
              </div>
            </div>

            {expandedId === achv.id && (
              <div className="achievement-description">{achv.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achv;
