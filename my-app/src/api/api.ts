import { getApiBaseUrl } from "../utils/apiUtils";
// REACT_APP_HOST 사용됐음
export const fetchPosts = async () => {
  const res = await fetch(`${getApiBaseUrl()}api/posts`);

  if (!res.ok) throw new Error("게시글 불러오기 실패");

  return res.json();
};
