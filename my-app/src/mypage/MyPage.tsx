import React from "react";
import MainMenu from "../mainpage/MainMenu";
import ToggleBox from "./ToggleBox";

function MyPage() {
  const userStr = localStorage.getItem("user");
  const user = JSON.parse(userStr || "null");

  return (
    <div style={{ padding: "40px" }}>
      <MainMenu />
      <h2>🧑 프로필 페이지</h2>
      <span>
        사용자
        {user.userNn}님
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
      <ToggleBox />
    </div>
  );
}

export default MyPage;
