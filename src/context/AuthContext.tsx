// src/context/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  AuthContextType,
  RegisterRequest,
  Role,
} from '../types/auth.types';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from '../api/auth.api';

// ─── Create Context ──────────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider Component ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ─── On Mount: Check if User is Already Logged In ─────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user data from /auth/me
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Token might be expired, clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ─── Login Function ──────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });
      
      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect based on role
      if (userData.role === Role.CLIENT) {
        navigate('/portal');
      } else {
        navigate('/app');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  };

  // ─── Register Function ───────────────────────────────────────────────
  const register = async (data: RegisterRequest) => {
    try {
      const response = await registerUser(data);
      
      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect to dashboard (new users default to TEAM_MEMBER role)
      navigate('/app');
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  // ─── Logout Function ─────────────────────────────────────────────────
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    }
  };

  // ─── Refresh User Data ───────────────────────────────────────────────
  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // ─── Context Value ───────────────────────────────────────────────────
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}