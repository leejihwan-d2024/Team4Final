import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client, Message, StompSubscription } from "@stomp/stompjs";
import api from "../api/GG_axiosInstance"; // axios 인스턴스
import "./ChatRoom.css";

type Crew = {
  crewId: string;
  crewTitle: string;
  // 필요하면 다른 필드도 추가 가능
};

const ChatRoom = () => {
  const { crewId } = useParams<{ crewId: string }>();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.userId || "anonymous";

  const [crew, setCrew] = useState<Crew | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  // 크루 정보 불러오기
  useEffect(() => {
    if (!crewId) return;

    const fetchCrewInfo = async () => {
      try {
        const response = await api.get(`/api/crews/${crewId}`);
        setCrew(response.data);
      } catch (error) {
        console.error("❌ 크루 정보 불러오기 실패", error);
      }
    };
    fetchCrewInfo();
  }, [crewId]);

  // 과거 메시지 불러오기 및 웹소켓 연결
  useEffect(() => {
    if (!crewId) return;

    const fetchOldMessages = async () => {
      try {
        const res = await fetch(`https://localhost:8080/api/chat/${crewId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        if (!text) {
          setMessages([]);
          return;
        }
        const data = JSON.parse(text);
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
        const topic = `/topic/crew/${crewId}`;
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
  }, [crewId]);

  // 메시지 변경 시 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (stompClient && stompClient.connected && input.trim() !== "") {
      const newMessage = {
        crewId,
        senderId: userId,
        content: input,
        sentAt: new Date().toISOString(),
      };

      stompClient.publish({
        destination: `/app/chatroom/${crewId}`,
        body: JSON.stringify(newMessage),
      });

      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <h3 className="chat-header">
        크루 채팅방 {crew ? `- ${crew.crewTitle}` : ""}
      </h3>
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
