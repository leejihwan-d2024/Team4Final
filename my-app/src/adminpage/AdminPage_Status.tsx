import React from "react";
import CheckStatus from "./CheckApiStatus";

function AdminPage_Status() {
  return (
    <>
      <span>범용 API</span>
      <CheckStatus path="/api/none_api" />

      <span>데이터 측정 관련</span>
      <CheckStatus path="/api/user-profile/1111" />

      <span>로그인 기능 관련</span>
      <CheckStatus path="/api/auth/login" />
    </>
  );
}

export default AdminPage_Status;
