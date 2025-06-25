import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./achv.css";

interface Achievement {
  id: number;
  title: string;
  progress: number;
  claimed: boolean;
  description: string;
}

function Achv() {
  const navigate = useNavigate();

  // 업적 상태 관리
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  // 메뉴 오픈 상태
  const [menuOpen, setMenuOpen] = useState(false);
  // 상세 설명 확장 아이디 관리
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 백엔드에서 업적 데이터 받아오기
  useEffect(() => {
    fetch("https://localhost:8080/api/achievements")
      .then((res) => res.json())
      .then((data: Achievement[]) => {
        setAchievements(data);
      })
      .catch((err) => {
        console.error("업적 데이터 로드 실패:", err);
      });
  }, []);

  // 보상 받기 처리
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
