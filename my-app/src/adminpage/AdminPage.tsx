import React, { useState } from "react";
import MainMenu from "../mainpage/MainMenu";
import AdminPage_Status from "./AdminPage_Status";
import UserTable from "./UserTable";

function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<"user" | "post" | "status">(
    "user"
  );

  const renderContent = () => {
    switch (selectedTab) {
      case "user":
        return (
          <div>
            <UserTable />
          </div>
        );
      case "post":
        return <div>게시글목록입니다</div>;
      case "status":
        return <AdminPage_Status />;
      default:
        return null;
    }
  };

  return (
    <div>
      <MainMenu />
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>관리자페이지</span>

      <div style={{ marginTop: "12px", marginBottom: "12px" }}>
        <button
          onClick={() => setSelectedTab("user")}
          style={{ marginRight: "8px" }}
        >
          회원목록확인
        </button>
        <button
          onClick={() => setSelectedTab("post")}
          style={{ marginRight: "8px" }}
        >
          게시글목록확인
        </button>
        <button onClick={() => setSelectedTab("status")}>API 상태확인</button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "16px",
          minHeight: "100px",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminPage;
