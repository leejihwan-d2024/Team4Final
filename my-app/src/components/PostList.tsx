import { Post } from "../types/post";

interface PostList {
  posts: Post[];
  onSelect: (post: Post) => void;
}

function PostList({ posts, onSelect }: PostList) {
  return (
    <div>
      <h2>게시글 목록</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id} onClick={() => onSelect(post)}>
            <strong>{post.title}</strong> - {post.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default PostList;
