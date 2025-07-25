import styled from "styled-components";
import { Post } from "../types/post";

interface PostList {
  posts: Post[];
  onSelect: (post: Post) => void;
}

function PostList({ posts, onSelect }: PostList) {
  const Wrapper = styled.div`
    max-width: 360px;
    height: 640px;
    margin: auto;
    padding: 16px;
    box-sizing: border-box;
    background: #f9f9f9;
    font-size: 14px;

    position: relative; // ✅ 메뉴 기준 위치를 잡기 위해 필요
    overflow: visible; // ✅ 팝업 메뉴가 잘리지 않도록
  `;
  return (
    <Wrapper>
      <div>
        <h2>게시글 목록</h2>
        <ul>
          {posts.map((post) => (
            <li key={post.postId} onClick={() => onSelect(post)}>
              <strong>{post.title}</strong> - {post.author}
            </li>
          ))}
        </ul>
      </div>
    </Wrapper>
  );
}
export default PostList;
