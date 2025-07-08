import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
} from "react-router-dom";
import Login from "./pages/login";
import Join from "./pages/join";
import FirstPage from "./pages/FirstPage";
import Main from "./pages/main";
import "./auth.css";
import ExcelTmp from "./excel/excel";

function App() {
  return (
    <BrowserRouter>
      <div className="auth">
        <Routes>
          <Route path="" element={<Link to="FirstPage">첫페이지로</Link>} />
          <Route path="/FirstPage" element={<FirstPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/main" element={<Main />} />
          <Route path="/excel" element={<ExcelTmp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
