import React from "react";
import { useParams } from "react-router-dom";
import ChatRoom from "./ChatRoom";

const ChatRoomPage = () => {
  const { crewId } = useParams<{ crewId: string }>();
  const userId = "1"; // 임시: 나중에 로그인 정보로 바꾸면 돼

  if (!crewId) {
    return <div>잘못된 접근입니다.</div>;
  }

  return <ChatRoom userId={userId} crewId={parseInt(crewId, 10)} />;
};

export default ChatRoomPage;
