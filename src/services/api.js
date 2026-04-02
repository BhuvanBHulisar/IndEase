import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the industrial access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add a response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const token = localStorage.getItem("token");

      // Do NOT redirect if this is an auth endpoint — the caller handles errors.
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/google");

      // Do NOT redirect for /auth/me — handled by App.jsx session init logic.
      const isSessionCheck = url.includes("/auth/me");

      // Do NOT redirect for demo sessions — backend doesn't recognize the demo token,
      // but the frontend manages demo mode entirely on the client side.
      const isDemoSession = token === "demo-token-xyz";

      if (!isAuthEndpoint && !isSessionCheck && !isDemoSession) {
        // Industrial access expired or invalid — clear session and go home
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuth");
        window.location.href = "/"; // Redirect to landing page for re-authentication
      }
    }
    return Promise.reject(error);
  },
);

export default api;
