import axios from "axios";

// Bikin Instance Axios (Biar gak setting ulang terus)
const api = axios.create({
  baseURL: "http://localhost:3000", // Alamat Server Backend kita
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor (Satpam Frontend)
// Setiap kali mau kirim request, selipkan Token di saku (Header)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Ambil token dari brankas browser
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
