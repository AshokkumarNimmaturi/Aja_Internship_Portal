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
    const token = localStorage.getItem("token");

    // Don't send token for login/register
    const isAuthRoute = config.url.startsWith("/auth/login") || config.url.startsWith("/auth/register");

    if (token && !isAuthRoute) {
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

    // 🔥 Guard: Handle 401 (Unauthorized/Expired Session)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if on a protected route (portal or subscriber)
      const path = window.location.pathname;
      const isProtectedRoute = path.startsWith("/portal") || path.startsWith("/subscriber") || path.startsWith("/dashboard");

      if (isProtectedRoute && !path.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;