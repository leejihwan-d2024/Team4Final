import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../App.css";
import LocationTracker from "./LocationTracker";
import PathMap from "./PathMap";

function MainPage() {
  const [getRunning, setRunning] = useState(-1);
  const [location, setLocation] = useState("불러오는 중...");

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

      {/* 달리기, 메뉴 등은 기존 그대로 유지 */}
      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 ..."
        onClick={() => alert("메뉴")}
      >
        (메뉴버튼)
      </button>

      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 ..."
        onClick={() => {
          if (getRunning === 1) {
            alert("달리기종료");
            document.body.style.backgroundColor = "grey";
          } else {
            alert("달리기시작");
            document.body.style.backgroundColor = "green";
          }
          setRunning(getRunning * -1);
        }}
      >
        <img
          className="fit-picture"
          src="/shared-assets/images/examples/grapefruit-slice.jpg"
          alt="running image"
        />
      </button>

      <div className="RunningDataArea">
        <ul>
          <li>
            <span>달린 시간 : </span>
            <span>00 : 00 : 00</span>
          </li>
          <li>
            <span>달린 거리 : </span>
            <span>0000</span>
          </li>
          <li>
            <span>칼로리 소모 : </span>
            <span>0000</span>
          </li>
        </ul>
      </div>

      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 ..."
        onClick={() => alert("커뮤니티")}
      >
        (커뮤니티버튼)
      </button>
      <LocationTracker />
      <PathMap measurementId={7} />
    </div>
  );
}

export default MainPage;
