import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "./NaverProductList";
import Layout from "./Layout";

function LikedProductList() {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const userId = "user001"; // 실제 로그인 사용자 ID로 변경 필요

  // 🔹 찜 목록 불러오기
  const fetchLikedProducts = async () => {
    try {
      const res = await axios.get("https://localhost:8080/api/products/liked", {
        params: { userId },
      });
      setLikedProducts(res.data);
    } catch (err) {
      console.error("찜 목록 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchLikedProducts();
  }, []);

  // 🔸 찜 취소 기능
  const handleUnlike = async (product: Product) => {
    try {
      await axios.post("https://localhost:8080/api/products/like", product, {
        params: { userId },
        headers: {
          "Content-Type": "application/json",
        },
      });
      // 목록에서 제거
      setLikedProducts((prev) => prev.filter((p) => p.link !== product.link));
    } catch (err) {
      console.error("찜 취소 실패", err);
    }
  };

  return (
    <Layout>
      <h2>❤️ 찜한 상품 목록</h2>
      <ul className="product-list">
        {likedProducts.map((product, index) => (
          <li key={index} className="product-card">
            <a href={product.link} target="_blank" rel="noopener noreferrer">
              <img
                src={product.image}
                alt={product.title}
                className="product-img"
              />
              <div dangerouslySetInnerHTML={{ __html: product.title }} />
              <p>{parseInt(product.lprice).toLocaleString()}원</p>
            </a>
            <button onClick={() => handleUnlike(product)}>💔 찜 취소</button>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export default LikedProductList;
