import React from "react";
import CheckStatus from "./CheckApiStatus";

function AdminPage_Status() {
  return (
    <>
      <span>범용 API</span>
      <CheckStatus path="/api/none_api" title="API가 없는 경우" />
      <CheckStatus
        path={`https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${1}&y=${1}`}
        title="카카오API"
      />
      <span>데이터 측정 관련</span>
      <CheckStatus path="/api/user-profile/1111" />
      <CheckStatus
        path={`${process.env.REACT_APP_API_BASE_URL}savemeasure`}
        title="측정 저장(헤더 없이)"
      />
      <span>로그인 기능 관련</span>
      <CheckStatus path="/api/auth/login" title="로그인(헤더 없이)" />
      <span>크루 기능 관련</span>
      <CheckStatus path="/api/crew-members/exists" />
      <CheckStatus path="/api/crews/defaultId" />
      <CheckStatus path="/api/crews/{id}" />
      <CheckStatus path="/api/crews/getrecentjoin/{userId}" />
      <CheckStatus path="/api/crews/getrecentcreate/{userId}" />
      <CheckStatus path="/api/crews/joined" />
      <span>채팅 기능 관련</span>
      <CheckStatus path="/api/chatroom/{crewId}" />
      <CheckStatus path="/api/chat/{crewId}" />
    </>
  );
}

export default AdminPage_Status;
