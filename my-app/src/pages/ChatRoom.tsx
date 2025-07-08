import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, Message, StompSubscription } from "@stomp/stompjs";
import "./ChatRoom.css";

const ChatRoom = ({ userId, crewId }: { userId: string; crewId: number }) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

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

  useEffect(() => {
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
        destination: `/app/chat/${crewId}`,
        body: JSON.stringify(newMessage),
      });

      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <h3 className="chat-header">크루 채팅방 #{crewId}</h3>
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
