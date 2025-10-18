import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

// ==================== AUTH API ====================

export const authAPI = {
    // Register new user (signup)
    register: async (data: {
        email: string;
        password: string;
        confirmPassword: string;
    }) => {
        const response = await api.post('/auth/signup', data);
        return response.data;
    },

    // Login user
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Logout user
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

// ==================== DATA API (INSERT/FETCH) ====================

// Insert data (create payment)
export const insertData = async (data: {
    amount: number;
    description?: string;
    status?: string;
}) => {
    const response = await api.post('/data', data);
    return response.data;
};

// Fetch data (get all payments)
export const fetchData = async () => {
    const response = await api.get('/data');
    return response.data;
};

// Fetch data from all tables
export const fetchAllTables = async () => {
    const response = await api.get('/data/all-tables');
    return response.data;
};

export default api;
