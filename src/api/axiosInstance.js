import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ✅ ONLY localStorage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[API CALL] -> ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]:", error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API RESPONSE ERROR]:", error.response?.status, error.message);
    if (error.response?.status === 401) {
      // 🔥 clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;