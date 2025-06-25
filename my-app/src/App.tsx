import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import MainPage from "./mainpage/MainPage";
import Achv from "./achv/Achv";
import PostMain from "./components/PostMain";
import PostWrite from "./components/PostWrite";
import { Post } from "./types/post";
import Profile from "./page/Profile";
import Settings from "./page/Settings";

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // ✅ 전체 게시글 불러오기
  const fetchPosts = async () => {
    const res = await fetch("https://localhost:8080/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  //  게시글 등록
  const handlePostSubmit = async (post: Omit<Post, "id">) => {
    const response = await fetch("https://localhost:8080/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      alert("등록 실패");
      return;
    }

    alert("등록 완료!");
    fetchPosts();
  };

  //  게시글 상세 조회
  const fetchPostById = async (id: number) => {
    const res = await fetch(`https://localhost:8080/api/posts/${id}`);
    const data = await res.json();
    setSelectedPost(data);
  };

  // 게시글 수정
  const updatePost = async (post: Post) => {
    const res = await fetch("https://localhost:8080/api/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    if (res.ok) {
      alert("수정 완료");
      fetchPosts();
    } else {
      alert("수정 실패");
    }
  };

  //  게시글 삭제
  const deletePost = async (id: number) => {
    const res = await fetch(`https://localhost:8080/api/posts/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("삭제 완료");

      fetchPosts();
    } else {
      alert("삭제 실패");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route path="/achv" element={<Achv />} />
        <Route
          path="/posts"
          element={
            <PostMain
              posts={posts}
              onDelete={deletePost}
              onEdit={updatePost}
              onSelect={fetchPostById}
            />
          }
        />
        <Route
          path="/write"
          element={<PostWrite onSubmit={handlePostSubmit} />}
        />
        <Route path="" element={"None"} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={"MainPage"} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
