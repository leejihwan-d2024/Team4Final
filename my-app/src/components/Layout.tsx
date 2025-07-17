import { useNavigate } from "react-router-dom";
import "../styles/Layout.css";
import { ReactNode, useState } from "react";
import NaverProductList from "./NaverProductList";
import RunningInfo from "./RunningInfo";
import Marathon from "./Marathon";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [showProduct, setShowProduct] = useState(false);

  // 게시판 접근 핸들러
  const handleBoardClick = () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr || "null");

      if (user && user.name) {
        // 로그인 되어 있으면 게시판으로 이동
        navigate("/posts");
      } else {
        // 로그인 안 되어 있으면 로그인 후 돌아올 주소 저장
        alert("로그인이 필요합니다");
        localStorage.setItem("redirectAfterLogin", "/posts");
        navigate("/login");
      }
    } catch (e) {
      console.error("유저 정보 파싱 실패", e);
      navigate("/login");
    }
  };

  return (
    <div className="layout">
      <div className="layout-header" onClick={() => navigate("/posts")}>
        RUNNING <br /> CREW
      </div>
      <div className="search-area">
        <input className="search-input" placeholder="검색 창" />
        <button type="submit" className="searchBtn">
          검색
        </button>
      </div>
      <nav className="navbar">
        <ul className="menu">
          <li className="menu-item">
            러닝참여
            <ul className="submenu">
              <li>모임찾기</li>
              <li>혼자달리기</li>
            </ul>
          </li>
          <li className="menu-item">
            러닝정보
            <ul className="submenu">
              <li onClick={() => navigate("/info")}>러닝관련정보</li>
              {showProduct && <RunningInfo />}
              <li onClick={() => navigate("/shop")}>러닝관련상품</li>
              {showProduct && <NaverProductList />}
              <li onClick={() => navigate("/marathon")}>대회정보확인</li>
              {showProduct && <Marathon />}
            </ul>
          </li>
          <li className="menu-item" onClick={handleBoardClick}>
            게시판
            <ul className="submenu">
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </li>
          <li className="menu-item">
            마이페이지
            <ul className="submenu">
              <li>업적</li>
              <li>랭킹확인</li>
              <li>마이페이지</li>
            </ul>
          </li>
        </ul>
      </nav>
      <div className="layout-content">{children}</div>
    </div>
  );
}

export default Layout;
