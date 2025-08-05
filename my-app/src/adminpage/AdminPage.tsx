import React, { useState } from "react";
import MainMenu from "../mainpage/MainMenu";
import AdminPage_Status from "./AdminPage_Status";
import UserTable from "./UserTable";
import PostTable from "./PostTable";
import { Link } from "react-router-dom";
import CrewTable from "./CrewTable";
import { getApiBaseUrl } from "../utils/apiUtils";

function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<
    "user" | "post" | "status" | "crew"
  >("user");

  const renderContent = () => {
    switch (selectedTab) {
      case "user":
        return (
          <div>
            <UserTable />
          </div>
        );
      case "post":
        return (
          <div>
            <PostTable />
          </div>
        );
      case "status":
        return <AdminPage_Status />;
      case "crew":
        return <CrewTable />;

      default:
        return null;
    }
  };

  return (
    <div>
      <MainMenu />
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>관리자페이지</span>
      <Link
        to={`${getApiBaseUrl()}swagger-ui/index.html#/`}
        className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-green-600 transition-colors my-[10px]"
      >
        SWAGGER DOC
      </Link>
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
        <button
          onClick={() => setSelectedTab("crew")}
          style={{ marginRight: "8px" }}
        >
          크루목록확인
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
