import React, { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import MainPage from "./mainpage/MainPage";
import Achv from "./achv/Achv";
import PostMain from "./components/PostMain";
import PostWrite from "./components/PostWrite";
import { Post } from "./types/post";
import PostDetail from "./components/PostDetail";
import axios from "axios";
import NaverProductList from "./components/NaverProductList";
import LikedProductList from "./components/LikedProductList";
import RunningInfo from "./components/RunningInfo";
import Marathon from "./components/Marathon";

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 전체 게시글 불러오기
  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/posts");
      setPosts(res.data);
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
    }
  };

  //  게시글 등록
  const handlePostSubmit = async (post: Omit<Post, "id">) => {
    try {
      await axios.post("http://localhost:8080/api/posts", post);
      alert("등록 완료!");
      fetchPosts();
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 실패");
    }
  };

  //  게시글 상세 조회
  const fetchPostById = async (id: number) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/posts/${id}`);
      setSelectedPost(res.data);
    } catch (error) {
      console.error("게시글 조회 실패:", error);
    }
  };
  // 게시글 수정
  const updatePost = async (post: Post) => {
    try {
      await axios.put("http://localhost:8080/api/posts", post);
      alert("수정 완료");
      fetchPosts();
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정 실패");
    }
  };

  //  게시글 삭제
  const deletePost = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/posts/${id}`);
      alert("삭제 완료");
      fetchPosts();
    } catch (error) {
      console.error("삭제 실패:", error);
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
        <Route path="/detail/:id" element={<PostDetail />} />
        <Route
          path="/write/:id"
          element={<PostWrite onSubmit={updatePost} />}
        />

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
        <Route
          path=""
          element={
            <>
              <Link to="/posts">게시판으로이동</Link>
              <Link to="/shop">러닝관련상품으로 이동</Link>
              <Link to="/info">러닝관련정보로 이동</Link>
            </>
          }
        />

        <Route path="/shop" element={<NaverProductList />} />
        <Route path="/liked" element={<LikedProductList />} />
        <Route path="/info" element={<RunningInfo />} />
        <Route path="/Marathon" element={<Marathon />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
