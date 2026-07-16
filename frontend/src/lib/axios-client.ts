import axios from "axios";

export const API = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? `${import.meta.env.VITE_API_URL}/api`
      : "/api",
  withCredentials: true,
});

API.interceptors.response.use((response) => {
  const mapIds = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(mapIds);
    } else if (obj !== null && typeof obj === "object") {
      const newObj: any = {};
      for (const key in obj) {
        newObj[key] = mapIds(obj[key]);
        if (key === "id") {
          newObj["_id"] = obj[key];
        }
      }
      return newObj;
    }
    return obj;
  };

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