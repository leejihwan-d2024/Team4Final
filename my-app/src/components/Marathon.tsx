import { useEffect, useState } from "react";
import Layout from "./Layout";
import { keyboard } from "@testing-library/user-event/dist/keyboard";
import axios from "axios";

interface Mara {
  title: string;
  date: string;
  place: string;
  category: string;
  admin: string;
  url: string;
}
function Marathon() {
  const axiosApi = async (keyword: string) => {
    if (!keyword.trim()) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/marathon/search`, {
        params: { input: keyword },
      });
      setResult(res.data.documents);
    } catch (err) {
      console.error("대회정보 가져오기 실패", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    axiosApi(input);
  }, []);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Mara[]>([]);

  const OnClick = () => {
    axiosApi(input);
  };
  return (
    <div>
      <Layout>마라톤대회정보</Layout>
      <h2>대회정보 검색</h2>
      <input
        placeholder="각종 대회정보들을 검색해보세요."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></input>
      <button type="submit" onClick={OnClick}>
        검색
      </button>

      {loading && <p>🔄 검색 중...</p>}

      <div>
        <ul className="list">
          {result.map((item, idx) => (
            <li key={idx}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <div dangerouslySetInnerHTML={{ __html: item.title }}></div>
                <div dangerouslySetInnerHTML={{ __html: item.place }}></div>
                <div dangerouslySetInnerHTML={{ __html: item.category }}></div>
                <div dangerouslySetInnerHTML={{ __html: item.date }}></div>
                <div dangerouslySetInnerHTML={{ __html: item.admin }}></div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default Marathon;
