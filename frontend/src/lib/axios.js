import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:  "https://chat-app-t0e4.onrender.com/api",
  withCredentials: true,
});