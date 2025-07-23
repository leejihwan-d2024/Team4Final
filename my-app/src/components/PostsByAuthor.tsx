import { useState } from "react";
import axios from "axios";

interface Post {
  postId: number;
  title: string;
  contentText: string;
  author: string;
  createdAt: string;
}

export default function PostsByAuthor() {
  const [inputAuthor, setInputAuthor] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  const handleSearch = async () => {
    if (!inputAuthor.trim()) return;

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_HOST}posts/author/${inputAuthor}`
      );
      setPosts(res.data);
    } catch (error) {
      console.error("작성자 게시글 조회 실패", error);
      setPosts([]);
    }
  };

  return (
    <div>
      <h2>작성자 게시글 검색</h2>

      <input
        type="text"
        placeholder="작성자 ID 입력"
        value={inputAuthor}
        onChange={(e) => setInputAuthor(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>

      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.postId}>
            <p>작성일시: {post.createdAt}</p>
          </div>
        ))
      ) : (
        <p>작성자 게시글이 없습니다.</p>
      )}
    </div>
  );
}
