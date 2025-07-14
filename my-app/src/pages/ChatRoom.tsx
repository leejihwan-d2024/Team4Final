import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client, Message, StompSubscription } from "@stomp/stompjs";
import "./ChatRoom.css";

const ChatRoom = () => {
  const { crewId } = useParams<{ crewId: string }>();
  const navigate = useNavigate();
  const userId = "1"; // 임시 로그인 유저 아이디

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [hasJoined, setHasJoined] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  // crewId 없으면 경고 후 메인 이동
  useEffect(() => {
    if (!crewId) {
      alert("잘못된 접근입니다.");
      navigate("/MainPage2");
    }
  }, [crewId, navigate]);

  const numericCrewId = crewId ? parseInt(crewId, 10) : 0;

  const checkJoinStatus = async () => {
    try {
      const res = await fetch(
        `https://localhost:8080/api/crew-members/check?crewId=${numericCrewId}&userId=${userId}`
      );
      const data = await res.json();
      setHasJoined(data.hasJoined);
    } catch (error) {
      console.error("❌ 참가 여부 확인 실패:", error);
      setHasJoined(false);
    }
  };

  useEffect(() => {
    if (!crewId) return;
    checkJoinStatus();
  }, [crewId]);

  useEffect(() => {
    if (hasJoined !== true) return;

    const fetchOldMessages = async () => {
      try {
        const res = await fetch(
          `https://localhost:8080/api/chat/${numericCrewId}`
        );
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        setMessages(data);
      } catch (error) {
        console.error("❌ 과거 메시지 로딩 실패", error);
      }
    };

    fetchOldMessages();

    const socket = new SockJS("https://localhost:8080/ws-chat");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        const topic = `/topic/crew/${numericCrewId}`;
        subscriptionRef.current = client.subscribe(
          topic,
          (message: Message) => {
            const body = JSON.parse(message.body);
            setMessages((prev) => [...prev, body]);
          }
        );
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      subscriptionRef.current?.unsubscribe();
      client.deactivate();
    };
  }, [numericCrewId, hasJoined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (stompClient && stompClient.connected && input.trim() !== "") {
      const newMessage = {
        crewId: numericCrewId,
        senderId: userId,
        content: input,
        sentAt: new Date().toISOString(),
      };

      stompClient.publish({
        destination: `/app/chat/${numericCrewId}`,
        body: JSON.stringify(newMessage),
      });

      setInput("");
    }
  };

  if (hasJoined === null) return <div>입장 권한 확인 중...</div>;
  if (hasJoined === false)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>🚫 채팅방 입장 권한이 없습니다.</h3>
        <p>해당 크루에 참가하지 않은 사용자입니다.</p>
        <button onClick={() => navigate("/MainPage2")}>돌아가기</button>
      </div>
    );

  return (
    <div className="chat-container">
      <h3 className="chat-header">크루 채팅방 #{numericCrewId}</h3>
      <div className="chat-box">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={idx} className={`chat-message ${isMe ? "me" : "other"}`}>
              <div className="chat-meta">{msg.senderId}</div>
              <div>{msg.content}</div>
              <div className="chat-time">
                {new Date(msg.sentAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요"
          className="chat-input"
        />
        <button onClick={sendMessage} className="chat-button">
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
