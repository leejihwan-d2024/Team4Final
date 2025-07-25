import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import styles from "./MainPage.module.css";

type Crew = {
  crewId: string;
  crewTitle: string;
  currentCount: number;
  isJoined?: boolean;
};

type RunningEvent = {
  id: number;
  title: string;
  date: string;
  location: string;
};

export default function MainPage() {
  const navigate = useNavigate();
  const [crewList, setCrewList] = useState<Crew[]>([]);
  const [todayEvent, setTodayEvent] = useState<RunningEvent | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [regionName, setRegionName] = useState("내 지역");

  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserId(parsed.userId);
    }
  }, []);

  useEffect(() => {
    // 지역 가져오기
    if (!navigator.geolocation) {
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
          const region2 =
            data.documents?.[0]?.region_2depth_name || "알 수 없음";
          setRegionName(region2);
        } catch (err) {
          setRegionName("주소 오류");
        }
      },
      (err) => {
        console.error("❌ 위치 접근 실패:", err);
        setRegionName("접근 거부");
      }
    );

    const onScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const [allRes, joinedRes] = await Promise.all([
          axios.get<Crew[]>("https://localhost:8080/api/crews"),
          axios.get<Crew[]>(
            `https://localhost:8080/api/crews/joined?userId=${userId}`
          ),
        ]);

        const joinedCrewIds = new Set(joinedRes.data.map((c) => c.crewId));

        const allWithJoinStatus = allRes.data.map((crew) => ({
          ...crew,
          isJoined: joinedCrewIds.has(crew.crewId),
        }));

        const sorted = allWithJoinStatus.sort((a, b) => {
          if (a.isJoined && !b.isJoined) return -1;
          if (!a.isJoined && b.isJoined) return 1;
          return 0;
        });

        setCrewList(sorted);
      } catch (err) {
        console.error("❌ 크루 목록 로딩 실패:", err);
        alert("크루 목록을 불러오지 못했습니다.");
      }
    };

    const fetchTodayEvent = async () => {
      try {
        const { data } = await axios.get<RunningEvent[]>(
          "https://localhost:8080/api/events"
        );
        if (data.length > 0) setTodayEvent(data[0]);
      } catch (err) {
        console.error("❌ 이벤트 로딩 실패:", err);
      }
    };

    if (userId) {
      fetchCrews();
      fetchTodayEvent();
    }
  }, [userId]);

  const handleClickTodayEvent = () => {
    if (todayEvent) navigate(`/events/${todayEvent.id}`);
    else alert("오늘의 이벤트가 없습니다.");
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
            className={`${styles.crewItem} ${
              crew.isJoined ? styles.joined : ""
            }`}
            onClick={() => navigate(`/crew/${crew.crewId}`)}
          >
            <div className={styles.crewTitle}>
              {crew.crewTitle}
              {crew.isJoined && <span className={styles.pinIcon}>📌</span>}
            </div>
            <div className={styles.crewInfo}>
              현재 참여 인원: {(crew.currentCount ?? 0) + 1}
              {crew.isJoined && (
                <span className={styles.joinedText}>참가중!</span>
              )}
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
