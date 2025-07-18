import axios from "axios";

console.log("API_BASE_URL:", process.env.REACT_APP_API_ACHV_BASE_URL);

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_ACHV_BASE_URL,
  withCredentials: true,
});

export default instance;
