import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:  "https://chat-app-8wm6.onrender.com",
  withCredentials: true,
});