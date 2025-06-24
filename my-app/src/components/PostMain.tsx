import { useNavigate } from "react-router-dom";
import "../styles/PostMain.css";
import { Post } from "../types/post";
import PostDetail from "./PostDetail";
import { useState } from "react";
import Layout from "./Layout";

interface PostMainProps {
  posts: Post[];
}

function PostMain({ posts }: PostMainProps) {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
            className="category-button"
            onClick={() => navigate(`/posts/${cat}`)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 게시글 리스트 (샘플) */}
      <h2>전체 게시글</h2>
      <div className="post-list">
        <div className="post-item">
          <ul className="postUl">
            {posts.map((post) => (
              <li
                key={post.id}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedPost(post)}
              >
                <strong>{post.title}</strong> - {post.author} ({post.category})
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="post-detail-box">
        <PostDetail post={selectedPost} />
      </div>
      {/* 페이지네이션 + 작성 버튼 */}
      <div className="bottom-bar">
        <div className="pagination">
          &lt;&lt; 1 . 2 . 3 . 4 . 5 . 6 &gt;&gt;
        </div>
        <button className="write-button" onClick={() => navigate("/write")}>
          글쓰기
        </button>
      </div>
    </div>
  );
}

export default PostMain;
