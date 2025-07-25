import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CrewDetail.module.css";
import api from "../api/GG_axiosInstance";
import PathMap from "../mainpage/PathMap";

type Crew = {
  crewId: string;
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
  distance?: string;
  duration?: string;
  pace?: string;
  description?: string;
};

export default function CrewDetailPage() {
  const { id } = useParams();
  const [crew, setCrew] = useState<Crew | null>(null);
  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  // 사용자 정보 가져오기
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUserId(parsed.userId);
      setNickname(parsed.nickname);
    }
  }, []);

  // 크루 정보 가져오기
  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const response = await api.get(`/api/crews/${id}`);
        setCrew(response.data);
      } catch (error) {
        console.error("❌ 크루 정보 가져오기 실패:", error);
        alert("크루 정보를 불러오지 못했습니다.");
      }
    };
    fetchCrew();
  }, [id]);

  // 참가 여부 확인
  useEffect(() => {
    const checkJoined = async () => {
      if (crew && currentUserId) {
        try {
          const response = await api.get(
            `/api/crew-members/exists?crewId=${crew.crewId}&userId=${currentUserId}`
          );
          setHasJoined(response.data); // true/false
        } catch (error) {
          console.error("❌ 참가 여부 확인 실패:", error);
        }
      }
    };
    checkJoined();
  }, [crew, currentUserId]);

  // 참가 or 채팅방 입장 함수
  const handleJoinOrEnterChat = async () => {
    if (!hasJoined) {
      if (!crew) return;
      try {
        await api.post("/api/crew-members", {
          crewId: crew.crewId,
          userId: currentUserId,
          status: 1,
        });
        alert(
          `"${crew.crewTitle}"에 참가했습니다! 이제 채팅방에 입장할 수 있습니다.`
        );
        setHasJoined(true);
      } catch (error) {
        console.error("❌ 참가 실패:", error);
        alert("크루 참가 중 오류가 발생했습니다.");
      }
    } else {
      navigate(`/chatroom/${crew?.crewId}`);
    }
  };

  const handleDelete = async () => {
    if (!crew) return;
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/crews/${crew.crewId}?userId=${currentUserId}`);
      alert("크루가 삭제되었습니다.");
      navigate("/MainPage2");
    } catch (error) {
      console.error("❌ 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    alert("수정 페이지로 이동합니다 (미구현)");
    // navigate(`/crews/${crew.crewId}/edit`);
  };

  if (!crew) return <div>로딩 중...</div>;

  const isLeader = crew.leaderId === currentUserId;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{crew.crewTitle}</h2>

      <div className={styles.infoBlock}>
        <p>
          <strong>출발지 좌표:</strong> {crew.startLocation}
        </p>
        <p>
          <strong>도착지 좌표:</strong> {crew.endLocation}
        </p>

        <div style={{ width: "100%", height: 400, margin: "20px 0" }}>
          <PathMap CrewId={crew.crewId} mode="OnlyMap" />
        </div>

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
          <strong>생성일:</strong> {crew.createdAt}
        </p>
        <p>
          <strong>15명 이상 여부:</strong> {crew.isOver15 ? "예" : "아니오"}
        </p>
        <p>
          <strong>크루 리더:</strong> {crew.leaderNn}
        </p>
        <p>
          <strong>거리:</strong> {crew.distance} km
        </p>
        <p>
          <strong>시간:</strong> {crew.duration} 분
        </p>
        <p>
          <strong>페이스:</strong> {crew.pace} 분/km
        </p>
        <p>
          <strong>설명:</strong> {crew.description}
        </p>
      </div>

      {/* 버튼 렌더링 */}
      <div className={styles.buttonGroup}>
        {isLeader ? (
          <>
            <button className={styles.editButton} onClick={handleEdit}>
              ✏ 수정
            </button>
            <button className={styles.deleteButton} onClick={handleDelete}>
              🗑 삭제
            </button>
          </>
        ) : (
          <button
            className={hasJoined ? styles.chatButton : styles.joinButton}
            onClick={handleJoinOrEnterChat}
          >
            {hasJoined ? "💬 채팅방 입장" : "참가하기"}
          </button>
        )}
      </div>
    </div>
  );
}
