/**
 * Tests for ProtectedRoute component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { Role } from '../types/auth.types';

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when auth is loading', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.BUSINESS_OWNER },
      isLoading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should allow access when user has required role', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.BUSINESS_OWNER },
      isLoading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={[Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN]}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when user does not have required role', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.TEAM_MEMBER },
      isLoading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={[Role.BUSINESS_OWNER]}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect CLIENT role to /portal', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.CLIENT },
      isLoading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={[Role.BUSINESS_OWNER]}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
