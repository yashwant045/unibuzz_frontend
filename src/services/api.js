import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8082",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't trigger session expired for login failures
      if (error.config.url !== "/auth/login") {
        const token = localStorage.getItem("token");
        if (token) {
          localStorage.removeItem("token");
          window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
