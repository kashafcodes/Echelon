import axios from "axios";

/**
 * Dynamic API Base URL resolver:
 * Reads VITE_API_URL from environment variable (e.g. https://your-backend.onrender.com or http://localhost:5000).
 * In local development with Vite proxy or single-page full-stack hosting, defaults to "" (relative /api).
 */
export const getBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "";
  return envUrl.replace(/\/+$/, "");
};

export const API_URL = getBaseUrl();

// Auth token storage helpers
export const getStoredToken = () => localStorage.getItem("lokart_token");
export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem("lokart_token", token);
  } else {
    localStorage.removeItem("lokart_token");
  }
};

/**
 * Centralized dynamic Axios instance
 * Usage across components & services:
 *   import api from "@/utils/api"
 *   api.get('/api/products')
 *   api.post('/api/products', data)
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach authentication token dynamically
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Unwrap response data & normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;
    const errorMessage =
      data?.message ||
      error.message ||
      `Request failed with status ${error.response?.status || "network error"}`;
    const formattedError = new Error(errorMessage);
    formattedError.status = error.response?.status;
    formattedError.data = data;
    return Promise.reject(formattedError);
  },
);

export default api;
export { api };
