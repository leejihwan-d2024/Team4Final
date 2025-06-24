import React from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./mainpage/MainPage";
import Achv from "./achv/Achv";
import Profile from "./page/Profile";
import Settings from "./page/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route path="/achv" element={<Achv />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={"MainPage"} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
