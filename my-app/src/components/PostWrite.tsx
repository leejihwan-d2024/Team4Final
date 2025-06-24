import React, { useState } from "react";
import { Post } from "../types/post";
import "../styles/PostWrite.css";
import { useNavigate } from "react-router-dom";

interface PostWriteInt {
  onSubmit: (Post: Omit<Post, "id">) => void;
}

function PostWrite({ onSubmit }: PostWriteInt) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("전체");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 간단한 유효성 검사
    if (!title || !content) {
      alert("제목,  내용을 모두 입력해주세요.");
      return;
    }

    onSubmit({
      title,
      content,
      category,
      author: "",
    });

    // 초기화
    setTitle("");
    setContent("");
    setCategory("전체");

    // 글 작성 후 목록 페이지로 이동
    navigate(`/`);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>글 작성</h2>

      <div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="전체">전체</option>
          <option value="러닝">러닝</option>
          <option value="스포츠">스포츠</option>
          <option value="잡담">잡담</option>
          <option value="이슈">이슈</option>
        </select>
      </div>

      <div>
        <input
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <input
          placeholder="작성자"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div>
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div>
        <button type="submit">등록</button>
      </div>
    </form>
  );
}

export default PostWrite;
