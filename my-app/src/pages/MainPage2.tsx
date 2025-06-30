import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MainPage.module.css";
import axios from "axios";

type Crew = {
  crewId: number;
  crewTitle: string;
  currentCount: number;
};

export default function MainPage2() {
  const navigate = useNavigate();
  const [crewList, setCrewList] = useState<Crew[]>([]);

  useEffect(() => {
    // 서버에서 크루 리스트 불러오기
    const fetchCrews = async () => {
      try {
        const response = await axios.get("https://localhost:8080/api/crews");
        setCrewList(response.data); // 서버에서 받아온 리스트로 업데이트
      } catch (error) {
        console.error("❌ 크루 목록 불러오기 실패:", error);
        alert("크루 목록을 불러오지 못했습니다.");
      }
    };

    fetchCrews();
  }, []);

  return (
    <div className={styles.container}>
      {/* 오늘의 러닝 이벤트 영역 */}
      <div className={styles.banner}>오늘의 러닝 이벤트 (배너 영역)</div>

      {/* 러닝 크루 리스트 */}
      <div className={styles.crewList}>
        {crewList.map((crew) => (
          <div
            key={crew.crewId}
            className={styles.crewItem}
            onClick={() => navigate(`/crew/${crew.crewId}`)}
          >
            <div className={styles.crewTitle}>{crew.crewTitle}</div>
            <div className={styles.crewInfo}>
              현재 참여 인원: {crew.currentCount ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* 크루 생성 버튼 */}
      <button
        className={styles.createButton}
        onClick={() => navigate("/CrewCreate")}
      >
        크루 생성
      </button>
    </div>
  );
}
