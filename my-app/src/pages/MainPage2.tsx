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
  const [offsetY, setOffsetY] = useState(0);
  const [regionName, setRegionName] = useState("내 지역");

  // 내 위치 기반으로 Kakao REST API 호출해서 지역명 가져오기
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("위치 정보 지원 안됨");
      setRegionName("위치 지원 안됨");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
            {
              headers: {
                Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07",
              },
            }
          );
          const data = await res.json();

          if (!data.documents || data.documents.length === 0) {
            setRegionName("주소 정보 없음");
            return;
          }
          // 보통 0번째가 가장 정확한 주소라 봐도 됨
          const region2 = data.documents[0].region_2depth_name; // 구

          setRegionName(`${region2}`);
        } catch (error) {
          console.error("주소 정보 가져오기 실패", error);
          setRegionName("주소 정보 오류");
        }
      },
      (err) => {
        console.error("위치 접근 실패", err);
        setRegionName("위치 접근 거부됨");
      }
    );

    const onScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 크루 목록 & 오늘 이벤트 fetch
  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const { data } = await axios.get<Crew[]>(
          "https://localhost:8080/api/crews"
        );
        setCrewList(data);
      } catch (e) {
        console.error("❌ 크루 목록 불러오기 실패:", e);
        alert("크루 목록을 불러오지 못했습니다.");
      }
    };

    const fetchTodayEvent = async () => {
      try {
        const { data } = await axios.get<RunningEvent[]>(
          "https://localhost:8080/api/events"
        );
        if (data.length > 0) setTodayEvent(data[0]);
      } catch (e) {
        console.error("이벤트 불러오기 실패", e);
      }
    };

    fetchCrews();
    fetchTodayEvent();
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
          backgroundPositionY: `${offsetY * 0.5}px`,
          cursor: "pointer",
        }}
        onClick={handleClickTodayEvent}
      >
        <div className={styles.bannerOverlay}>
          <motion.div
            className={styles.highlightText}
            whileHover={{
              scale: 1.1,
              textShadow: "0 0 16px rgba(191, 219, 186, 0.97)",
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            오늘의 {regionName} 러닝이벤트
          </motion.div>
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
              현재 참여 인원: {(crew.currentCount ?? 0) + 1}
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
