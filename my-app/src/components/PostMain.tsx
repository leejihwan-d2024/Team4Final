import { useEffect, useState } from "react";
import { Post } from "../types/post";
import { fetchPosts } from "../api/api";
import PostDetail from "./PostDetail";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

interface PostMainProps {
  posts: Post[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (post: Post) => Promise<void>;
  onSelect: (id: number) => Promise<void>;
}

function PostMain({ posts, onDelete, onEdit, onSelect }: PostMainProps) {
  const [post, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  // 게시글 전체 불러오기
  useEffect(() => {
    fetchPosts().then((data) => setPosts(data));
  }, []);

  // 삭제 기능
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

    const res = await fetch(`https://localhost:8080/api/posts/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("삭제 완료");
      setSelectedPost(null);
      fetchPosts().then((data) => setPosts(data)); // 새로고침
    } else {
      alert("삭제 실패");
    }
  };

  // 수정 버튼 → /write로 이동 (post 데이터 넘기기 위해 state 전달)
  const handleEdit = (post: Post) => {
    navigate("/write", { state: post });
  };

  return (
    <div className="main-container">
      <Layout>
        <div className="center-group">러닝 크루 게시판</div>
      </Layout>

      <h2>전체 게시글</h2>
      <ul className="postUl">
        {posts.map((post) => (
          <li key={post.postId}>
            <span onClick={() => setSelectedPost(post)}>
              {post.title} - {post.author}
            </span>
            <button onClick={() => handleEdit(post)}>수정</button>
            <button onClick={() => handleDelete(post.postId)}>삭제</button>
          </li>
        ))}
      </ul>

      <PostDetail post={selectedPost} />

      <button onClick={() => navigate("/write")}>글쓰기</button>
    </div>
  );
}

export default PostMain;
