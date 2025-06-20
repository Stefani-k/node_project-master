// src/api/axiosInstance.js
import axios from "axios";

// Get the base URL from environment variables, with a fallback for development.
// Vite uses 'import.meta.env.VITE_...' to access environment variables.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Create a new instance of axios with a custom configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // All requests will be prefixed with this URL
  // You can add other default settings here, like headers or timeouts
  // headers: { 'Content-Type': 'application/json' }, // Example default header
  // timeout: 10000, // Example: request will timeout after 10 seconds
});

// --- Interceptors (We can add these later) ---
// This is where you would add logic to automatically include the auth token in every request.
// For example:
/*
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

// Export the configured instance to be used throughout the application
export default axiosInstance;