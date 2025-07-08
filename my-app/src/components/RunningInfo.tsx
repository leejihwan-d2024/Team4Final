import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/RunningInfo.css";
import Layout from "./Layout";

interface RInfo {
  title: string;
  contents: string;
  url: string;
  blogname: string;
  datetime: string;
}

function RunningInfo() {
  const [query, setQuery] = useState("러닝");
  const [results, setResults] = useState<RInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async (keyword: string) => {
    if (!keyword.trim()) return;
    try {
      setLoading(true);
      const res = await axios.get(`https://localhost:8080/api/info/search`, {
        params: { query: keyword },
      });
      setResults(res.data.documents);
    } catch (err) {
      console.error("블로그 정보 가져오기 실패", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs("러닝");
  }, []);

  const handleSearch = () => {
    fetchBlogs(query);
  };

  return (
    <div className="running-info-container">
      <Layout>📚러닝관련정보</Layout>
      <h2>🏃 러닝정보 검색</h2>
      <div className="search-box">
        <input
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="러닝정보들을 검색해보세요"
        />
        <button className="search-button" onClick={handleSearch}>
          검색
        </button>
      </div>

      {loading && <p>🔄 검색 중...</p>}

      <ul className="result-list">
        {results.map((item, idx) => (
          <li key={idx} className="result-item">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <div
                className="result-title"
                dangerouslySetInnerHTML={{ __html: item.title }}
              />
              <div
                className="result-contents"
                dangerouslySetInnerHTML={{ __html: item.contents }}
              />
              <p className="result-meta">
                📝 {item.blogname} | 📅 {item.datetime.slice(0, 10)}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RunningInfo;
