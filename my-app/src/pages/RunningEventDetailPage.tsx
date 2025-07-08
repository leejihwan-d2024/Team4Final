// RunningEventDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./RunningEventDetail.module.css";

interface RunningEvent {
  eventId?: number;
  eventTitle: string;
  eventContent?: string;
  startTime: string;
  endTime: string;
  startLocation?: string;
  endLocation?: string;
  createdAt?: string;
}

export default function RunningEventDetailPage() {
  const { id } = useParams();

  const [event, setEvent] = useState<RunningEvent | null>(null);

  useEffect(() => {
    console.log(id);
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`https://localhost:8080/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error("❌ 이벤트 불러오기 실패", err);
        alert("이벤트를 불러오는 데 실패했습니다.");
      }
    };

    fetchEvent();
  }, [id]);

  const handleJoin = async () => {
    if (!event) return;
    try {
      await axios.post(
        `https://localhost:8080/api/events/${event.eventId}/join?userId=1`
      );
      alert("이벤트에 참가했습니다!");
    } catch (err) {
      console.error("❌ 참가 실패", err);
      alert("참가 중 오류가 발생했습니다.");
    }
  };

  if (!event) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{event.eventTitle}</h2>
      <div className={styles.infoBlock}>
        <p>
          <strong>내용:</strong> {event.eventContent || "없음"}
        </p>
        <p>
          <strong>시작 시간:</strong>{" "}
          {new Date(event.startTime).toLocaleString()}
        </p>
        <p>
          <strong>종료 시간:</strong> {new Date(event.endTime).toLocaleString()}
        </p>
        <p>
          <strong>출발지:</strong> {event.startLocation}
        </p>
        <p>
          <strong>도착지:</strong> {event.endLocation}
        </p>
        <p>
          <strong>생성일:</strong>{" "}
          {event.createdAt
            ? new Date(event.createdAt).toLocaleDateString()
            : "-"}
        </p>
      </div>

      <button className={styles.joinButton} onClick={handleJoin}>
        참가하기
      </button>
    </div>
  );
}
