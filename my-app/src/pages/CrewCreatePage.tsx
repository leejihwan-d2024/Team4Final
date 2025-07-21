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
    distance: "",
    duration: "",
    pace: "",
    description: "",
    isOver15: false,
    startLocationMapPoint: "",
    endLocationMapPoint: "",
  });

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
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
      });

      console.log("✅ 서버 응답:", response.data);
      alert("크루가 생성되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("❌ 크루 생성 실패:", error);
      alert("크루 생성에 실패했습니다.");
    }
  };

  const [st, setSt] = useState<number[]>([]);
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");

  useEffect(() => {
    if (st[0] && st[1]) {
      fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${st[1]}&y=${st[0]}`,
        {
          method: "GET",
          headers: {
            Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07",
          },
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
              startLocation: `${st[0]},${st[1]}`,
              startLocationMapPoint: `${st[0]},${st[1]}`,
            }));
          } else {
            setStartAddress("주소 정보 없음");
          }
        })
        .catch((err) => {
          console.error("출발지 주소 가져오기 실패:", err);
          setStartAddress("오류 발생");
        });
    }
  }, [st[0], st[1]]);

  useEffect(() => {
    if (st[2] && st[3]) {
      fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${st[3]}&y=${st[2]}`,
        {
          method: "GET",
          headers: {
            Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07",
          },
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
              endLocation: `${st[2]},${st[3]}`,
              endLocationMapPoint: `${st[2]},${st[3]}`,
            }));
          } else {
            setEndAddress("주소 정보 없음");
          }
        })
        .catch((err) => {
          console.error("도착지 주소 가져오기 실패:", err);
          setEndAddress("오류 발생");
        });
    }
  }, [st[2], st[3]]);

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
          onChange={handleChange}
          hidden
        />
        <input
          name="startLocationString"
          placeholder="출발지 지역명"
          value={startAddress}
          readOnly
        />
        <PathMap measurementId={7} setSt={setSt} CrewId={form.crewId} />
        <input
          name="endLocation"
          value={form.endLocation}
          onChange={handleChange}
          hidden
        />
        <input
          name="endLocationString"
          placeholder="도착지 지역명"
          value={endAddress}
          readOnly
        />
        <input
          name="distance"
          placeholder="거리 (km)"
          value={form.distance}
          onChange={handleChange}
          required
        />
        <input
          name="duration"
          placeholder="시간 (분)"
          value={form.duration}
          onChange={handleChange}
          required
        />
        <input
          name="pace"
          placeholder="페이스 (분/km)"
          value={form.pace}
          onChange={handleChange}
          required
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
