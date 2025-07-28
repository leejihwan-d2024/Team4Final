import React, { useState, useRef, useEffect } from "react";
import PathMap from "./PathMap";

interface LocationData {
  x: number;
  y: number;
  localdatetime: string;
}

const LocationTracker = () => {
  const [tracking, setTracking] = useState(false);
  const [buttonText, setButtonText] = useState("시작");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [displayTime, setDisplayTime] = useState("00:00:00");

  const locationList = useRef<LocationData[]>([]);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const userStr = localStorage.getItem("user");
  const user = JSON.parse(userStr || "null");

  // 시간 포맷팅 함수
  const formatTime = (seconds: number): string => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // 타이머 텍스트 업데이트
  useEffect(() => {
    setDisplayTime(formatTime(elapsedSeconds));
  }, [elapsedSeconds]);

  // 비동기 위치 정보 가져오기
  const getLocationAsync = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lng = position.coords.longitude;
          const lat = position.coords.latitude;
          const now = new Date().toISOString();
          const data = { x: lng, y: lat, localdatetime: now };
          console.log("Saved:", data);
          resolve(data);
        },
        (error) => reject(error)
      );
    });
  };

  const handleClick = async () => {
    if (!tracking) {
      // 시작
      setTracking(true);
      setButtonText("종료");
      setElapsedSeconds(0); // 타이머 리셋

      // 타이머 시작
      timerId.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // 즉시 위치 저장
      const location = await getLocationAsync();
      locationList.current.push(location);

      // 1분마다 위치 저장
      intervalId.current = setInterval(async () => {
        const loc = await getLocationAsync();
        locationList.current.push(loc);
      }, 60000);
    } else {
      // 종료
      setTracking(false);
      setButtonText("시작");

      // 타이머 정지
      if (timerId.current) clearInterval(timerId.current);

      // 위치 수집 정지
      if (intervalId.current) clearInterval(intervalId.current);

      // 종료 위치 저장
      try {
        const lastLocation = await getLocationAsync();
        locationList.current.push(lastLocation);
      } catch (err) {
        console.error("마지막 위치 가져오기 실패:", err);
      }

      console.log("전송할 위치 리스트:", locationList.current);

      // 서버 전송
      fetch(`${process.env.REACT_APP_API_BASE_URL}savemeasure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberid: user?.userId ?? "none",
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

  return (
    <div
      style={{
        position: "relative",
        width: "100%", // 부모 너비 100%
        height: "100%", // 부모 높이 100%
        overflow: "hidden",
      }}
    >
      {/* PathMap: 전체화면 배경 + 조건부 표시 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: tracking ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          zIndex: 0,
          pointerEvents: tracking ? "auto" : "none",
        }}
      >
        <PathMap mode="OnlyMap" />
      </div>

      {/* 버튼 + 타이머: 부모 기준 간단 가운데 정렬 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <button
          onClick={handleClick}
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            backgroundColor: tracking ? "#ff4d4d" : "#4CAF50",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            border: "none",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
        >
          {buttonText}
        </button>

        <div
          style={{
            marginTop: "20px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#fff",
            textShadow: "1px 1px 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          {displayTime}
        </div>
      </div>
    </div>
  );
};

export default LocationTracker;
