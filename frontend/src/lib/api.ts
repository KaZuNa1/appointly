import axios from "axios";
import { getToken } from "./auth";

// FORCE LOCAL BACKEND IN DEV
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
