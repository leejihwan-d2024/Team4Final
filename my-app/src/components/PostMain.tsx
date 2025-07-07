import { useEffect, useState } from "react";
import { Post } from "../types/post";
import { fetchPosts } from "../api/api";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import "../styles/PostMain.css";

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

  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts().then((data) => {
      setAllPosts(data);
      setFilteredPosts(data); // 초기엔 전체 보여줌
    });
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

    const res = await fetch(`http://localhost:8080/api/posts/${id}`, {
      method: "DELETE",
    });

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
    const url = `http://localhost:8080/api/posts/${post.postId}/like`;

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
              backgroundColor: selectedCategory === cat ? "#c4d92d" : "#d1e15b",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <h2>전체 게시글</h2>
      <div className="postWrapperBox">
        <ul className="postUl">
          {filteredPosts.map((post) => (
            <li key={post.postId}>
              <span onClick={() => navigate(`/detail/${post.postId}`)}>
                {post.postId} . {post.title} -🖊{post.category}
              </span>
              <span>
                {post.createdAt}
                👍{post.likeCount}
              </span>
              <button onClick={() => toggleLike(post)}>
                {likedPosts.includes(post.postId) ? "좋아요 취소" : "좋아요"}
              </button>
              <button onClick={() => handleEdit(post)}>수정</button>
              <button onClick={() => handleDelete(post.postId)}>삭제</button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => navigate("/write")}>글쓰기</button>
    </div>
  );
}

export default PostMain;
