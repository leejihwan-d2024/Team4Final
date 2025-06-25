export const fetchPosts = async () => {
  const res = await fetch("https://localhost:8080/api/posts");

  if (!res.ok) throw new Error("게시글 불러오기 실패");
  return res.json();
};
