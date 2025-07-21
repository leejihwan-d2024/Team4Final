export const fetchPosts = async () => {
  const res = await fetch(`${process.env.REACT_APP_HOST}posts`);

  if (!res.ok) throw new Error("게시글 불러오기 실패");

  return res.json();
};
