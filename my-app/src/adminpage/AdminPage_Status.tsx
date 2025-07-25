import React from "react";
import CheckStatus from "./CheckApiStatus";

function AdminPage_Status() {
  return (
    <>
      <CheckStatus path="/api/user-profile/1111" />
      <CheckStatus path="/api/none_api" />
    </>
  );
}

export default AdminPage_Status;
