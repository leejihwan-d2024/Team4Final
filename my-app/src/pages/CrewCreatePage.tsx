import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CrewCreate.module.css";
import axios from "axios";
import PathMap from "../mainpage/PathMap";

export default function CrewCreatePage() {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://localhost:8080/api/crews", {
        crewTitle: form.title,
        //나중에 닉네임관련 인증 필요
        startLocation: form.startLocation,
        endLocation: form.endLocation,
        startTime: new Date(), // 현재 시간 (나중에 시간 선택 가능)
        startLocationMapPoint: "37.123456,127.123456", // ⚠️ 임시
        endLocationMapPoint: "37.654321,127.654321", // ⚠️ 임시
        district: "서울시 마포구", // ⚠️ 임시
        isOver15: form.isOver15 ? 1 : 0,
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
          placeholder="출발지"
          value={form.startLocation}
          onChange={handleChange}
          required
        />
        <PathMap measurementId={7} />
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
