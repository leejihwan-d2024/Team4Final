import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../App.css";
import LocationTracker from "./LocationTracker";
import PathMap from "./PathMap";
import MainMenu from "./MainMenu";

const Wrapper = styled.div`
  max-width: 360px;
  height: 640px;
  margin: auto;
  padding: 16px;
  box-sizing: border-box;
  background: #f9f9f9;
  font-size: 14px;

  position: relative; // ✅ 메뉴 기준 위치를 잡기 위해 필요
  overflow: visible; // ✅ 팝업 메뉴가 잘리지 않도록
`;

const LocationBox = styled.div`
  margin-bottom: 12px;
  font-weight: bold;
`;

const FullWidthButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #1e40af;
  }
`;

function MainPage() {
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

        fetch(
          `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
          {
            method: "GET",
            headers: {
              Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07",
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
    <Wrapper>
      <LocationBox>현재 위치 : {location}</LocationBox>

      <MainMenu />

      <LocationTracker />
    </Wrapper>
  );
}

export default MainPage;
