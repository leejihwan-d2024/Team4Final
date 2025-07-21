import React, { useEffect, useState, useRef } from "react";

import "./App.css";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { logTokenInfo, checkAndHandleAutoLogin } from "./api/tokenUtils";
import MainPage from "./mainpage/MainPage";
import Achv from "./achv/Achv";
import PostMain from "./components/PostMain";
import PostWrite from "./components/PostWrite";
import { Post } from "./types/post";
import PostDetail from "./components/PostDetail";
import axios from "axios";
import NaverProductList from "./components/NaverProductList";
import LikedProductList from "./components/LikedProductList";
import MainPage2 from "./pages/MainPage2";
import CrewDetailPage from "./pages/CrewDetailPage";
import CrewCreatePage from "./pages/CrewCreatePage";
import CrewEditPage from "./pages/CrewEditPage";
import RunningEventCreatePage from "./pages/RunningEventCreatePage"; //  추가
import RunningEventDetailPage from "./pages/RunningEventDetailPage";
import ChatRoom from "./pages/ChatRoom";
import ChatRoomPage from "./pages/ChatRoomPage";
import RunningInfo from "./components/RunningInfo";
import Marathon from "./components/Marathon";
import Login from "./pages/login";
import Join from "./pages/join";
import FirstPage from "./pages/FirstPage";
import TestMain from "./pages/testmain";
import FindIdPage from "./pages/FindIdPage";
import FindPasswordPage from "./pages/FindPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import "./auth.css";
import "./App.css";
import MyPage from "./mypage/MyPage";
function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const hasLogged = useRef(false);

  // 전체 게시글 불러오기
  const fetchPosts = async () => {
    try {
      const res = await axios.get("https://localhost:8080/api/posts");
      setPosts(res.data);
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
    }
  };

  //  게시글 등록
  const handlePostSubmit = async (post: Omit<Post, "id">) => {
    try {
      await axios.post("https://localhost:8080/api/posts", post);
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
      const res = await axios.get(`https://localhost:8080/api/posts/${id}`);
      setSelectedPost(res.data);
    } catch (error) {
      console.error("게시글 조회 실패:", error);
    }
  };
  // 게시글 수정
  const updatePost = async (post: Post) => {
    try {
      await axios.put("https://localhost:8080/api/posts", post);
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
      await axios.delete(`https://localhost:8080/api/posts/${id}`);
      alert("삭제 완료");
      fetchPosts();
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 실패");
    }
  };

  useEffect(() => {
    fetchPosts();

    // 앱 시작 시 토큰 정보 로깅 및 자동 로그인 체크 (한 번만 실행)
    if (!hasLogged.current) {
      console.log("=== 앱 시작 - 토큰 정보 확인 ===");
      logTokenInfo();

      // 자동 로그인 체크 (체크박스가 체크된 경우에만)
      const checkAutoLogin = async () => {
        const savedAutoLogin = localStorage.getItem("autoLoginEnabled");
        if (savedAutoLogin === "true") {
          console.log("자동 로그인 기능이 활성화되어 있습니다.");
          const isAutoLoggedIn = await checkAndHandleAutoLogin();
          setIsLoggedIn(isAutoLoggedIn);
        } else {
          console.log("자동 로그인 기능이 비활성화되어 있습니다.");
          setIsLoggedIn(false);
        }
      };

      checkAutoLogin();
      console.log("================================");
      hasLogged.current = true;
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route
          path=""
          element={
            <>
              <Link to="FirstPage">첫페이지로</Link>
              <Link to="/MainPage2">2번째 매인</Link>
              <Link to="/crew/:id">크루 상세페이지</Link>
              <Link to="/CrewCreate">크루 생성</Link>
              <Link to="/events/create">이벤트 생성</Link>
              <Link to="/events/detail/:id">이벤트 상세</Link>
              <Link to="/chat/:crewId">채팅방</Link>
              <Link to="/achv">achv</Link>
              <Link to="/posts">게시판으로이동</Link>
              <Link to="/shop">러닝관련상품으로 이동</Link>
              <Link to="/info">러닝관련정보로 이동</Link>
              <br />

              <Link to="/testmain">임시 Main 으로 이동</Link>
              <Link to="/marathon">러닝대회정보로 이동</Link>
              <br />
              <Link to="/main">메인으로 이동</Link>
            </>
          }
        />
        <Route
          path=""
          element={<Link to="/events/detail/:id">이벤트 상세</Link>}
        />
        <Route path="" element={<Link to="/chat/:crewId">채팅방</Link>} />
        <Route path="/MainPage2" element={<MainPage2 />} />
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
        <Route path="/crew/:id" element={<CrewDetailPage />} />
        <Route path="/CrewCreate" element={<CrewCreatePage />} />
        <Route path="/crews/:id/edit" element={<CrewEditPage />} />
        <Route
          path="/events/create"
          element={<RunningEventCreatePage />}
        />{" "}
        <Route path="/events/detail/:id" element={<RunningEventDetailPage />} />
        <Route path="/chat/:crewId" element={<ChatRoomPage />} />
        <Route path="/shop" element={<NaverProductList />} />
        <Route path="/liked" element={<LikedProductList />} />
        <Route path="/info" element={<RunningInfo />} />
        <Route path="/Marathon" element={<Marathon />} />
        <Route path="/FirstPage" element={<FirstPage />} />
        <Route path="/testmain" element={<TestMain />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-password" element={<FindPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
