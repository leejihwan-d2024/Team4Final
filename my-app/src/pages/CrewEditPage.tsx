import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CrewCreate.module.css"; // 그대로 재사용
import axios from "axios";

export default function CrewEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    startLocation: "",
    endLocation: "",
    distance: "",
    duration: "",
    pace: "",
    description: "",
    isOver15: false,
  });

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const res = await axios.get(`https://localhost:8080/api/crews/${id}`);
        const crew = res.data;

        setForm({
          title: crew.crewTitle,
          startLocation: crew.startLocation,
          endLocation: crew.endLocation,
          distance: "", //  필요시 백엔드 확장
          duration: "",
          pace: "",
          description: "", //  필요시 백엔드 확장
          isOver15: crew.isOver15 === 1,
        });
      } catch (err) {
        console.error("❌ 크루 정보 불러오기 실패:", err);
        alert("크루 정보를 불러오지 못했습니다.");
      }
    };

    fetchCrew();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.put(`https://localhost:8080/api/crews/${id}?userId=1`, {
        crewTitle: form.title,
        startLocation: form.startLocation,
        endLocation: form.endLocation,
        startLocationMapPoint: "37.123456,127.123456", // ⚠️ 임시
        endLocationMapPoint: "37.654321,127.654321",
        district: "서울시 마포구",
        isOver15: form.isOver15 ? 1 : 0,
      });

      alert("수정 완료!");
      navigate(`/crews/${id}`);
    } catch (err) {
      console.error("❌ 수정 실패:", err);
      alert("수정 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>크루 수정</h2>
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
          placeholder="출발지"
          value={form.startLocation}
          onChange={handleChange}
          required
        />
        <input
          name="endLocation"
          placeholder="도착지"
          value={form.endLocation}
          onChange={handleChange}
          required
        />
        <input
          name="distance"
          placeholder="거리 (km)"
          value={form.distance}
          onChange={handleChange}
        />
        <input
          name="duration"
          placeholder="시간 (분)"
          value={form.duration}
          onChange={handleChange}
        />
        <input
          name="pace"
          placeholder="페이스 (분/km)"
          value={form.pace}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="설명"
          value={form.description}
          onChange={handleChange}
          rows={4}
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
          수정 완료
        </button>
      </form>
    </div>
  );
}
