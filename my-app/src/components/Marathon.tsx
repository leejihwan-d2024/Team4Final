import { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import "../styles/Marathon.css"; // 스타일 파일 추가
import styled from "styled-components";

interface Mara {
  대회명: string;
  대회일시: string;
  대회장소: string;
  종목: string;
  주최: string;
}
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
  overflow-y: auto;
  overflow-x: hidden;
`;

function Marathon() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<Mara[]>([]);
  const [filteredData, setFilteredData] = useState<Mara[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://api.odcloud.kr/api/15138980/v1/uddi:eedc77c5-a56b-4e77-9c1d-9396fa9cc1d3?page=1&perPage=100&serviceKey=%2BnOCaVW%2B1JSsryrxWSMuqK1a3sTxauT6IW8hPQ%2BtWOJH2HTN6Z7yLuZhe%2B8jljUjMejMViqk64VFryfg4C4oHQ%3D%3D"
        );
        setAllData(res.data.data);
        setFilteredData(res.data.data);
      } catch (err) {
        console.error("전체 대회정보 가져오기 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onClickSearch = () => {
    const keyword = input.trim();
    if (!keyword) {
      setFilteredData(allData);
    } else {
      const filtered = allData.filter(
        (item) =>
          item["대회명"].includes(keyword) ||
          item["종목"].includes(keyword) ||
          item["주최"].includes(keyword)
      );
      setFilteredData(filtered);
    }
  };

  return (
    <Wrapper>
      <div className="marathon-container">
        <Layout>마라톤대회정보</Layout>
        <h2 className="title">🏃 대회정보 검색</h2>
        <div className="search-box">
          <input
            className="search-input"
            placeholder="각종대회정보들을 검색해보세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="search-btn" onClick={onClickSearch}>
            검색
          </button>
        </div>

        {loading && (
          <p className="loading">🔄 대회 정보를 불러오는 중입니다...</p>
        )}

        <ul className="marathon-list">
          {filteredData.map((item, idx) => (
            <li key={idx} className="marathon-card">
              <h3>{item["대회명"]}</h3>
              <p>
                <strong>📅 일시:</strong> {item["대회일시"]}
              </p>
              <p>
                <strong>📍 장소:</strong> {item["대회장소"]}
              </p>
              <p>
                <strong>🏁 종목:</strong> {item["종목"]}
              </p>
              <p>
                <strong>👥 주최:</strong> {item["주최"]}
              </p>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  item["대회명"]
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="search-link"
              >
                🔍 구글에서 자세히 보기
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Wrapper>
  );
}

export default Marathon;
