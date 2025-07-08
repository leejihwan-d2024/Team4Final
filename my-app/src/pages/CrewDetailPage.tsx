import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CrewDetail.module.css";
import axios from "axios";

type Crew = {
  crewId: number;
  crewTitle: string;
  startLocation: string;
  endLocation: string;
  startLocationMapPoint?: string;
  endLocationMapPoint?: string;
  district?: string;
  createdAt?: string;
  isOver15?: number;
  leaderNn?: string;
  leaderId?: string;
};

const currentUserId = "1"; // 로그인 미구현 상태라 하드코딩

export default function CrewDetailPage() {
  const { id } = useParams();
  const [crew, setCrew] = useState<Crew | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const response = await axios.get(
          `https://localhost:8080/api/crews/${id}`
        );
        setCrew(response.data);
      } catch (error) {
        alert("크루 정보를 불러오지 못했습니다.");
      }
    };

    fetchCrew();
  }, [id]);

  const handleJoin = async () => {
    if (!crew) return;

    try {
      const payload = {
        crewId: crew.crewId,
        userId: currentUserId,
        status: 1,
      };

      await axios.post("https://localhost:8080/api/crew-members", payload);
      alert(`"${crew.crewTitle}"에 참가했습니다!`);
    } catch (error) {
      console.error("❌ 참가 요청 실패:", error);
      alert("참가 요청 중 문제가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!crew) return;

    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://localhost:8080/api/crews/${crew.crewId}?userId=${currentUserId}`
      );
      alert("삭제 완료되었습니다.");
      navigate("/MainPage2"); // 삭제 후 메인으로 이동
    } catch (error) {
      console.error("❌ 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    alert("수정 페이지로 이동합니다 (아직 미구현)");
    // 예: navigate(`/crews/${crew.crewId}/edit`);
  };

  if (!crew) return <div>로딩 중...</div>;

  const isLeader = crew.leaderId === currentUserId;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{crew.crewTitle}</h2>

      <div className={styles.infoBlock}>
        <p>
          <strong>출발지:</strong> {crew.startLocation}
        </p>
        <p>
          <strong>도착지:</strong> {crew.endLocation}
        </p>
        <p>
          <strong>출발 위치 좌표:</strong> {crew.startLocationMapPoint}
        </p>
        <p>
          <strong>도착 위치 좌표:</strong> {crew.endLocationMapPoint}
        </p>
        <p>
          <strong>지역:</strong> {crew.district}
        </p>
        <p>
          <strong>15명 이상 여부:</strong>{" "}
          {crew.isOver15 === 1 ? "예" : "아니오"}
        </p>
        <p>
          <strong>크루리더:</strong> {crew.leaderNn}
        </p>
      </div>

      <button className={styles.joinButton} onClick={handleJoin}>
        참가하기
      </button>

      {isLeader && (
        <div className={styles.adminButtons}>
          <button className={styles.editButton} onClick={handleEdit}>
            ✏ 수정
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            🗑 삭제
          </button>
        </div>
      )}
    </div>
  );
}
