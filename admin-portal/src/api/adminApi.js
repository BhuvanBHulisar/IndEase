import axios from 'axios';

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add the admin token to every request
adminApi.interceptors.request.use(
    (config) => {
        const token = import.meta.env.VITE_ADMIN_TOKEN;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default adminApi;
