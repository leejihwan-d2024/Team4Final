import { useNavigate } from "react-router-dom";
import styles from "./MainPage.module.css";

type Crew = {
  id: number;
  title: string;
  currentCount: number;
};

export default function MainPage() {
  const navigate = useNavigate();

  const crewList: Crew[] = [
    { id: 1, title: "청계천 번개런", currentCount: 8 },
    { id: 2, title: "을지로 야간런", currentCount: 18 },
    { id: 3, title: "오늘도 달린다", currentCount: 3 },
  ];

  return (
    <div className={styles.container}>
      {/* 오늘의 러닝 이벤트 영역 */}
      <div className={styles.banner}>오늘의 러닝 이벤트 (배너 영역)</div>

      {/* 러닝 크루 리스트 */}
      <div className={styles.crewList}>
        {crewList.map((crew) => (
          <div
            key={crew.id}
            className={styles.crewItem}
            onClick={() => navigate(`/crew/${crew.id}`)}
          >
            <div className={styles.crewTitle}>{crew.title}</div>
            <div className={styles.crewInfo}>
              현재 참여 인원: {crew.currentCount}
            </div>
          </div>
        ))}
      </div>

      {/* 크루 생성 버튼 */}
      <button
        className={styles.createButton}
        onClick={() => navigate("/create")}
      >
        크루 생성
      </button>
    </div>
  );
}
