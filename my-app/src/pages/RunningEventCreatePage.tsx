import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./RunningEventCreate.module.css";

export default function RunningEventCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    eventTitle: "",
    eventContent: "",
    startTime: "",
    endTime: "",
    startLocation: "",
    endLocation: "",
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
      const response = await axios.post("http://localhost:8080/api/events", {
        ...form,
        startTime: new Date(form.startTime),
        endTime: new Date(form.endTime),
      });
      alert("러닝 이벤트 생성 완료!");
      navigate("/");
    } catch (error) {
      console.error("❌ 생성 실패:", error);
      alert("이벤트 생성 실패!");
    }
  };

  return (
    <div className={styles.container}>
      <h2>러닝 이벤트 생성</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="eventTitle"
          placeholder="이벤트 제목"
          value={form.eventTitle}
          onChange={handleChange}
          required
        />
        <textarea
          name="eventContent"
          placeholder="이벤트 설명"
          value={form.eventContent}
          onChange={handleChange}
          rows={4}
          required
        />
        <input
          type="datetime-local"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="startLocation"
          placeholder="출발 위치"
          value={form.startLocation}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="endLocation"
          placeholder="도착 위치"
          value={form.endLocation}
          onChange={handleChange}
          required
        />
        <button type="submit" className={styles.submitBtn}>
          이벤트 생성
        </button>
      </form>
    </div>
  );
}
