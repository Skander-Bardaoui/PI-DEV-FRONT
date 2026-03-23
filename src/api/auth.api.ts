// src/api/auth.api.ts
import axiosInstance from './axiosInstance';
import {
  LoginRequest,
  RegisterRequest,
  User,
} from '../types/auth.types';

// ─── Register ────────────────────────────────────────────────────────────
export const registerUser = async (data: RegisterRequest): Promise<{ user: User }> => {
  const response = await axiosInstance.post<{ user: User }>('/auth/register', data);
  return response.data;
};

// ─── Login ───────────────────────────────────────────────────────────────
export const loginUser = async (data: LoginRequest): Promise<{ user: User }> => {
  const response = await axiosInstance.post<{ user: User }>('/auth/login', data);
  return response.data;
};

// ─── Get Current User ────────────────────────────────────────────────────
export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<User>('/auth/me');
  return response.data;
};

// ─── Refresh Tokens ──────────────────────────────────────────────────────
export const refreshTokens = async (): Promise<{ user: User }> => {
  const response = await axiosInstance.post<{ user: User }>('/auth/refresh', {});
  return response.data;
};

// ─── Logout ──────────────────────────────────────────────────────────────
export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout', {});
};

// ─── Update Profile ──────────────────────────────────────────────────────
export const updateProfile = async (data: {
  name?: string;
  email?: string;
  password?: string;
}): Promise<User> => {
  const response = await axiosInstance.patch<User>('/auth/profile', data);
  return response.data;
};

// ─── Verify Email ────────────────────────────────────────────────────────
export const verifyEmail = async (token: string): Promise<void> => {
  await axiosInstance.post('/auth/verify-email', { token });
};

// ─── Forgot Password ─────────────────────────────────────────────────────
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>('/auth/forgot-password', { email });
  return response.data;
};

// ─── Reset Password ──────────────────────────────────────────────────────
export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  return response.data;
};

// ─── Change Password ─────────────────────────────────────────────────────
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};