import { Post } from "../types/post";

interface PostDetailInt {
  post: Post | null;
}

function PostDetail({ post }: PostDetailInt) {
  if (!post) return <div></div>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p>작성자: {post.author}</p>
      <p>본문: {post.content}</p>
    </div>
  );
}
export default PostDetail;
