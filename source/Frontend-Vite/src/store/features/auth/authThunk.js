import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../utils/api';

const API_URL = '/auth';

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/login`, { email, password });
            const { jwt, ...user } = response.data;
            // Store token consistently
            localStorage.setItem('jwt', jwt);
            localStorage.setItem('token', jwt); // Also store as 'token' for consistency
            return { token: jwt, user };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const signup = createAsyncThunk(
    'auth/signup',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/signup`, userData);
            const { jwt, ...user } = response.data;
            // Store token consistently
            localStorage.setItem('jwt', jwt);
            localStorage.setItem('token', jwt); // Also store as 'token' for consistency
            return { token: jwt, user };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Signup failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const  token  = localStorage.getItem('jwt');
            const response = await api.get(`/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("fetch current user -- ",response.data);
            return response.data;
        } catch (error) {
            console.log("fetch current user error -- ",error);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/forgot-password`, { email });
            console.log("forgot password", response)
            return response.data;
        } catch (error) {
            console.log("error ", error)
            return rejectWithValue(error.response?.data?.message || 'Failed to send reset link');
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, password }, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/reset-password`, { token, password });
            console.log("reset password", response)
            return response.data;
        } catch (error) {
            console.log("error ",error)
            return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
        }
    }
);

/**
 * Get all users list (Admin only)
 * GET /users/list
 */
export const getUsersList = createAsyncThunk(
    'auth/getUsersList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users/list');
            console.log("users list", response.data)
            return response.data;
        } catch (error) {
            console.log("error ",error)
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users list');
        }
    }
);

/**
 * Update user role (Admin only)
 * PUT /api/users/{userId}/role?role=ROLE_ADMIN
 */
export const updateUserRole = createAsyncThunk(
    'auth/updateUserRole',
    async ({ userId, role }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/users/${userId}/role?role=${role}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
        }
    }
);

/**
 * Toggle user verification (Admin only)
 * PUT /api/users/{userId}/toggle-verification
 */
export const toggleUserVerification = createAsyncThunk(
    'auth/toggleUserVerification',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/users/${userId}/toggle-verification`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle verification');
        }
    }
);

/**
 * Update current user's profile (fullName, phone, profileImage)
 * PUT /api/users/profile
 */
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await api.put('/api/users/profile', profileData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        }
    }
);

/**
 * Upload profile picture — converts File to base64 then calls updateProfile endpoint
 */
export const uploadProfileImage = createAsyncThunk(
    'auth/uploadProfileImage',
    async (file, { rejectWithValue }) => {
        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const response = await api.put('/api/users/profile', { profileImage: base64 });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
        }
    }
);