/**
 * Tests for PlatformAdminRoute component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { PlatformAdminRoute } from './PlatformAdminRoute';

// Mock usePlatformAdmin hook
vi.mock('../hooks/usePlatformAdmin', () => ({
  usePlatformAdmin: vi.fn(),
}));

import { usePlatformAdmin } from '../hooks/usePlatformAdmin';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PlatformAdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when loading', () => {
    (usePlatformAdmin as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithRouter(
      <PlatformAdminRoute>
        <div>Protected Content</div>
      </PlatformAdminRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    (usePlatformAdmin as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter(
      <PlatformAdminRoute>
        <div>Protected Content</div>
      </PlatformAdminRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    (usePlatformAdmin as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter(
      <PlatformAdminRoute>
        <div>Protected Content</div>
      </PlatformAdminRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render children while loading', () => {
    (usePlatformAdmin as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
    });

    renderWithRouter(
      <PlatformAdminRoute>
        <div>Protected Content</div>
      </PlatformAdminRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should have loading spinner with correct styling', () => {
    (usePlatformAdmin as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { container } = renderWithRouter(
      <PlatformAdminRoute>
        <div>Protected Content</div>
      </PlatformAdminRoute>
    );

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full');
  });

  it('should render loading state with centered layout', () => {
    (usePlatformAdmin as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { container } = renderWithRouter(
      <PlatformAdminRoute>
        <div>Protected Content</div>
      </PlatformAdminRoute>
    );

    const loadingContainer = container.querySelector('.min-h-screen');
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
