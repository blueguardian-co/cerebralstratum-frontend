import axios, { InternalAxiosRequestConfig } from "axios";
import { getToken } from "./KeycloakService";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6443/api/v1/",
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = getToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = config.headers.Authorization || `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            console.error("Request interceptor error:", error);
            return Promise.reject(error);
        }
    },
);

export default apiClient;