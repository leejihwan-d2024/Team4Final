import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/NaverProductList.css"; // CSS 연결
import Layout from "./Layout";
import ProductCard from "./ProductCard";
import styled from "styled-components";
import { getApiBaseUrl } from "../utils/apiUtils";

export interface Product {
  productId: string;
  title: string;
  link: string;
  image: string;
  lprice: string;
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
  overflow: visible;
  overflow-y: auto;
  overflow-x: hidden; // ✅ 팝업 메뉴가 잘리지 않도록
`;

function NaverProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("러닝화");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${getApiBaseUrl()}api/shop/search`, {
          params: { query },
        });
        setProducts(res.data.items);
      } catch (err) {
        console.error("Spring 중계 API 호출 실패", err);
      }
    };

    fetchProducts();
  }, [query]);
  const handleSearch = () => {
    setQuery(inputValue); // 검색 시 query 갱신
  };

  return (
    <Wrapper>
      <div className="product-wrapper">
        <Layout>
          상품검색
          <input
            className="input"
            placeholder="러닝관련상품을 검색해보세요."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></input>
          <button type="submit" className="btnn" onClick={handleSearch}>
            검색
          </button>
        </Layout>
        <nav>
          <a href="/liked" className="hh">
            ❤️찜한 상품
          </a>
        </nav>
        <h2 className="product-title">
          🛍️ 상품 검색: <span>{query}</span>
        </h2>
        <ul className="product-list">
          {products.map((item, index) => (
            <ProductCard
              key={index}
              product={{
                ...item,
                productId: item.link,
              }}
              userId="user001"
            />
          ))}
        </ul>
      </div>
    </Wrapper>
  );
}

export default NaverProductList;
