import axios from "axios";

// PENTING: Ganti URL ini kalau sudah deploy ke AWS (http://IVP4_PUBLIC:3000)
// Untuk sekarang local dev:
const api = axios.create({
  // baseURL: "https://api.gethire.studio",
  baseURL: "https://api.gethire.studio",
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optional: window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
