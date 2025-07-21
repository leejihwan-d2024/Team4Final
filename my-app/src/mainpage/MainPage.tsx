import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../App.css";
import LocationTracker from "./LocationTracker";
import PathMap from "./PathMap";
import { Link } from "react-router-dom";
import MainMenu from "./MainMenu";

function MainPage() {
  const [getRunning, setRunning] = useState(-1);
  const [location, setLocation] = useState("불러오는 중...");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("위치 정보 지원 안됨");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Kakao API 호출
        fetch(
          `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
          {
            method: "GET",
            headers: {
              Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07", // REST API 키
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (!data.documents || data.documents.length === 0) {
              setLocation("주소 정보 없음");
              return;
            }
            const region2 = data.documents[0].region_2depth_name;
            const region3 = data.documents[0].region_3depth_name;
            setLocation(`${region2} ${region3}`);
          })
          .catch((err) => {
            console.error("주소 가져오기 실패:", err);
            setLocation("오류 발생");
          });
      },
      () => {
        setLocation("위치 접근 거부됨");
      }
    );
  }, []);

  return (
    <div className="App">
      <div className="LocationDataArea">
        <span>현재 위치 : </span>
        <span>{location}</span>
      </div>

      <MainMenu />
      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
        onClick={() => alert("커뮤니티")}
      >
        (커뮤니티버튼)
      </button>
      <LocationTracker />
    </div>
  );
}

export default MainPage;
