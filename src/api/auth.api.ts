// src/api/auth.api.ts
import axiosInstance from './axiosInstance';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  RefreshTokenRequest,
} from '../types/auth.types';

// ─── Register ────────────────────────────────────────────────────────────
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
  return response.data;
};

// ─── Login ───────────────────────────────────────────────────────────────
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
  return response.data;
};

// ─── Get Current User ────────────────────────────────────────────────────
export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<User>('/auth/me');
  return response.data;
};

// ─── Refresh Tokens ──────────────────────────────────────────────────────
export const refreshTokens = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

// ─── Logout ──────────────────────────────────────────────────────────────
export const logoutUser = async (refreshToken: string): Promise<void> => {
  await axiosInstance.post('/auth/logout', { refresh_token: refreshToken });
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
export const forgotPassword = async (email: string): Promise<void> => {
  await axiosInstance.post('/auth/forgot-password', { email });
};

// ─── Reset Password ──────────────────────────────────────────────────────
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await axiosInstance.post('/auth/reset-password', { token, newPassword });
};