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
    // Register new user
    register: async (data: {
        email: string;
        password: string;
        full_name: string;
        phone: string;
    }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Refresh token
    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    }
};

// ==================== DASHBOARD API ====================

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getQuickActions = async () => {
    const response = await api.get('/dashboard/quick-actions');
    return response.data;
};

// ==================== PAYMENT API ====================

export const generatePayment = async (data: {
    amount: number;
    description?: string;
    appointment_id?: number;
}) => {
    const response = await api.post('/payments/generate-upi', data);
    return response.data;
};

export const confirmPayment = async (session_id: string) => {
    const response = await api.post('/payments/confirm-payment', { session_id });
    return response.data;
};

export const getPaymentHistory = async (page = 1, limit = 10) => {
    const response = await api.get(`/payments/history?page=${page}&limit=${limit}`);
    return response.data;
};

export const getPaymentDetails = async (paymentId: number) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
};

// ==================== USER API ====================

export const getUserProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data;
};

export const updateUserProfile = async (data: {
    full_name?: string;
    phone?: string;
}) => {
    const response = await api.put('/users/profile', data);
    return response.data;
};

// ==================== APPOINTMENT API ====================

export const getAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data;
};

export const createAppointment = async (data: {
    appointment_date: string;
    doctor_id?: number;
    consultation_type?: string;
    symptoms?: string;
}) => {
    const response = await api.post('/appointments', data);
    return response.data;
};

export const getAppointmentDetails = async (appointmentId: number) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
};

export const updateAppointment = async (appointmentId: number, data: {
    status?: string;
    diagnosis?: string;
    prescription?: string;
    notes?: string;
}) => {
    const response = await api.put(`/appointments/${appointmentId}`, data);
    return response.data;
};

export default api;
