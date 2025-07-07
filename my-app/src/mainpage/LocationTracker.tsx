// LocationTracker.tsx
import React, { useState, useRef } from "react";

interface LocationData {
  x: number;
  y: number;
  localdatetime: string;
}

const LocationTracker = () => {
  const [tracking, setTracking] = useState(false);
  const [buttonText, setButtonText] = useState("시작");
  const locationList = useRef<LocationData[]>([]);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lng = position.coords.longitude;
      const lat = position.coords.latitude;
      const now = new Date().toISOString();
      locationList.current.push({ x: lng, y: lat, localdatetime: now });
      console.log("Saved:", { x: lng, y: lat, localdatetime: now });
    });
  };

  const handleClick = () => {
    if (!tracking) {
      // 시작
      setTracking(true);
      setButtonText("종료");
      getLocation(); // 즉시 한 번 저장
      intervalId.current = setInterval(getLocation, 60000); // 1분마다 저장
    } else {
      // 종료
      setTracking(false);
      setButtonText("시작");
      if (intervalId.current) clearInterval(intervalId.current);
      getLocation(); // 종료 시 한 번 더 저장
      console.log(locationList.current);
      console.log(Array.isArray(locationList.current));
      console.log(locationList.current.length);
      // 서버 전송
      fetch("https://200.200.200.62:8080/savemeasure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberid: "none",
          list: locationList.current,
        }),
      })
        .then((res) => res.text())
        .then((data) => {
          console.log("서버 응답:", data);
          locationList.current = []; // 초기화
        })
        .catch((err) => console.error("전송 실패:", err));
    }
  };

  return <button onClick={handleClick}>{buttonText}</button>;
};

export default LocationTracker;
