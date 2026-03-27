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

export default api;
