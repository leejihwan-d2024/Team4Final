import React, { SetStateAction, useEffect, useRef, useState } from "react";
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
  measurementId?: number; // 측정 ID
  setPathPoints?: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number }[]>
  >;
  CrewId?: string;
  mode?: string; // 선택적 mode 추가
}

const PathMap: React.FC<PathMapProps> = ({
  measurementId,
  setPathPoints,
  CrewId,
  mode,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const clickedPathRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const [currentPathId, setCurrentPathId] = useState<string | null>(null);
  const [customPathIndex, setCustomPathIndex] = useState(0);

  const colors = [
    "#FF0000", // 빨강
    "#FF7F00", // 주황
    "#FFFF00", // 노랑
    "#00FF00", // 초록
    "#0000FF", // 파랑
    "#000080", // 남색
    "#8B00FF", // 보라
  ];
  const handleUndoPath = () => {
    if (clickedPathRef.current.length > 0) {
      clickedPathRef.current.pop(); // 마지막 포인트 제거

      // 기존 선 제거
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      // 선 다시 그림
      const newLine = new window.kakao.maps.Polyline({
        path: clickedPathRef.current,
        strokeWeight: 3,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
      newLine.setMap(mapInstanceRef.current);
      polylineRef.current = newLine;

      // 시작점 마커
      if (clickedPathRef.current.length === 0 && startMarkerRef.current) {
        startMarkerRef.current.setMap(null);
        startMarkerRef.current = null;
      }

      // 종료점 마커 업데이트
      if (endMarkerRef.current) {
        endMarkerRef.current.setMap(null);
      }

      if (clickedPathRef.current.length > 0) {
        endMarkerRef.current = new window.kakao.maps.Marker({
          position: clickedPathRef.current[clickedPathRef.current.length - 1],
          title: "종료점",
          map: mapInstanceRef.current,
        });
      } else {
        endMarkerRef.current = null;
      }

      // 상위 컴포넌트에 경로 전달
      if (typeof setPathPoints === "function") {
        const arr = clickedPathRef.current.map((point) => ({
          lat: point.getLat(),
          lng: point.getLng(),
        }));
        setPathPoints(arr);
      }
    }
  };

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

        if (measurementId) {
          try {
            const response = await axios.get<LatLngPoint[]>(
              `${process.env.REACT_APP_API_BASE_URL}getpath/${measurementId}`
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
        } else {
          // measurementId 없으면 기본 지도 상태 (필요시 구현)
          map.setCenter(new kakao.maps.LatLng(37.565235, 126.98583));
        }

        // 클릭 이벤트 등록 (기존 로직 유지)
        kakao.maps.event.addListener(map, "click", function (mouseEvent: any) {
          const latlng = mouseEvent.latLng;

          const resultDiv = document.getElementById("result");
          /*
          if (resultDiv)
            resultDiv.innerHTML =
              "클릭한 위치의 위도는 " +
              latlng.getLat() +
              " 이고, 경도는 " +
              latlng.getLng() +
              " 입니다";
*/
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

          if (typeof setPathPoints === "function") {
            const arr = clickedPathRef.current.map((point) => ({
              lat: point.getLat(),
              lng: point.getLng(),
            }));
            setPathPoints(arr);
          }
        });
      });
    };

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [measurementId, setPathPoints]);

  const handleSavePath = async () => {
    if (clickedPathRef.current.length === 0) {
      alert("저장할 경로가 없습니다.");
      return;
    }

    let pathId: string | undefined;
    if (CrewId) {
      pathId = CrewId;
    } else if (measurementId) {
      pathId = measurementId.toString();
    } else {
      alert("저장할 경로 ID가 없습니다.");
      return;
    }

    try {
      setCurrentPathId(pathId);

      const pathData: PathDataItem[] = clickedPathRef.current.map(
        (point, index) => ({
          path_id: pathId!,
          path_order: index,
          location_x: point.getLng(),
          location_y: point.getLat(),
        })
      );

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}savecustompath`,
        pathData
      );
      alert(`경로가 성공적으로 저장되었습니다. (ID: ${pathId})`);
    } catch (err) {
      console.error("경로 저장 실패:", err);
      alert("경로 저장에 실패했습니다.");
    }
  };

  const handleLoadCustomPath = async () => {
    let pathId: string | undefined;

    if (CrewId) {
      pathId = CrewId;
    } else if (measurementId) {
      pathId = measurementId.toString();
    } else {
      return; // 불러올 경로 ID 없으면 종료
    }

    const color = colors[customPathIndex % colors.length];

    try {
      const apiUrl =
        CrewId && mode === "OnlyMap"
          ? `${process.env.REACT_APP_API_BASE_URL}getcustompath/${pathId}`
          : `${process.env.REACT_APP_API_BASE_URL}getpath/${pathId}`;

      console.log("불러오기 API 호출:", apiUrl);

      const response = await axios.get<LatLngPoint[]>(apiUrl);

      const kakao = window.kakao;
      const pathData = response.data;
      if (!mapInstanceRef.current || pathData.length === 0) return;

      const linePath = pathData.map(
        (point) => new kakao.maps.LatLng(point.y, point.x)
      );

      mapInstanceRef.current.setCenter(linePath[0]);

      const polyline = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 4,
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      });

      polyline.setMap(mapInstanceRef.current);

      new kakao.maps.Marker({
        position: linePath[0],
        title: `경로 ${customPathIndex} 시작점`,
        map: mapInstanceRef.current,
      });

      new kakao.maps.Marker({
        position: linePath[linePath.length - 1],
        title: `경로 ${customPathIndex} 종료점`,
        map: mapInstanceRef.current,
      });

      setCustomPathIndex((prev) => prev + 1);
    } catch (err) {
      console.error("커스텀 경로 불러오기 실패:", err);
      alert("경로 불러오기 실패");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!CrewId && measurementId) {
        handleLoadCustomPath().catch(() => {});
      } else if (CrewId && mode === "OnlyMap") {
        handleLoadCustomPath().catch(() => {});
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [CrewId, measurementId, mode]);

  return (
    <>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "none",
        }}
      />
      <div id="result" style={{ marginTop: "10px", fontWeight: "bold" }} />

      {/* mode가 "OnlyMap"이 아닐 때만 버튼 3개 보여줌 */}
      {mode !== "OnlyMap" && (
        <div style={{ marginTop: "10px" }}>
          <button
            type="button"
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#ff5e5e",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "4px",
            }}
            onClick={() => {
              handleUndoPath();
            }}
          >
            🔁 되돌리기
          </button>

          <button
            type="button"
            style={{
              padding: "4px 8px",
              fontSize: "12px",
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
          {/*
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginLeft: "8px",
            }}
            onClick={handleLoadCustomPath}
          >
            📂 불러오기
          </button>
          <span>현재저장모드: {CrewId ?? measurementId ?? "없음"}</span>
           */}
        </div>
      )}
    </>
  );
};

export default PathMap;
