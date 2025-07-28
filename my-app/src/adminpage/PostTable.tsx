import React, { useEffect, useState } from "react";
import axios from "axios";

interface Post {
  postId: number;
  title: string;
  author: string;
  contentText: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  attachmentUrl: string;
  category: string;
}

const PostTable: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<Post[]>(
          "https://200.200.200.62:8080/api/posts"
        );
        setPosts(response.data);
      } catch (error) {
        console.error("게시글 데이터를 불러오는데 실패했습니다.", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">게시글 목록</h2>
      <div className="overflow-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">#</th>
              <th className="border p-2">제목</th>
              <th className="border p-2">작성자</th>
              <th className="border p-2">카테고리</th>
              <th className="border p-2">작성일</th>
              <th className="border p-2">수정일</th>
              <th className="border p-2">조회수</th>
              <th className="border p-2">좋아요</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.postId} className="hover:bg-gray-50">
                <td className="border p-2">{post.postId}</td>
                <td className="border p-2">{post.title}</td>
                <td className="border p-2">{post.author}</td>
                <td className="border p-2">{post.category}</td>
                <td className="border p-2">{post.createdAt}</td>
                <td className="border p-2">{post.updatedAt}</td>
                <td className="border p-2">{post.viewCount}</td>
                <td className="border p-2">{post.likeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostTable;
