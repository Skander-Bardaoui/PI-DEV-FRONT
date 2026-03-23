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
      try {
        // Only try to fetch user if we're not on a public page
        // This prevents unnecessary API calls on landing/login/register pages
        const publicPaths = ['/', '/login', '/register', '/pricing', '/forgot-password', '/reset-password'];
        const currentPath = window.location.pathname;
        
        if (publicPaths.includes(currentPath)) {
          setIsLoading(false);
          return;
        }
        
        // Try to fetch user data from /auth/me (cookie-based)
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // No valid session, user stays null
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
      
      // Set user from response (cookies are set by backend)
      setUser(response.user);
      
      // Redirect based on role
      if (response.user.role === Role.CLIENT) {
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
      
      // Set user from response (cookies are set by backend)
      setUser(response.user);
      
      // Redirect to dashboard
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
      await logoutUser();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state
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