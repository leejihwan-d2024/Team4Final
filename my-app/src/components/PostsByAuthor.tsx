import { useEffect, useState } from "react";
import axios from "axios";

interface Post {
  postId: number;
  title: string;
  contentText: string;
  author: string;
  createdAt: string;
}

interface PostsByAuthorProps {
  userId?: string;
}

export default function PostsByAuthor({ userId }: PostsByAuthorProps) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return; // userId 없으면 요청 안 함

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_HOST}posts/author/${userId}`
        );
        setPosts(res.data);
      } catch (error) {
        console.error("작성자 게시글 조회 실패", error);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [userId]);

  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.postId}>
            <span>
              📝 게시판 활동 - {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))
      ) : (
        <>ㅇ</>
      )}
    </div>
  );
}
