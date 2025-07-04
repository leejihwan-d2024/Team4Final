import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/NaverProductList.css"; // CSS 연결
import Layout from "./Layout";
import ProductCard from "./ProductCard";

export interface Product {
  productId: string;
  title: string;
  link: string;
  image: string;
  lprice: string;
}

function NaverProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("러닝화");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/shop/search", {
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
    <div className="product-wrapper">
      <Layout>
        상품검색
        <input
          placeholder="러닝관련상품을 검색해보세요."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        ></input>
        <button type="submit" onClick={handleSearch}>
          검색
        </button>
      </Layout>
      <nav>
        <a href="/liked">❤️찜한 상품</a>
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
  );
}

export default NaverProductList;
