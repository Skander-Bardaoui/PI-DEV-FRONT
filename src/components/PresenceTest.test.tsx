/**
 * Tests for PresenceTest component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PresenceTest } from './PresenceTest';

// Mock usePresence hook
vi.mock('../hooks/usePresence', () => ({
  usePresence: vi.fn(),
}));

import { usePresence } from '../hooks/usePresence';

describe('PresenceTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render component title', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: false,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(screen.getByText('Presence System Test')).toBeInTheDocument();
  });

  it('should show connected status when connected', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: true,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(screen.getByText('🟢 Connected')).toBeInTheDocument();
  });

  it('should show disconnected status when not connected', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: false,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(screen.getByText('🔴 Disconnected')).toBeInTheDocument();
  });

  it('should display online users count', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: ['user-1', 'user-2', 'user-3'],
      userStatuses: {},
      isConnected: true,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(screen.getByText('Online Users (3):')).toBeInTheDocument();
  });

  it('should display list of online users', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: ['user-1', 'user-2'],
      userStatuses: {},
      isConnected: true,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(screen.getByText('• user-1')).toBeInTheDocument();
    expect(screen.getByText('• user-2')).toBeInTheDocument();
  });

  it('should show "No users online" when no users', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: true,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(screen.getByText('No users online')).toBeInTheDocument();
  });

  it('should display connection logs section', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: false,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(screen.getByText('Connection Logs:')).toBeInTheDocument();
  });

  it('should apply green background when connected', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: true,
    });

    const { container } = render(
      <PresenceTest businessId="business-123" token="test-token" />
    );

    const statusBadge = container.querySelector('.bg-green-100');
    expect(statusBadge).toBeInTheDocument();
  });

  it('should apply red background when disconnected', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: false,
    });

    const { container } = render(
      <PresenceTest businessId="business-123" token="test-token" />
    );

    const statusBadge = container.querySelector('.bg-red-100');
    expect(statusBadge).toBeInTheDocument();
  });

  it('should call usePresence with correct parameters', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: false,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(usePresence).toHaveBeenCalledWith('business-123', 'test-token');
  });

  it('should have proper styling for logs section', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: false,
    });

    const { container } = render(
      <PresenceTest businessId="business-123" token="test-token" />
    );

    const logsContainer = container.querySelector('.bg-black.text-green-400');
    expect(logsContainer).toBeInTheDocument();
  });

  it('should display zero count when no users online', () => {
    (usePresence as any).mockReturnValue({
      onlineUsers: [],
      userStatuses: {},
      isConnected: true,
    });

    render(<PresenceTest businessId="business-123" token="test-token" />);

    expect(screen.getByText('Online Users (0):')).toBeInTheDocument();
  });
});
