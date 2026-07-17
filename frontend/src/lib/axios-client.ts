import axios from "axios";
import { mapIds } from "./helper";

export const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use((response) => {
  if (response.data) {
    response.data = mapIds(response.data);
  }
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem("accessToken");
    // Check if we are already on the login page to avoid infinite loops
    if (window.location.pathname !== "/" && window.location.pathname !== "/sign-up") {
      window.location.href = "/";
    }
  }
  return Promise.reject(error);
});