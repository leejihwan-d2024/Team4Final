import { useParams } from "react-router-dom";
import { useState } from "react";
import styles from "./CrewDetail.module.css";

type Crew = {
  id: number;
  title: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  pace: string;
  description: string;
  participants: string[];
};

export default function CrewDetailPage() {
  const { id } = useParams();
  const [crew, setCrew] = useState<Crew>({
    id: Number(id),
    title: "청계천 번개런",
    startLocation: "종각역 1번 출구",
    endLocation: "한강 공원",
    distance: 5.3,
    duration: 40,
    pace: "7:30/km",
    description: "가볍게 저녁 러닝! 초보자 환영합니다.",
    participants: ["유저1", "유저2", "유저3"],
  });

  const handleJoin = () => {
    alert(`"${crew.title}"에 참가했습니다!`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{crew.title}</h2>

      <div className={styles.infoBlock}>
        <p>
          <strong>출발지:</strong> {crew.startLocation}
        </p>
        <p>
          <strong>도착지:</strong> {crew.endLocation}
        </p>
        <p>
          <strong>거리:</strong> {crew.distance}km
        </p>
        <p>
          <strong>소요 시간:</strong> {crew.duration}분
        </p>
        <p>
          <strong>페이스:</strong> {crew.pace}
        </p>
      </div>

      <div className={styles.description}>
        <strong>설명:</strong>
        <p>{crew.description}</p>
      </div>

      <div className={styles.participants}>
        <strong>참가 인원:</strong>
        <ul>
          {crew.participants.map((name, index) => (
            <li key={index}>• {name}</li>
          ))}
        </ul>
      </div>

      <button className={styles.joinButton} onClick={handleJoin}>
        참가하기
      </button>
    </div>
  );
}
