import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
    baseURL: "https://api.freeapi.app/api/v1",
    timeout: 5000,
});

api.interceptors.request.use(async (config) => {
    const token = await storage.getToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthEndpoint = originalRequest.url?.includes('/users/login') ||
            originalRequest.url?.includes('/users/register') ||
            originalRequest.url?.includes('/users/refresh-token');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await storage.getRefreshToken();
                if (!refreshToken) {
                    await storage.removeToken();
                    return Promise.reject(new Error('Session expired: No refresh token available'));
                }

                const res = await axios.post('https://api.freeapi.app/api/v1/users/refresh-token', { refreshToken });

                const newToken = res.data.data.accessToken;
                const newRefreshToken = res.data.data.refreshToken;

                await storage.setTokens(newToken, newRefreshToken);

                originalRequest.headers.Authorization = 'Bearer ' + newToken;

                processQueue(null, newToken);

                return api(originalRequest);

            } catch (err) {
                processQueue(err, null);
                await storage.removeToken();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);


export default api;
