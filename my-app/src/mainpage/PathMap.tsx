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

  useEffect(() => {
    // 카카오 지도 스크립트 비동기 로딩
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=d8cabba1e32d18944c91cfe3d17dc29f&autoload=false";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(async () => {
        if (!mapRef.current) return;

        const kakao = window.kakao;

        // 지도 초기화 (임시 중심 좌표)
        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.565235, 126.98583),
          level: 3,
        });

        try {
          // 서버에서 경로 좌표 데이터 받아오기
          const response = await axios.get<LatLngPoint[]>(
            `https://200.200.200.62:8080/getpath/${measurementId}`
          );

          const pathData = response.data;

          if (!pathData || pathData.length === 0) {
            console.warn("경로 데이터가 없습니다.");
            return;
          }

          // 좌표 배열을 Kakao LatLng 배열로 변환
          const linePath = pathData.map(
            (point) => new kakao.maps.LatLng(point.y, point.x)
          );

          // 지도 중심을 경로 첫 좌표로 설정
          map.setCenter(linePath[0]);

          // 폴리라인 생성
          const polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 5,
            strokeColor: "#0000FF",
            strokeOpacity: 0.7,
            strokeStyle: "solid",
          });

          // 지도에 폴리라인 표시
          polyline.setMap(map);

          // 필요시 마커 추가 예 (경로 시작점과 끝점)
          const startMarker = new kakao.maps.Marker({
            position: linePath[0],
            title: "시작점",
          });
          startMarker.setMap(map);

          const endMarker = new kakao.maps.Marker({
            position: linePath[linePath.length - 1],
            title: "종료점",
          });
          endMarker.setMap(map);
        } catch (error) {
          console.error("경로 데이터 로드 실패:", error);
        }
      });
    };

    document.head.appendChild(script);

    // 클린업: 컴포넌트 언마운트 시 스크립트 제거 (선택사항)
    return () => {
      document.head.removeChild(script);
    };
  }, [measurementId]);

  return <div ref={mapRef} style={{ width: "600px", height: "400px" }} />;
};

export default PathMap;
