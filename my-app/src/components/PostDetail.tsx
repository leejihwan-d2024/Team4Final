import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Post } from "../types/post";
import "../styles/PostDetail.css";
import Comment from "./Comment";
import styled from "styled-components";

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

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null); // 🔹 에러 상태

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}api/posts/${id}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        console.error("게시글을 불러오는 데 실패했습니다:", err);
        setError("게시글을 불러오는 데 실패했습니다."); // 🔹 에러 메시지 설정
      }
    };
    fetchDetail();
  }, [id]);

  if (error) return <div>{error}</div>; // 🔹 에러 출력
  if (!post) return <div>불러오는 중...</div>;

  return (
    <Wrapper>
      <div className="post-detail-container">
        <h2>제목: {post.title}</h2>
        <div className="detail-box">
          <p>작성자: {post.author}</p>
          <p className="content"> {post.contentText}</p>
        </div>
        <p>카테고리: {post.category}</p>
        <p>날짜: {post.createdAt}</p>
        <hr></hr>
        <Comment postId={post.postId} />
      </div>
    </Wrapper>
  );
}

export default PostDetail;
