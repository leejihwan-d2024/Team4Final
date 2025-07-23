import React from "react";
import MainMenu from "../mainpage/MainMenu";
import ToggleBox from "./ToggleBox";
import { useParams } from "react-router-dom";

function MyPage() {
  const { UserId } = useParams<{ UserId: string }>();
  const userStr = localStorage.getItem("user");
  const user = JSON.parse(userStr || "null");
  const hasUserId = UserId !== undefined && UserId !== null && UserId !== "";

  return (
    <div style={{ padding: "40px" }}>
      <MainMenu />
      <h2>🧑 프로필 페이지</h2>
      {hasUserId ? (
        <span>props로 전달된 사용자 ID: {UserId}</span>
      ) : (
        <span>props로 전달된 UserId가 없습니다.</span>
      )}
      {UserId === user?.userId ? (
        <span>✅ 나의 마이페이지</span>
      ) : (
        <span>❌ 다른 유저의 마이페이지</span>
      )}
      <span>
        사용자
        {user?.userNn ?? "null"}님
      </span>
      <img
        src="https://cdn.pixabay.com/photo/2024/05/22/21/51/dog-8781844_640.jpg"
        style={{ width: "200px", height: "200px", borderRadius: "30%" }}
      ></img>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `59%`,
            background: "orange",
          }}
        >
          <span className="progress-text">59%</span>
        </div>
      </div>
      <br />
      <ToggleBox userId={UserId} />
    </div>
  );
}

export default MyPage;
