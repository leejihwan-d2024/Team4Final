import React, { useEffect, useRef, useState } from "react";
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

interface PathDataItem {
  path_id: string;
  path_order: number;
  location_x: number;
  location_y: number;
}

interface PathMapProps {
  measurementId: number; // 측정 ID
}

const PathMap: React.FC<PathMapProps> = ({ measurementId }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const clickedPathRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const [currentPathId, setCurrentPathId] = useState<string | null>(null);

  const username = "testuser";

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

        // 기존 경로 가져오기
        try {
          const response = await axios.get<LatLngPoint[]>(
            `https://200.200.200.62:8080/getpath/${measurementId}`
          );

          const pathData = response.data;
          if (pathData && pathData.length > 0) {
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

        // 클릭 이벤트
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

          if (endMarkerRef.current) {
            endMarkerRef.current.setMap(null);
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

  const handleSavePath = async () => {
    if (clickedPathRef.current.length === 0) {
      alert("저장할 경로가 없습니다.");
      return;
    }

    try {
      // path_id 결정: 백엔드가 testuser_0, _1... 중 사용 가능한 것 자동 선택
      const pathId =
        currentPathId ??
        (
          await axios.get(
            `https://200.200.200.62:8080/nextpathid?username=${username}`
          )
        ).data.pathId;

      setCurrentPathId(pathId);

      // path list 변환
      const pathData: PathDataItem[] = clickedPathRef.current.map(
        (point, index) => ({
          path_id: pathId,
          path_order: index,
          location_x: point.getLng(),
          location_y: point.getLat(),
        })
      );

      // 저장 요청
      await axios.post("https://200.200.200.62:8080/savecustompath", pathData);
      alert(`경로가 성공적으로 저장되었습니다. (ID: ${pathId})`);
    } catch (err) {
      console.error("경로 저장 실패:", err);
      alert("경로 저장에 실패했습니다.");
    }
  };

  return (
    <>
      <div ref={mapRef} style={{ width: "600px", height: "400px" }} />
      <div id="result" style={{ marginTop: "10px", fontWeight: "bold" }} />

      <div style={{ marginTop: "10px" }}>
        <button
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff5e5e",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "8px",
          }}
          onClick={() => {
            if (clickedPathRef.current.length === 0) return;

            clickedPathRef.current.pop();

            if (polylineRef.current) {
              polylineRef.current.setMap(null);
            }

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

            if (endMarkerRef.current) {
              endMarkerRef.current.setMap(null);
            }
            endMarkerRef.current = new kakao.maps.Marker({
              position:
                clickedPathRef.current[clickedPathRef.current.length - 1],
              title: "종료점",
              map: mapInstanceRef.current,
            });
          }}
        >
          🔁 되돌리기
        </button>

        <button
          style={{
            padding: "8px 16px",
            backgroundColor: "#1e90ff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleSavePath}
        >
          💾 저장하기
        </button>
      </div>
    </>
  );
};

export default PathMap;
