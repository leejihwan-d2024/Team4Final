import React from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./mainpage/MainPage";
import Achv from "./achv/Achv";
import MainPage2 from "./pages/MainPage2";
import CrewDetailPage from "./pages/CrewDetailPage";
import CrewCreatePage from "./pages/CrewCreatePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route path="/MainPage2" element={<MainPage2 />} />
        <Route path="/achv" element={<Achv />} />
        <Route path="" element={"None"} />
        <Route path="/crew/:id" element={<CrewDetailPage />} />
        <Route path="/CrewCreate" element={<CrewCreatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
