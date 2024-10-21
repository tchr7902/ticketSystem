// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000', // Your API base URL
});

// Interceptor to add the token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token'); // Get the token from session storage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Include the token in the headers
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
