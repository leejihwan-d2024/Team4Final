import React from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./mainpage/MainPage";
import Achv from "./achv/Achv";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route path="/achv" element={<Achv />} />
        <Route path="" element={"None"} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
