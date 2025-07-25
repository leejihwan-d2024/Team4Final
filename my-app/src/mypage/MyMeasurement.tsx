import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import PathMap from "../mainpage/PathMap";

interface MeasureSimpleDTO {
  label: string;
  timestamp: string;
  measurementId: number;
}

const MyMeasure = () => {
  const { UserId } = useParams<{ UserId: string }>();
  const [measures, setMeasures] = useState<MeasureSimpleDTO[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMeasure, setSelectedMeasure] =
    useState<MeasureSimpleDTO | null>(null);

  useEffect(() => {
    if (!UserId) return;

    axios
      .get<MeasureSimpleDTO[]>(
        `https://200.200.200.62:8080/getrecentmeasure/${UserId}`
      )
      .then((res) => setMeasures(res.data))
      .catch((err) => console.error("측정 리스트 불러오기 실패:", err));
  }, [UserId]);

  const handleMeasureClick = (measure: MeasureSimpleDTO) => {
    console.log("선택한 measurementId:", measure.measurementId);
    setSelectedMeasure(measure);
    setShowModal(true);
  };

  return (
    <div
      style={{
        padding: "20px",
        width: "100%",
        maxWidth: "360px",
        height: "100%",
        maxHeight: "640px",
        overflowY: "auto",
        boxSizing: "border-box",
        margin: "0 auto",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
        📍 나의 측정 기록
      </h2>

      {measures.map((item, idx) => (
        <div
          key={idx}
          onClick={() => handleMeasureClick(item)}
          style={{
            border: "1px solid gray",
            margin: "8px 0",
            padding: "8px",
            cursor: "pointer",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <p>제목: {item.label}</p>
          <p>날짜: {new Date(item.timestamp).toLocaleString()}</p>
        </div>
      ))}

      {showModal && selectedMeasure && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "16px",
              width: "100%",
              maxWidth: "360px",
              height: "100%",
              maxHeight: "640px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                fontSize: "20px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "8px",
                marginTop: "30px",
              }}
            >
              {selectedMeasure.label}
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "4px" }}>
              📅 측정일: {new Date(selectedMeasure.timestamp).toLocaleString()}
            </p>
            <p style={{ fontSize: "13px", color: "#555" }}>
              📌 사용자의 GPS 활동 데이터를 기반으로 시각화됩니다.
            </p>

            <div
              style={{
                flex: 1,
                marginTop: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <PathMap
                measurementId={selectedMeasure.measurementId}
                mode="OnlyMap"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeasure;
