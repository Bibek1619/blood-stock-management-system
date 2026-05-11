/**
 * Axios Instance Configuration
 * Centralized HTTP client with authentication and error handling
 */

import axios from "axios";
import { BASE_URL } from "./apiPaths";

/**
 * Create axios instance with default configuration
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Request Interceptor
 * Automatically attaches JWT token to all requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common error scenarios
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          // Let component handle this (e.g., redirect to login)
          console.error("Unauthorized access - please login again");
          break;
          
        case 403:
          // Forbidden - insufficient permissions
          console.error("Access forbidden:", error.response.data);
          break;
          
        case 404:
          // Not found
          console.error("Resource not found:", error.response.data);
          break;
          
        case 500:
          // Server error
          console.error("Server error:", error.response.data);
          alert("An unexpected error occurred. Please try again later.");
          break;
          
        default:
          console.error("API error:", error.response.data);
      }
    } else if (error.code === "ECONNABORTED") {
      // Request timeout
      console.error("Request timeout:", error.message);
      alert("Request timed out. Please check your connection and try again.");
    } else if (error.request) {
      // Request made but no response received
      console.error("No response from server:", error.request);
      alert("Unable to connect to server. Please check your connection.");
    } else {
      // Something else happened
      console.error("Request error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
