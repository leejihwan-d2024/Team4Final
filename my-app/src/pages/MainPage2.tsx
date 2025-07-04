import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./MainPage.module.css";
import axios from "axios";

// 크루 타입
type Crew = {
  crewId: number;
  crewTitle: string;
  currentCount: number;
};

// 러닝 이벤트 타입
type RunningEvent = {
  id: number;
  title: string;
  date: string;
  location: string;
};

export default function MainPage2() {
  const navigate = useNavigate();
  const [crewList, setCrewList] = useState<Crew[]>([]);
  const [todayEvent, setTodayEvent] = useState<RunningEvent | null>(null);
  const [offsetY, setOffsetY] = useState(0); // 패럴랙스용 스크롤 위치

  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/crews");
        setCrewList(response.data);
      } catch (error) {
        console.error("❌ 크루 목록 불러오기 실패:", error);
        alert("크루 목록을 불러오지 못했습니다.");
      }
    };

    const fetchTodayEvent = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/events");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTodayEvent(res.data[0]); // 첫 번째 이벤트만 상태에 저장
        }
      } catch (error) {
        console.error("이벤트 불러오기 실패", error);
      }
    };

    fetchCrews();
    fetchTodayEvent();

    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClickTodayEvent = () => {
    if (todayEvent) {
      navigate(`/events/${todayEvent.id}`);
    } else {
      alert("오늘의 이벤트가 없습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.banner}
        style={{
          backgroundImage: `url("/marathon-3753907_1280.jpg")`,
          backgroundPositionY: `${offsetY * 0.5}px`, // 패럴랙스 효과
          cursor: "pointer", // 클릭 가능하다는 시각적 표시
        }}
        onClick={handleClickTodayEvent} // 배너 전체 클릭시 이동
      >
        <div className={styles.bannerOverlay}>
          <motion.div
            className={styles.highlightText}
            whileHover={{
              scale: 1.1,
              textShadow: "0px 0px 16px rgba(191, 219, 186, 0.97)",
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            오늘의 xx구 러닝이벤트
          </motion.div>
          {/* 이벤트 상세 내용은 이제 삭제 */}
        </div>
      </div>

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

      <button
        className={styles.createButton}
        onClick={() => navigate("/CrewCreate")}
      >
        크루 생성
      </button>
    </div>
  );
}
