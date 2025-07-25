import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CrewCreate.module.css";
import api from "../api/GG_axiosInstance";
import PathMap from "../mainpage/PathMap";

export default function CrewCreatePage() {
  const navigate = useNavigate();

  const [defaultId, setDefaultId] = useState("");
  const [currentUser, setCurrentUser] = useState({ userId: "", nickname: "" });

  const [form, setForm] = useState({
    crewId: "",
    title: "",
    startLocation: "",
    endLocation: "",
    distance: "", // km, 자동 계산
    duration: "", // 분, 입력
    pace: "", // 분/km, 자동 계산 & 수정 가능
    description: "",
    isOver15: false,
    startLocationMapPoint: "",
    endLocationMapPoint: "",
  });

  const [pathPoints, setPathPoints] = useState<{ lat: number; lng: number }[]>(
    []
  );

  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");

  const [isAutoDescription, setIsAutoDescription] = useState(true); // ✅ 설명 자동입력 여부

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUser({
        userId: parsed.userId || "",
        nickname: parsed.nickname || "",
      });
    }
  }, []);

  useEffect(() => {
    async function fetchDefaultId() {
      try {
        const response = await api.get("/api/crews/defaultId");
        const id = response.data;
        setDefaultId(id);
        setForm((prev) => ({ ...prev, crewId: id }));
      } catch (error) {
        console.error("❌ defaultId 생성 실패:", error);
      }
    }
    fetchDefaultId();
  }, []);

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculateTotalDistance(points: { lat: number; lng: number }[]) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += calculateDistance(
        points[i].lat,
        points[i].lng,
        points[i + 1].lat,
        points[i + 1].lng
      );
    }
    return total;
  }

  useEffect(() => {
    if (pathPoints.length < 2) return;
    const totalDistance = calculateTotalDistance(pathPoints);
    setForm((prev) => ({ ...prev, distance: totalDistance.toFixed(2) }));
  }, [pathPoints]);

  useEffect(() => {
    if (pathPoints.length === 0) return;
    const start = pathPoints[0];
    fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${start.lng}&y=${start.lat}`,
      {
        method: "GET",
        headers: { Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07" },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          const region2 = data.documents[0].region_2depth_name;
          const region3 = data.documents[0].region_3depth_name;
          setStartAddress(`${region2} ${region3}`);
          setForm((prev) => ({
            ...prev,
            startLocation: `${start.lat},${start.lng}`,
            startLocationMapPoint: `${start.lat},${start.lng}`,
          }));
        } else {
          setStartAddress("주소 정보 없음");
        }
      })
      .catch(() => setStartAddress("오류 발생"));
  }, [pathPoints]);

  useEffect(() => {
    if (pathPoints.length === 0) return;
    const end = pathPoints[pathPoints.length - 1];
    fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${end.lng}&y=${end.lat}`,
      {
        method: "GET",
        headers: { Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07" },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          const region2 = data.documents[0].region_2depth_name;
          const region3 = data.documents[0].region_3depth_name;
          setEndAddress(`${region2} ${region3}`);
          setForm((prev) => ({
            ...prev,
            endLocation: `${end.lat},${end.lng}`,
            endLocationMapPoint: `${end.lat},${end.lng}`,
          }));
        } else {
          setEndAddress("주소 정보 없음");
        }
      })
      .catch(() => setEndAddress("오류 발생"));
  }, [pathPoints]);

  useEffect(() => {
    const durationNum = Number(form.duration);
    const distanceNum = Number(form.distance);

    if (!durationNum || !distanceNum) {
      setForm((prev) => ({ ...prev, pace: "" }));
      return;
    }

    const pace = durationNum / distanceNum;
    setForm((prev) => ({
      ...prev,
      pace: pace.toFixed(2),
    }));
  }, [form.duration, form.distance]);

  // ✅ 설명 자동입력 로직
  useEffect(() => {
    if (!isAutoDescription) return;
    if (form.duration && form.pace) {
      setForm((prev) => ({
        ...prev,
        description: `러닝시간: ${prev.duration}분 / 페이스: ${prev.pace}/\n 그 외 추가사항을 입력해주세요!`,
      }));
    }
  }, [form.duration, form.pace, isAutoDescription]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "pace") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }

    // 사용자가 설명을 직접 수정하면 자동입력 중단
    if (name === "description") {
      setIsAutoDescription(false);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/crews", {
        crewId: form.crewId,
        crewTitle: form.title,
        startLocation: form.startLocation,
        endLocation: form.endLocation,
        startTime: new Date(),
        startLocationMapPoint: form.startLocationMapPoint,
        endLocationMapPoint: form.endLocationMapPoint,
        district: startAddress,
        isOver15: form.isOver15 ? 1 : 0,
        leaderId: currentUser.userId,
        leaderNn: currentUser.nickname,
        distance: form.distance,
        duration: form.duration,
        pace: form.pace,
        description: form.description,
      });

      console.log("✅ 서버 응답:", response.data);
      alert("크루가 생성되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("❌ 크루 생성 실패:", error);
      alert("크루 생성에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>크루 만들기</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="title"
          placeholder="크루 제목"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="startLocation"
          value={form.startLocation}
          hidden
          readOnly
        />
        <input
          name="startLocationString"
          placeholder="출발지 지역명"
          value={startAddress}
          readOnly
        />
        <div style={{ width: "100%", height: 400, marginBottom: "40px" }}>
          <PathMap
            measurementId={7}
            setPathPoints={setPathPoints}
            CrewId={form.crewId}
          />
        </div>
        <input name="endLocation" value={form.endLocation} hidden readOnly />

        <input
          name="distance"
          placeholder="거리 (km)"
          value={form.distance}
          readOnly
          required
        />
        <input
          name="duration"
          placeholder="목표시간 (분)"
          value={form.duration}
          onChange={handleChange}
          required
          type="number"
          min="1"
        />
        <input
          name="pace"
          placeholder="페이스 (1km당 소요시간)"
          value={form.pace}
          onChange={handleChange}
          required
          type="number"
          step="0.01"
          min="0"
        />

        <textarea
          name="description"
          placeholder="설명"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
        />
        <label>
          <input
            type="checkbox"
            name="isOver15"
            checked={form.isOver15}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isOver15: e.target.checked }))
            }
          />
          크루원 15명 이상 허용
        </label>

        <button type="submit" className={styles.submitBtn}>
          크루 생성
        </button>
      </form>
    </div>
  );
}
