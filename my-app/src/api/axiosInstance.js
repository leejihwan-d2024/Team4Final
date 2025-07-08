import axios from "axios";

console.log("API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
console.log("FRONTEND_URL:", process.env.REACT_APP_FRONTEND_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

export default api;
