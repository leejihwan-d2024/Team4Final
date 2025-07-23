import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RankingPage.css";

interface RankingVO {
  userId: string;
  userNn: string;
  totalDistance?: number;
  postCount?: number;
  achvCount?: number;
  achvScore?: number;
}

function RankingPage() {
  const [weeklyDistance, setWeeklyDistance] = useState<RankingVO[]>([]);
  const [monthlyDistance, setMonthlyDistance] = useState<RankingVO[]>([]);
  const [weeklyPosts, setWeeklyPosts] = useState<RankingVO[]>([]);
  const [achievements, setAchievements] = useState<RankingVO[]>([]);

  useEffect(() => {
    axios
      .get("https://localhost:8080/api/ranking/weekly-distance")
      .then((res) => setWeeklyDistance(res.data));
    axios
      .get("https://localhost:8080/api/ranking/monthly-distance")
      .then((res) => setMonthlyDistance(res.data));
    axios
      .get("https://localhost:8080/api/ranking/weekly-posts")
      .then((res) => setWeeklyPosts(res.data));
    axios
      .get("https://localhost:8080/api/ranking/achievements")
      .then((res) => setAchievements(res.data));
  }, []);

  const renderRanking = (
    title: string,
    data: RankingVO[],
    type: "distance" | "post" | "achievement"
  ) => {
    return (
      <div className="ranking-block">
        <h2>{title}</h2>
        <ol>
          {data.map((user, index) => (
            <li key={user.userId}>
              <span className="rank-number">🏅 {index + 1}</span>
              <span className="rank-name">{user.userNn}</span>
              {type === "distance" && (
                <span className="rank-value">
                  {user.totalDistance?.toFixed(1)} km
                </span>
              )}
              {type === "post" && (
                <span className="rank-value">{user.postCount}개</span>
              )}
              {type === "achievement" && (
                <span className="rank-value">
                  {user.achvCount}개 ({user.achvScore}점)
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <div className="ranking-page">
      <h1>🏆 사용자 랭킹</h1>
      {renderRanking("이번주 활동왕", weeklyDistance, "distance")}
      {renderRanking("이번달 활동왕", monthlyDistance, "distance")}
      {renderRanking("이번주 게시글 활동왕", weeklyPosts, "post")}
      {renderRanking("업적왕", achievements, "achievement")}
    </div>
  );
}

export default RankingPage;
