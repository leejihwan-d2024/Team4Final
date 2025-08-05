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
      <CheckStatus
        path="/api/auth/kakao/login"
        title="카카오 로그인(헤더 없이)"
      />
      <CheckStatus path="/api/auth/check/userId" />
      <CheckStatus path="/api/auth/refresh" />
      <CheckStatus path="/api/auth/register" />
      <CheckStatus path="/api/auth/logout" />
      <CheckStatus path="/api/auth/password/update" />
      <CheckStatus path="/api/auth/user/1111" />
      <CheckStatus path="/api/auth/auto-login" />
      <CheckStatus path="/api/auth/profile/update" />
      <CheckStatus path="/api/auth/account/delete" />
      <CheckStatus path="/api/auth/find-id" />
      <CheckStatus path="/api/auth/find-password" />
      <CheckStatus path="/api/auth/reset-password" />
      <CheckStatus path="/api/auth/check-email-config" />
      <CheckStatus path="/api/profile/1111" />
      <CheckStatus path="/api/profile/update-url" />
      <CheckStatus path="/api/profile/kakao/1111" />
      <CheckStatus path="/api/test/kakao-config" />
      <span>Giphy API</span>
      <CheckStatus path="/api/giphy/mixed-random" />
      <span>UserProfile</span>
      <CheckStatus path="/api/user-profile/1111/password" />
      <CheckStatus path="/api/user-profile/1111/email" />
      <CheckStatus path="/api/user-profile/1111" />
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
      <span>게시판 기능 관련</span>
      <CheckStatus path="/api/posts" /> {/* 전체 게시글 조회 (GET) */}
      <CheckStatus path="/api/posts/162" /> {/* 특정 게시글 조회 (GET) */}
      <CheckStatus path="/api/posts/11111" />{" "}
      {/* 존재하지 않는 게시글 테스트 */}
      <CheckStatus path="/api/posts/author/user001" />{" "}
      {/* 특정 작성자 게시글 조회 (GET) */}
      <CheckStatus path="/api/posts" /> {/* 게시글 생성 (POST) */}
      <CheckStatus path="/api/posts" /> {/* 게시글 수정 (PUT) */}
      <CheckStatus path="/api/posts/162/like" /> {/* 좋아요 추가 (POST) */}
      <CheckStatus path="/api/posts/162/view" /> {/* 조회수 증가 (POST) */}
      <CheckStatus path="/api/posts/162/like" /> {/* 좋아요 감소 (DELETE) */}
      <CheckStatus path="/api/posts/162" /> {/* 게시글 삭제 (DELETE) */}
      <span>댓글 기능 관련</span>
      <CheckStatus path="/api/comments/post/162" />{" "}
      {/* 게시글별 댓글 조회 (GET) */}
      <CheckStatus path="/api/comments" /> {/* 댓글 생성 (POST) */}
      <CheckStatus path="/api/comments/10" /> {/* 댓글 수정 (PUT) */}
      <CheckStatus path="/api/comments/10" /> {/* 댓글 삭제 (DELETE) */}
      <span>마라톤 대회정보 검색</span>
      <CheckStatus path="/api/marathon/search?input=서울" />
      <span>상품좋아요 기능 관련</span>
      <CheckStatus path="/api/products//like" />
      <CheckStatus path="/api/products//liked" />
      <span>러닝 정보관련 기능 검색</span>
      <CheckStatus path="/api/info/search?query=러닝화" />
      <span>찜 기능 관련</span>
      <CheckStatus path="/api/products/liked?userId=user001" />
      <span>러닝관련상품 기능 관련</span>
      <CheckStatus path="/api/shop/search?query=러닝화" />
      <span>랭킹 기능 관련</span>
      <CheckStatus path="/api/ranking/weekly-distance" />
      <CheckStatus path="/api/ranking/monthly-distance" />
      <CheckStatus path="/api/ranking/weekly-posts" />
      <CheckStatus path="/api/ranking/achievements" />
    </>
  );
}

export default AdminPage_Status;
