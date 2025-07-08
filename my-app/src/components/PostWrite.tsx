import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Post } from "../types/post";
import "../styles/PostWrite.css";

interface PostWriteProps {
  onSubmit: (post: Post) => void;
}

function PostWrite({ onSubmit }: PostWriteProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("전체");
  const [author, setAuthor] = useState("user001");

  // 수정 시 기존 게시글
  useEffect(() => {
    if (id) {
      fetch(`https://localhost:8080/api/posts/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title);
          setContent(data.contentText);
          setCategory(data.category || "전체");
          setAuthor(data.author);
        });
    }
  }, [id]);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const postData: Post = {
      title,
      author: "user001", // login안만들어서 걍임의로넣음
      postId: id ? parseInt(id) : 0,
      createdAt: "",
      viewCount: 0,
      likeCount: 0,
      contentText: content,
      attachmentUrl: "222",
      category: category,
    };

    onSubmit(postData);
    navigate("/posts");
    console.log("보내는 postData:", postData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{id ? "게시글 수정" : "게시글 작성"}</h2>

      <input
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="본문"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="전체">전체</option>
        <option value="러닝">러닝</option>
        <option value="스포츠">스포츠</option>
        <option value="잡담">잡담</option>
        <option value="이슈">이슈</option>
      </select>
      <button type="submit">{id ? "수정" : "작성"} 완료</button>
    </form>
  );
}

export default PostWrite;
