import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatisticsDashboard from './StatisticsDashboard';

// Mock dependencies
vi.mock('../api/statistics.api', () => ({
  statisticsApi: {
    getTeamStatistics: vi.fn(),
  },
}));

vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

vi.mock('./MemberDetailModal', () => ({
  default: ({ member, onClose }: any) => (
    <div data-testid="member-detail-modal">
      <span>{member.name}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

global.fetch = vi.fn();

describe('StatisticsDashboard', () => {
  const mockStatistics = {
    overview: {
      totalTasks: 100,
      completedTasks: 75,
      completionRate: 75,
      overdueTasks: 10,
      overdueRate: 10,
      inTimeTasks: 65,
    },
    byStatus: {
      TODO: 15,
      IN_PROGRESS: 10,
      DONE: 75,
      BLOCKED: 0,
    },
    byPriority: {
      LOW: 30,
      MEDIUM: 50,
      HIGH: 20,
    },
    members: [
      {
        memberId: '1',
        userId: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'TEAM_MEMBER',
        assigned: 20,
        completed: 15,
        overdue: 2,
        inTime: 13,
        activityScore: 75,
      },
      {
        memberId: '2',
        userId: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'BUSINESS_ADMIN',
        assigned: 30,
        completed: 25,
        overdue: 0,
        inTime: 25,
        activityScore: 83,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { statisticsApi } = require('../api/statistics.api');
    statisticsApi.getTeamStatistics.mockResolvedValue(mockStatistics);
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: [] }),
    } as Response);
  });

  it('renders loading state initially', () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders statistics overview cards', async () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Overdue')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('In Time')).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Tasks by Status')).toBeInTheDocument();
      expect(screen.getByText('Tasks by Priority')).toBeInTheDocument();
      expect(screen.getAllByTestId('pie-chart')).toHaveLength(1);
      expect(screen.getAllByTestId('bar-chart')).toHaveLength(1);
    });
  });

  it('renders team performance table', async () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Team Performance')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('filters members by role', async () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const roleFilter = screen.getByRole('combobox');
    fireEvent.change(roleFilter, { target: { value: 'BUSINESS_ADMIN' } });
    
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('filters members by search query', async () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search members...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('opens member detail modal on row click', async () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const row = screen.getByText('John Doe').closest('tr');
    fireEvent.click(row!);
    
    await waitFor(() => {
      expect(screen.getByTestId('member-detail-modal')).toBeInTheDocument();
    });
  });

  it('closes member detail modal', async () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const row = screen.getByText('John Doe').closest('tr');
    fireEvent.click(row!);
    
    await waitFor(() => {
      expect(screen.getByTestId('member-detail-modal')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('member-detail-modal')).not.toBeInTheDocument();
    });
  });

  it('displays error state on fetch failure', async () => {
    const { statisticsApi } = require('../api/statistics.api');
    statisticsApi.getTeamStatistics.mockRejectedValue(new Error('Failed to load'));
    
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load statistics/i)).toBeInTheDocument();
    });
  });

  it('shows no members message when filtered list is empty', async () => {
    render(<StatisticsDashboard businessId="business-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search members...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('No members found matching your filters')).toBeInTheDocument();
    });
  });
});
