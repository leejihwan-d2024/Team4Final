import axios from "axios";
import { useEffect, useState } from "react";

interface Comment {
  commentId: number;
  commentAuthor: string;
  commentDate: string;
  commentComment: string;
  commentFixedDate?: string;
  postId: number;
}

interface CommentProps {
  postId: number;
}

function Comment({ postId }: CommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // 댓글 목록 불러오기
  useEffect(() => {
    axios
      .get(`https://localhost:8080/api/comments/post/${postId}`)

      .then((res) => setComments(res.data))
      .catch((err) => console.error("댓글 목록 불러오기 실패", err));
  }, [postId]);

  // 댓글 등록
  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`https://localhost:8080/api/comments`, {
        commentAuthor: "user001",
        commentComment: newComment,
        postId: postId,
      });

      setNewComment("");

      const res = await axios.get(
        `https://localhost:8080/api/comments/post/${postId}`
      );
      setComments(res.data);
    } catch (err) {
      console.error(err);
      alert("댓글 작성 실패");
    }
  };

  // 댓글 삭제
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("댓글을 삭제할까요?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://localhost:8080/api/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.commentId !== id));
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  return (
    <div className="comment-section">
      <h3>댓글</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.commentId}>
            <p>
              <strong>{comment.commentAuthor}</strong> :{" "}
              {comment.commentComment}
            </p>
            <p style={{ fontSize: "12px", color: "gray" }}>
              작성일: {comment.commentDate}
              {comment.commentFixedDate &&
                ` (수정됨: ${comment.commentFixedDate})`}
            </p>
            <button onClick={() => handleDelete(comment.commentId)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "1rem" }}>
        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <br />
        <button onClick={handleSubmit}>등록</button>
      </div>
    </div>
  );
}

export default Comment;
