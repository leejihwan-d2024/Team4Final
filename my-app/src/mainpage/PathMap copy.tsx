import React, { useEffect, useRef } from "react";

// 전역 kakao 객체 선언
declare global {
  interface Window {
    kakao: any;
  }
}

const PathMap = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=d8cabba1e32d18944c91cfe3d17dc29f&autoload=false";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const kakao = window.kakao;
        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(33.450701, 126.570667),
          level: 3,
        });

        // 🔶 선을 구성할 좌표 (예시)
        const linePath = [
          new kakao.maps.LatLng(33.450701, 126.570667),
          new kakao.maps.LatLng(33.450936, 126.569477),
          new kakao.maps.LatLng(33.450879, 126.56994),
          new kakao.maps.LatLng(33.451393, 126.570738),
        ];

        const polyline = new kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 5,
          strokeColor: "#FF0000",
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });

        polyline.setMap(map);

        // 🔶 마커 위치 배열
        const positions = [
          {
            title: "카카오",
            latlng: new kakao.maps.LatLng(33.450705, 126.570677),
          },
          {
            title: "생태연못",
            latlng: new kakao.maps.LatLng(33.450936, 126.569477),
          },
          {
            title: "텃밭",
            latlng: new kakao.maps.LatLng(33.450879, 126.56994),
          },
          {
            title: "근린공원",
            latlng: new kakao.maps.LatLng(33.451393, 126.570738),
          },
        ];

        // 🔶 커스텀 마커 이미지
        const imageSrc =
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

        positions.forEach((pos) => {
          const imageSize = new kakao.maps.Size(24, 35);
          const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

          new kakao.maps.Marker({
            map: map,
            position: pos.latlng,
            title: pos.title,
            image: markerImage,
          });
        });
      });
    };

    document.head.appendChild(script);
  }, []);

  return <div ref={mapRef} style={{ width: "500px", height: "400px" }} />;
};

export default PathMap;
