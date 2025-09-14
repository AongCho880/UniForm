// src/api/axios.ts
import axios from "axios";

// Base API URL
// - In production on Vercel, leave VITE_API_URL unset to use same-origin "/api"
// - In local dev, set VITE_API_URL="http://localhost:5000/api" (or use a Vite proxy)
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Ensure Bearer prefix once
      const hasBearer = accessToken.trim().toLowerCase().startsWith('bearer ')
      config.headers.Authorization = hasBearer ? accessToken : `Bearer ${accessToken}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
