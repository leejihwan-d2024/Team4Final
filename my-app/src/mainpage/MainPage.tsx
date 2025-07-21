import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../App.css";
import LocationTracker from "./LocationTracker";
import PathMap from "./PathMap";
import { Link } from "react-router-dom";

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

      {/* 달리기, 메뉴 등은 기존 그대로 유지 */}
      <button
        type="button"
        className="fixed top-4 right-4 z-50 text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
        onClick={() => setMenuOpen(true)}
      >
        메뉴
      </button>
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b font-bold text-lg">📋 메뉴</div>
        <ul className="p-4 space-y-4">
          <li>
            <Link to="/testmain" className="text-blue-700 hover:underline">
              📞 테스트메인
            </Link>
          </li>
          <li>
            <Link to="/FirstPage" className="text-blue-700 hover:underline">
              📌 로그인페이지
            </Link>
          </li>
          <li>
            <Link to="/MainPage2" className="text-blue-700 hover:underline">
              🔧 크루메인
            </Link>
          </li>
          <li>
            <Link to="/CrewCreate" className="text-blue-700 hover:underline">
              📞 크루생성
            </Link>
          </li>
          <li>
            <Link to="/achv" className="text-blue-700 hover:underline">
              📞 업적
            </Link>
          </li>
          <li>
            <Link to="/posts" className="text-blue-700 hover:underline">
              📞 게시판
            </Link>
          </li>
          <li>
            <Link to="/shop" className="text-blue-700 hover:underline">
              📞 관련상품
            </Link>
          </li>
          <li>
            <Link to="/info" className="text-blue-700 hover:underline">
              📞 관련정보
            </Link>
          </li>
          <li>
            <Link to="/marathon" className="text-blue-700 hover:underline">
              📞 대회정보
            </Link>
          </li>
          <li>
            <Link to="/mypage" className="text-blue-700 hover:underline">
              📞 마이페이지
            </Link>
          </li>
        </ul>
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          ✖
        </button>
      </div>
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
