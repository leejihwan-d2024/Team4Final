import React, { useState } from "react";
import styled from "styled-components";

function MainPage() {
  const [getRunning, setRunning] = useState(-1);

  return (
    <div className="App">
      <div className="LocationDataArea">
        <span>현재 위치 :</span>
        <span>ㅁㅁ구 ㅁㅁ동</span>
      </div>
      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        onClick={function () {
          alert("메뉴");
        }}
      >
        (메뉴버튼)
      </button>

      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        onClick={function () {
          if (getRunning == 1) {
            alert("달리기종료");
            const body = document.querySelector("body");
            if (body) {
              body.style.backgroundColor = "grey";
            }
          }
          if (getRunning == -1) {
            alert("달리기시작");
            const body = document.querySelector("body");
            if (body) {
              body.style.backgroundColor = "green";
            }
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
    </div>
  );
}

export default MainPage;
