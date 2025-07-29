import { useEffect, useState } from "react";
import { Post } from "../types/post";
import { fetchPosts } from "../api/api";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import "../styles/PostMain.css";
import axios from "axios";
import styled from "styled-components";

interface PostMainProps {
  posts: Post[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (post: Post) => Promise<void>;
  onSelect: (id: number) => Promise<void>;
}

function PostMain({ posts, onDelete, onEdit, onSelect }: PostMainProps) {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [likedPosts, setLikedPosts] = useState<number[]>([]); // 👍 좋아요 상태 저장
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const postsPerPage = 3; // 한 페이지에 보여줄 게시글 수
  // 페이지 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = user?.userId;

  const navigate = useNavigate();
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

  useEffect(() => {
    fetchPosts().then((data) => {
      setAllPosts(data);
      setFilteredPosts(data); // 초기엔 전체 보여줌
    });
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}api/posts/${id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      alert("삭제 완료");
      setSelectedPost(null);
      const updatedPosts = await fetchPosts();
      setAllPosts(updatedPosts);
      applyCategoryFilter(selectedCategory, updatedPosts); // 필터 다시 적용
    } else {
      alert("삭제 실패");
    }
  };

  const handleEdit = (post: Post) => {
    navigate(`/write/${post.postId}`);
  };

  const applyCategoryFilter = (
    category: string,
    sourcePosts: Post[] = allPosts
  ) => {
    setSelectedCategory(category);
    if (category === "전체") {
      setFilteredPosts(sourcePosts);
    } else {
      setFilteredPosts(
        sourcePosts.filter((post) => post.category === category)
      );
    }
  };

  // 👍 좋아요 토글 함수
  const toggleLike = async (post: Post) => {
    const alreadyLiked = likedPosts.includes(post.postId);
    const url = `${process.env.REACT_APP_API_BASE_URL}api/posts/${post.postId}/like`;

    const res = await fetch(url, {
      method: alreadyLiked ? "DELETE" : "POST",
    });

    if (res.ok) {
      let updatedList = [...likedPosts];
      let updatedPosts = [...filteredPosts];

      if (alreadyLiked) {
        updatedList = likedPosts.filter((id) => id !== post.postId);
        updatedPosts = updatedPosts.map((p) =>
          p.postId === post.postId ? { ...p, likeCount: p.likeCount - 1 } : p
        );
      } else {
        updatedList.push(post.postId);
        updatedPosts = updatedPosts.map((p) =>
          p.postId === post.postId ? { ...p, likeCount: p.likeCount + 1 } : p
        );
      }

      setLikedPosts(updatedList);
      setFilteredPosts(updatedPosts);
    } else {
      alert("좋아요 처리 실패");
    }
  };

  const categories = ["전체", "러닝", "스포츠", "잡담", "이슈"];

  return (
    <Wrapper>
      <div className="main-container">
        <Layout>
          <div className="center-group">러닝 크루 게시판</div>
        </Layout>

        <div className="category-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => applyCategoryFilter(cat)}
              style={{
                margin: "0 5px",
                padding: "5px 10px",
                backgroundColor:
                  selectedCategory === cat ? "#c4d92d" : "#d1e15b",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <br />
        <div>
          <h2>전체 게시글</h2>
          <button onClick={() => navigate("/write")} className="write">
            ✏️글쓰기
          </button>
        </div>
        <div className="postWrapperBox">
          <ul className="postUl">
            {currentPosts.map((post) => (
              <li key={post.postId}>
                <span
                  onClick={async () => {
                    try {
                      await axios.post(
                        `${process.env.REACT_APP_API_BASE_URL}api/posts/${post.postId}/view`
                      );
                      navigate(`/detail/${post.postId}`);
                    } catch (err) {
                      console.error("조회수 증가 실패", err);
                      navigate(`/detail/${post.postId}`); // 실패해도 페이지 이동
                    }
                  }}
                >
                  {post.postId} . {post.title} -🖊{post.category}
                </span>

                <span>
                  {post.createdAt}
                  👍{post.likeCount}
                </span>

                <span>조회수: {post.viewCount}</span>

                <button onClick={() => toggleLike(post)}>
                  {likedPosts.includes(post.postId) ? "좋아요 취소" : "좋아요"}
                </button>

                {/*  로그인한 사용자만 수정/삭제 가능 */}
                {post.author === currentUserId && (
                  <>
                    <button onClick={() => handleEdit(post)}>수정</button>
                    <button onClick={() => handleDelete(post.postId)}>
                      삭제
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="pagination">
            {Array.from(
              { length: Math.ceil(filteredPosts.length / postsPerPage) },
              (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    margin: "0 5px",
                    padding: "5px 10px",
                    backgroundColor: currentPage === i + 1 ? "#c4d92d" : "#eee",
                  }}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export default PostMain;
