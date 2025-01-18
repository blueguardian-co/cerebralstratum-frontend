// ApiClient.tsx
import axios, { InternalAxiosRequestConfig } from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6443/api/v1/",
});

export const configureHeaders = (token: string | null) => {
    if (token) {
        apiClient.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                config.headers = config.headers || {};
                config.headers.Authorization = config.headers.Authorization || `Bearer ${token}`;
                return config;
            },
            (error) => {
                console.error("Request interceptor error:", error);
                return Promise.reject(error);
            }
        );
    }
};

export default apiClient;