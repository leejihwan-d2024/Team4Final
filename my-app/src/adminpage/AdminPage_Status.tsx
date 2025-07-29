import React from "react";
import CheckStatus from "./CheckApiStatus";

function AdminPage_Status() {
  return (
    <>
      <span>범용 API</span>
      <CheckStatus path="/api/none_api" title="API가 없는 경우" />
      <CheckStatus
        path={`https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=1&y=1`}
        title="카카오API (카카오 헤더 없이)"
      />
      <span>데이터 측정 관련</span>
      <CheckStatus path="/api/user-profile/1111" />
      <CheckStatus path={`/savemeasure`} title="측정 저장(헤더 없이)" />
      <CheckStatus path="/savecustompath" title="경로 저장(헤더 없이)" />
      <CheckStatus path="/getpath/181" />
      <CheckStatus path="/getrecentmeasure/1111" />

      <span>로그인 기능 관련</span>
      <CheckStatus path="/api/auth/login" title="로그인(헤더 없이)" />
    </>
  );
}

export default AdminPage_Status;
