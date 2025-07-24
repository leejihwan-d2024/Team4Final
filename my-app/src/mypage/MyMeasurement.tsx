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
    console.log("선택한 measurementId:", measure.measurementId); // 여기 추가
    setSelectedMeasure(measure);
    setShowModal(true);
  };

  return (
    <div style={{ padding: "20px" }}>
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
          }}
        >
          <p>제목: {item.label}</p>
          <p>날짜: {new Date(item.timestamp).toLocaleString()}</p>
        </div>
      ))}

      {/* 모달 */}
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
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
              width: "90%",
              maxWidth: "800px",
              height: "600px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
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
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {selectedMeasure.label}
            </h3>
            <p>
              📅 측정일: {new Date(selectedMeasure.timestamp).toLocaleString()}
            </p>
            <p>
              📌 이 측정 경로는 사용자가 활동한 GPS 데이터를 기반으로
              시각화됩니다.
            </p>

            {/* ✅ 지도 컴포넌트로 대체됨 */}
            <div style={{ flex: 1, marginTop: "10px", minHeight: "300px" }}>
              <PathMap measurementId={selectedMeasure.measurementId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeasure;
