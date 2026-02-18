// src/types/auth.types.ts

// ─── User Roles (matching backend enum) ─────────────────────────────────
export enum Role {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  TEAM_MEMBER = 'TEAM_MEMBER',
  CLIENT = 'CLIENT',
}

// ─── User Entity (matching backend User without password_hash) ──────────
export interface User {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  role: Role;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

// ─── API Request Payloads ────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}

// ─── API Response Types ──────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse extends AuthResponse {}

export interface RegisterResponse extends AuthResponse {}

export interface RefreshResponse extends AuthResponse {}

// ─── Auth Context State ──────────────────────────────────────────────────
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}