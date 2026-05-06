/**
 * Tests for TodayCheckinsSection component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodayCheckinsSection from './TodayCheckinsSection';

// Mock dependencies
vi.mock('../api/checkins.api', () => ({
  checkinsApi: {
    getBusinessCheckinsToday: vi.fn(),
  },
}));

vi.mock('../context/PresenceContext', () => ({
  usePresenceContext: vi.fn(),
}));

vi.mock('./PresenceIndicator', () => ({
  PresenceIndicator: ({ isOnline }: any) => (
    <div data-testid="presence-indicator">{isOnline ? 'online' : 'offline'}</div>
  ),
}));

import { checkinsApi } from '../api/checkins.api';
import { usePresenceContext } from '../context/PresenceContext';

describe('TodayCheckinsSection', () => {
  const mockCheckinsData = {
    summary: {
      checkedIn: 2,
      skipped: 1,
      pending: 1,
    },
    members: [
      {
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: null,
        status: 'checked_in',
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            priority: 'HIGH',
          },
        ],
        note: 'Working on important features',
      },
      {
        userId: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        avatarUrl: 'https://example.com/avatar.jpg',
        status: 'pending',
        tasks: [],
        note: null,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    (checkinsApi.getBusinessCheckinsToday as any).mockResolvedValue(mockCheckinsData);
    (usePresenceContext as any).mockReturnValue({
      userStatuses: new Map([
        ['user-1', 'online'],
        ['user-2', 'offline'],
      ]),
      isConnected: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display loading state initially', () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    expect(screen.getByText('Loading today\'s check-ins...')).toBeInTheDocument();
  });

  it('should load and display check-ins data', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('Today\'s Check-ins')).toBeInTheDocument();
    });
  });

  it('should display summary statistics', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // checked in
      expect(screen.getByText('1')).toBeInTheDocument(); // skipped
      expect(screen.getByText('1')).toBeInTheDocument(); // pending
    });
  });

  it('should display member names', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should display member status', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('Checked in')).toBeInTheDocument();
      expect(screen.getByText('Not checked in yet')).toBeInTheDocument();
    });
  });

  it('should display tasks for checked-in members', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('Selected tasks:')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
  });

  it('should display member notes', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('Working on important features')).toBeInTheDocument();
    });
  });

  it('should toggle collapse when button is clicked', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const collapseButton = screen.getByRole('button', { name: '' });
    fireEvent.click(collapseButton);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

    fireEvent.click(collapseButton);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should refresh data when refresh button is clicked', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('Today\'s Check-ins')).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(checkinsApi.getBusinessCheckinsToday).toHaveBeenCalledTimes(2);
    });
  });

  it('should display live indicator when connected', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  it('should not display live indicator when disconnected', async () => {
    (usePresenceContext as any).mockReturnValue({
      userStatuses: new Map(),
      isConnected: false,
    });

    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.queryByText('Live')).not.toBeInTheDocument();
    });
  });

  it('should display online/offline status for members', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  it('should display presence indicators', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      const indicators = screen.getAllByTestId('presence-indicator');
      expect(indicators.length).toBe(2);
    });
  });

  it('should display error message on API failure', async () => {
    (checkinsApi.getBusinessCheckinsToday as any).mockRejectedValue({
      response: { data: { message: 'API Error' } },
    });

    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('should display "No team members found" when list is empty', async () => {
    (checkinsApi.getBusinessCheckinsToday as any).mockResolvedValue({
      summary: { checkedIn: 0, skipped: 0, pending: 0 },
      members: [],
    });

    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('No team members found')).toBeInTheDocument();
    });
  });

  it('should display avatar image when available', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      const avatar = screen.getByAltText('Jane Smith');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('should display initials when no avatar', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  it('should auto-refresh every 5 minutes', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      expect(checkinsApi.getBusinessCheckinsToday).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);

    await waitFor(() => {
      expect(checkinsApi.getBusinessCheckinsToday).toHaveBeenCalledTimes(2);
    });
  });

  it('should display priority colors for tasks', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      const taskBadge = screen.getByText('Task 1');
      expect(taskBadge).toHaveClass('bg-orange-100');
    });
  });

  it('should display correct status icons', async () => {
    render(<TodayCheckinsSection businessId="business-123" />);

    await waitFor(() => {
      const icons = document.querySelectorAll('.lucide-check-circle-2, .lucide-clock');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
