import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertsBell from './AlertsBell';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../hooks/usePurchaseAlerts', () => ({
  useAlertUnreadCount: vi.fn(() => ({ data: 5 })),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { business_id: 'business-123' },
  })),
}));

vi.mock('./AlertsPanel', () => ({
  default: vi.fn(() => <div>Alerts Panel</div>),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AlertsBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render bell icon', () => {
    render(<AlertsBell />, { wrapper: createWrapper() });

    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
  });

  it('should display unread count badge', () => {
    render(<AlertsBell />, { wrapper: createWrapper() });

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not display badge when count is 0', () => {
    const { useAlertUnreadCount } = require('../../hooks/usePurchaseAlerts');
    useAlertUnreadCount.mockReturnValue({ data: 0 });

    render(<AlertsBell />, { wrapper: createWrapper() });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should display 99+ when count exceeds 99', () => {
    const { useAlertUnreadCount } = require('../../hooks/usePurchaseAlerts');
    useAlertUnreadCount.mockReturnValue({ data: 150 });

    render(<AlertsBell />, { wrapper: createWrapper() });

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should toggle panel on bell click', () => {
    render(<AlertsBell />, { wrapper: createWrapper() });

    const bellButton = screen.getByRole('button');
    
    // Panel should not be visible initially
    expect(screen.queryByText('Alerts Panel')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(bellButton);
    expect(screen.getByText('Alerts Panel')).toBeInTheDocument();

    // Click to close
    fireEvent.click(bellButton);
    expect(screen.queryByText('Alerts Panel')).not.toBeInTheDocument();
  });

  it('should apply active styles when panel is open', () => {
    render(<AlertsBell />, { wrapper: createWrapper() });

    const bellButton = screen.getByRole('button');
    
    // Initially not active
    expect(bellButton).not.toHaveClass('bg-indigo-100');

    // Open panel
    fireEvent.click(bellButton);
    expect(bellButton).toHaveClass('bg-indigo-100');
  });

  it('should close panel when clicking outside', () => {
    render(<AlertsBell />, { wrapper: createWrapper() });

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    expect(screen.getByText('Alerts Panel')).toBeInTheDocument();

    // Simulate click outside
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Alerts Panel')).not.toBeInTheDocument();
  });

  it('should handle missing business_id gracefully', () => {
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({ user: {} });

    render(<AlertsBell />, { wrapper: createWrapper() });

    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
  });
});
