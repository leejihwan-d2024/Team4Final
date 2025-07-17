import axiosInstance from "./axiosInstance";

export const fetchPosts = async () => {
  const response = await axiosInstance.get("posts"); // 자동으로 baseURL + posts
  return response.data;
};
