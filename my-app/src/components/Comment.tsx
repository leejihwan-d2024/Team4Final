import axios from "axios";
import { useEffect, useState } from "react";
import "../styles/Comment.css";
import styled from "styled-components";
import { getApiBaseUrl } from "../utils/apiUtils";

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

function Comment({ postId }: CommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // 🔐 로그인 사용자 정보 가져오기
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?.userId || "익명";

  // 댓글 목록 불러오기
  useEffect(() => {
    axios
      .get(`${getApiBaseUrl()}api/comments/post/${postId}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error("댓글 목록 불러오기 실패", err));
  }, [postId]);

  // 댓글 등록
  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`${getApiBaseUrl()}api/comments`, {
        commentAuthor: currentUserId, // ✅ 로그인한 사용자 ID 사용
        commentComment: newComment,
        postId: postId,
      });

      setNewComment("");

      const res = await axios.get(
        `${getApiBaseUrl()}api/comments/post/${postId}`
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
      await axios.delete(`${getApiBaseUrl()}api/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.commentId !== id));
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  return (
    <Wrapper>
      <div className="comment-section">
        <h3 className="comm">댓글</h3>
        <hr></hr>
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
              {/* 🔐 본인 댓글만 삭제 버튼 노출 */}
              {comment.commentAuthor === currentUserId && (
                <button
                  onClick={() => handleDelete(comment.commentId)}
                  className="delete"
                >
                  삭제
                </button>
              )}
              <hr></hr>
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
          <button onClick={handleSubmit} className="submit">
            등록
          </button>
        </div>
      </div>
    </Wrapper>
  );
}

export default Comment;
