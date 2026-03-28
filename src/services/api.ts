import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
    baseURL: "https://api.freeapi.app/api/v1",
    timeout: 5000,
});

// Automatically attach the JWT token to all requests if the user is logged in
api.interceptors.request.use(async (config) => {
    const token = await storage.getToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- Token Refresh Logic ---
let isRefreshing = false;
let failedQueue: any[] = [];

// A queue queue system to hold any requests that fail while we are refreshing
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Listen to all responses coming back from the server
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the server yells "401 Unauthorized" and we haven't already tried to retry...
        // AND don't intercept if it's the login, register, or refresh-token call itself!
        const isAuthEndpoint = originalRequest.url?.includes('/users/login') ||
            originalRequest.url?.includes('/users/register') ||
            originalRequest.url?.includes('/users/refresh-token');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {

            // If we are ALREADY refreshing, put this request in the waiting line
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return api(originalRequest); // Retry with new token!
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Grab our backup refresh token!
                const refreshToken = await storage.getRefreshToken();
                if (!refreshToken) throw new Error('No refresh token available');

                const res = await axios.post('https://api.freeapi.app/api/v1/users/refresh-token', { refreshToken });

                const newToken = res.data.data.accessToken;
                const newRefreshToken = res.data.data.refreshToken;

                // Save them both back into our vault securely
                await storage.setTokens(newToken, newRefreshToken);

                // Attach the new token to our originally failed request
                originalRequest.headers.Authorization = 'Bearer ' + newToken;

                // Tell the waiting line to proceed!
                processQueue(null, newToken);

                // Finally retry the very first request again
                return api(originalRequest);

            } catch (err) {
                // Absolute catastrophic failure: Kick user to login
                processQueue(err, null);
                await storage.removeToken();
                return Promise.reject(err);
            } finally {
                isRefreshing = false; // We are done refreshing!
            }
        }
        return Promise.reject(error);
    }
);


export default api;
