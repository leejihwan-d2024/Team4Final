import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CrewCreate.module.css";

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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ 생성된 크루 정보:", form);
    alert("크루가 생성되었습니다!");
    navigate("/");
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
        <button type="submit" className={styles.submitBtn}>
          크루 생성
        </button>
      </form>
    </div>
  );
}
