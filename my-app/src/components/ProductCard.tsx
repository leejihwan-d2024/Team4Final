import axios from "axios";
import { useEffect, useState } from "react";
import { Product } from "../components/NaverProductList";
import styled from "styled-components";

function ProductCard({
  product,
  userId,
}: {
  product: Product;
  userId: string;
}) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const res = await axios.get(
          "https://localhost:8080/api/products/liked",
          {
            params: { userId },
          }
        );
        const likedList: Product[] = res.data;
        const isLiked = likedList.some((p) => p.link === product.link);
        setLiked(isLiked);
      } catch (err) {
        console.error("찜 여부 확인 실패", err);
      }
    };

    checkIfLiked();
  }, [product.link, userId]);

  // 찜 , 찜 해제 요청
  const handleLike = async () => {
    try {
      await axios.post(`https://localhost:8080/api/products/like`, product, {
        params: { userId },
        headers: {
          "Content-Type": "application/json",
        },
      });
      setLiked((prev) => !prev);
    } catch (err) {
      console.error("찜 요청 실패", err);
    }
  };

  return (
    <li className="product-card">
      <a href={product.link} target="_blank" rel="noopener noreferrer">
        <img src={product.image} alt={product.title} className="product-img" />
        <div
          className="product-name"
          dangerouslySetInnerHTML={{ __html: product.title }}
        />
        <p className="product-price">
          {parseInt(product.lprice).toLocaleString()}원
        </p>
      </a>
      <button onClick={handleLike} className="heart">
        {liked ? "❤️ 찜취소" : "🤍 찜하기"}
      </button>
    </li>
  );
}

export default ProductCard;
