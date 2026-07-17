import axios from "axios";
import { mapIds } from "./helper";

export const API = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? `${import.meta.env.VITE_API_URL}/api`
      : "/api",
  withCredentials: true,
});

API.interceptors.response.use((response) => {
  if (response.data) {
    response.data = mapIds(response.data);
  }
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Check if we are already on the login page to avoid infinite loops
    if (window.location.pathname !== "/" && window.location.pathname !== "/sign-up") {
      window.location.href = "/";
    }
  }
  return Promise.reject(error);
});