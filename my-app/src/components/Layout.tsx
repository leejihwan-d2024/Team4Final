import { useNavigate } from "react-router-dom";
import "../styles/Layout.css";
import { ReactNode, useState } from "react";
import NaverProductList from "./NaverProductList";
import RunningInfo from "./RunningInfo";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  const [showProduct, setShowProduct] = useState(false);

  return (
    <div className="layout">
      <div className="layout-header" onClick={() => navigate("/posts")}>
        RUNNING <br /> CREW
      </div>
      <div className="search-area">
        <input className="search-input" placeholder="검색 창" />
        <button
          type="submit"
          className="searchBtn
        "
        >
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
              <li>대회정보확인</li>
            </ul>
          </li>
          <li className="menu-item" onClick={() => navigate("/posts")}>
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
