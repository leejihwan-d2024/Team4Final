import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RankingPage.css";
import Layout from "./Layout";
import styled from "styled-components";

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
  const Wrapper = styled.div`
    max-width: 360px;
    height: 640px;
    margin: auto;
    padding: 16px;
    box-sizing: border-box;
    background: #f9f9f9;
    font-size: 14px;

    position: relative; // ✅ 메뉴 기준 위치를 잡기 위해 필요
    overflow: visible;
    overflow-y: auto;
    overflow-x: hidden; // ✅ 팝업 메뉴가 잘리지 않도록
  `;

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}api/ranking/weekly-distance`)
      .then((res) =>
        setWeeklyDistance(
          res.data.sort(
            (a: RankingVO, b: RankingVO) =>
              (b.totalDistance ?? 0) - (a.totalDistance ?? 0)
          )
        )
      );
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}api/ranking/monthly-distance`)
      .then((res) =>
        setMonthlyDistance(
          res.data.sort(
            (a: RankingVO, b: RankingVO) =>
              (b.totalDistance ?? 0) - (a.totalDistance ?? 0)
          )
        )
      );
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}api/ranking/weekly-posts`)
      .then((res) =>
        setWeeklyPosts(
          res.data.sort(
            (a: RankingVO, b: RankingVO) =>
              (b.postCount ?? 0) - (a.postCount ?? 0)
          )
        )
      );
    axios
      .get(`{process.env.REACT_APP_API_BASE_URL}api/ranking/achievements`)
      .then((res) =>
        setAchievements(
          res.data.sort(
            (a: RankingVO, b: RankingVO) =>
              (b.achvScore ?? 0) - (a.achvScore ?? 0)
          )
        )
      );
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
              <span className="rank-name">{user?.userNn}</span>
              {type === "distance" && (
                <span className="rank-value">
                  {user.totalDistance?.toFixed(1)} km
                </span>
              )}
              {type === "post" && (
                <span className="rank-value">{user?.postCount}개</span>
              )}
              {type === "achievement" && (
                <span className="rank-value">
                  {user.achvCount}개 ({user?.achvScore}점)
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <Wrapper>
      <Layout>
        <div className="ranking-page">
          <h1>🏆 사용자 랭킹</h1>
          {renderRanking("👑 이번주 활동왕 👑", weeklyDistance, "distance")}
          {renderRanking("👑 이번달 활동왕 👑", monthlyDistance, "distance")}
          {renderRanking("👑 이번주 게시글 활동왕 👑", weeklyPosts, "post")}
          {renderRanking("👑 업적왕 👑", achievements, "achievement")}
        </div>
      </Layout>
    </Wrapper>
  );
}

export default RankingPage;
