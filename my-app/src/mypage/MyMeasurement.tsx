import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

declare global {
  interface Window {
    kakao: any;
  }
}

interface LatLngPoint {
  x: number;
  y: number;
}

interface MeasureSimpleDTO {
  label: string;
  timestamp: string;
  measurementId: number;
}

const MyMeasure = () => {
  const { UserId } = useParams<{ UserId: string }>();
  const [measures, setMeasures] = useState<MeasureSimpleDTO[]>([]);
  const [customPathIndex, setCustomPathIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedMeasure, setSelectedMeasure] =
    useState<MeasureSimpleDTO | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const colors = ["#FF0000", "#00AAFF", "#00C851", "#AA66CC"];

  useEffect(() => {
    if (!UserId) return;

    axios
      .get<MeasureSimpleDTO[]>(
        `https://200.200.200.62:8080/getrecentmeasure/${UserId}`
      )
      .then((res) => {
        setMeasures(res.data);
      })
      .catch((err) => {
        console.error("측정 리스트 불러오기 실패:", err);
      });
  }, [UserId]);

  const handleMeasureClick = async (measure: MeasureSimpleDTO) => {
    setSelectedMeasure(measure);
    setShowModal(true);
    const color = colors[customPathIndex % colors.length];

    try {
      const response = await axios.get<LatLngPoint[]>(
        `https://200.200.200.62:8080/getpath/${measure.measurementId}`
      );
      const pathData = response.data;
      if (!pathData || pathData.length === 0) return;

      // 💡 지도를 약간 지연시켜서 DOM 완전히 그려진 후에 초기화
      setTimeout(() => {
        if (!window.kakao || !window.kakao.maps || !mapContainerRef.current)
          return;

        window.kakao.maps.load(() => {
          const kakao = window.kakao;
          const map = new kakao.maps.Map(mapContainerRef.current!, {
            center: new kakao.maps.LatLng(pathData[0].y, pathData[0].x),
            level: 5,
          });

          const linePath = pathData.map(
            (point) => new kakao.maps.LatLng(point.y, point.x)
          );

          const polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 4,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeStyle: "solid",
          });

          polyline.setMap(map);

          new kakao.maps.Marker({
            position: linePath[0],
            title: "시작점",
            map: map,
          });

          new kakao.maps.Marker({
            position: linePath[linePath.length - 1],
            title: "종료점",
            map: map,
          });
        });
      }, 300); // 최소 300ms 이상 권장
      setCustomPathIndex((prev) => prev + 1);
    } catch (err) {
      console.error("경로 불러오기 실패:", err);
      alert("경로 불러오기 실패");
    }
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
            <div
              ref={mapContainerRef}
              style={{
                flex: 1,
                border: "1px solid #ccc",
                marginTop: "10px",
                minHeight: "300px",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeasure;
