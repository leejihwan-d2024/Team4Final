import React, { useEffect, useRef } from "react";
import axios from "axios";

declare global {
  interface Window {
    kakao: any;
  }
}

interface LatLngPoint {
  y: number; // 위도
  x: number; // 경도
}

interface PathMapProps {
  measurementId: number; // 측정 ID를 props로 받음
}

const PathMap: React.FC<PathMapProps> = ({ measurementId }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const clickedPathRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=d8cabba1e32d18944c91cfe3d17dc29f&autoload=false";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(async () => {
        if (!mapRef.current) return;

        const kakao = window.kakao;
        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.565235, 126.98583),
          level: 3,
        });
        mapInstanceRef.current = map;
        // 서버로부터 기존 경로 데이터 가져오기
        try {
          const response = await axios.get<LatLngPoint[]>(
            `https://200.200.200.62:8080/getpath/${measurementId}`
          );

          const pathData = response.data;
          if (!pathData || pathData.length === 0) {
            console.warn("경로 데이터가 없습니다.");
          } else {
            const linePath = pathData.map(
              (point) => new kakao.maps.LatLng(point.y, point.x)
            );

            map.setCenter(linePath[0]);

            const polyline = new kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 5,
              strokeColor: "#0000FF",
              strokeOpacity: 0.7,
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
          }
        } catch (error) {
          console.error("경로 데이터 로드 실패:", error);
        }

        kakao.maps.event.addListener(map, "click", function (mouseEvent: any) {
          const latlng = mouseEvent.latLng;

          const resultDiv = document.getElementById("result");
          if (resultDiv)
            resultDiv.innerHTML =
              "클릭한 위치의 위도는 " +
              latlng.getLat() +
              " 이고, 경도는 " +
              latlng.getLng() +
              " 입니다";

          clickedPathRef.current.push(latlng);

          if (polylineRef.current) {
            polylineRef.current.setMap(null);
          }

          const newLine = new kakao.maps.Polyline({
            path: clickedPathRef.current,
            strokeWeight: 3,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeStyle: "solid",
          });
          newLine.setMap(map);
          polylineRef.current = newLine;

          // 시작점 마커는 최초 한 번만 추가
          if (
            clickedPathRef.current.length === 1 &&
            startMarkerRef.current === null
          ) {
            startMarkerRef.current = new kakao.maps.Marker({
              position: latlng,
              title: "시작점",
              map: map,
            });
          }

          // 종료점 마커 갱신
          if (endMarkerRef.current) {
            endMarkerRef.current.setMap(null); // 이전 마커 제거
          }
          endMarkerRef.current = new kakao.maps.Marker({
            position: latlng,
            title: "종료점",
            map: map,
          });
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [measurementId]);

  return (
    <>
      <div ref={mapRef} style={{ width: "600px", height: "400px" }} />
      <div id="result" style={{ marginTop: "10px", fontWeight: "bold" }} />
      <button
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#ff5e5e",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() => {
          if (clickedPathRef.current.length === 0) return;

          // 마지막 좌표 제거
          clickedPathRef.current.pop();

          // 기존 선 제거
          if (polylineRef.current) {
            polylineRef.current.setMap(null);
          }

          // 클릭된 점이 더 이상 없을 경우 마커 전부 제거
          if (clickedPathRef.current.length === 0) {
            if (startMarkerRef.current) {
              startMarkerRef.current.setMap(null);
              startMarkerRef.current = null;
            }
            if (endMarkerRef.current) {
              endMarkerRef.current.setMap(null);
              endMarkerRef.current = null;
            }
            return;
          }

          // 새로운 선 다시 그림
          const kakao = window.kakao;
          const newLine = new kakao.maps.Polyline({
            path: clickedPathRef.current,
            strokeWeight: 3,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeStyle: "solid",
          });
          newLine.setMap(mapInstanceRef.current);
          polylineRef.current = newLine;

          // 종료점 마커 제거 및 재설정
          if (endMarkerRef.current) {
            endMarkerRef.current.setMap(null);
          }
          endMarkerRef.current = new kakao.maps.Marker({
            position: clickedPathRef.current[clickedPathRef.current.length - 1],
            title: "종료점",
            map: mapInstanceRef.current,
          });
        }}
      >
        🔁 되돌리기
      </button>
    </>
  );
};

export default PathMap;
