/**
 * Tests for PermissionGuard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PermissionGuard from './PermissionGuard';
import { Role } from '../types/auth.types';
import { PermissionType } from '../types/permissions.types';

// Mock hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/useCurrentBusinessMember', () => ({
  useCurrentBusinessMember: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';
import { useCurrentBusinessMember } from '../hooks/useCurrentBusinessMember';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading when auth is loading', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: true,
    });
    (useCurrentBusinessMember as any).mockReturnValue({
      businessMember: null,
      isLoading: false,
    });

    renderWithRouter(
      <PermissionGuard>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Vérification des permissions...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false,
    });
    (useCurrentBusinessMember as any).mockReturnValue({
      businessMember: null,
      isLoading: false,
    });

    renderWithRouter(
      <PermissionGuard>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should allow PLATFORM_ADMIN access without checking permissions', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.PLATFORM_ADMIN },
      isLoading: false,
    });
    (useCurrentBusinessMember as any).mockReturnValue({
      businessMember: null,
      isLoading: false,
    });

    renderWithRouter(
      <PermissionGuard requiredPermissions={[PermissionType.CREATE]}>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should allow access when no permissions required', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.BUSINESS_OWNER },
      isLoading: false,
    });
    (useCurrentBusinessMember as any).mockReturnValue({
      businessMember: { permissions: '------' },
      isLoading: false,
    });

    renderWithRouter(
      <PermissionGuard>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should allow access when user has required permission', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.BUSINESS_OWNER },
      isLoading: false,
    });
    (useCurrentBusinessMember as any).mockReturnValue({
      businessMember: { permissions: 'c-----' }, // Has CREATE permission
      isLoading: false,
    });

    renderWithRouter(
      <PermissionGuard requiredPermissions={[PermissionType.CREATE]}>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should deny access when user lacks required permission', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.TEAM_MEMBER },
      isLoading: false,
    });
    (useCurrentBusinessMember as any).mockReturnValue({
      businessMember: { permissions: '------' }, // No permissions
      isLoading: false,
    });

    renderWithRouter(
      <PermissionGuard requiredPermissions={[PermissionType.CREATE]}>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render fallback when permission denied and fallback provided', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: Role.TEAM_MEMBER },
      isLoading: false,
    });
    (useCurrentBusinessMember as any).mockReturnValue({
      businessMember: { permissions: '------' },
      isLoading: false,
    });

    renderWithRouter(
      <PermissionGuard
        requiredPermissions={[PermissionType.CREATE]}
        fallback={<div>Access Denied</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
