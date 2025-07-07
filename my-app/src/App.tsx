import React from "react";
import "./App.css";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import MainPage from "./mainpage/MainPage";
import Achv from "./achv/Achv";
import MainPage2 from "./pages/MainPage2";
import CrewDetailPage from "./pages/CrewDetailPage";
import CrewCreatePage from "./pages/CrewCreatePage";
import CrewEditPage from "./pages/CrewEditPage";
import RunningEventCreatePage from "./pages/RunningEventCreatePage"; //  추가
import RunningEventDetailPage from "./pages/RunningEventDetailPage";
import ChatRoom from "./pages/ChatRoom";
import ChatRoomPage from "./pages/ChatRoomPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route
          path=""
          element={
            <>
              <Link to="/MainPage2">2번째 매인</Link>
              <Link to="/crew/:id">크루 상세페이지</Link>
              <Link to="/CrewCreate">크루 생성</Link>
              <Link to="/events/create">이벤트 생성</Link>
              <Link to="/events/detail/:id">이벤트 상세</Link>
              <Link to="/chat/:crewId">채팅방</Link>
            </>
          }
        />
        <Route path="" element={<Link to="/CrewCreate">크루 생성</Link>} />
        <Route path="" element={<Link to="/crews/:id/edit">크루 수정</Link>} />
        <Route path="" element={<Link to="/events/create">이벤트 생성</Link>} />
        <Route
          path=""
          element={<Link to="/events/detail/:id">이벤트 상세</Link>}
        />
        <Route path="" element={<Link to="/chat/:crewId">채팅방</Link>} />
        <Route path="/MainPage2" element={<MainPage2 />} />
        <Route path="/achv" element={<Achv />} />
        <Route path="/crew/:id" element={<CrewDetailPage />} />
        <Route path="/CrewCreate" element={<CrewCreatePage />} />
        <Route path="/crews/:id/edit" element={<CrewEditPage />} />
        <Route
          path="/events/create"
          element={<RunningEventCreatePage />}
        />{" "}
        <Route path="/events/detail/:id" element={<RunningEventDetailPage />} />
        <Route path="/chat/:crewId" element={<ChatRoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
