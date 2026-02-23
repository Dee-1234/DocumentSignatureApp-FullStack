import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api',
});

API.interceptors.request.use((config) => {
    const data = localStorage.getItem('user');
    
    if (data) {
        const user = JSON.parse(data);
        // This line is the fix! It checks for BOTH 'token' and 'accessToken'
        const token = user.token || user.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("🚀 Interceptor: Token attached successfully!");
        } else {
            console.warn("⚠️ Interceptor: User found, but token field is missing.");
        }
    }
    return config;
});

export default API;