import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CashFlowForecast from './CashFlowForecast';

// Mock dependencies
vi.mock('../../hooks/useForecast', () => ({
  useForecast: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    fetchForecast: vi.fn(),
  })),
}));

vi.mock('recharts', () => ({
  ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

const mockForecastData = {
  historical: [
    { date: '2024-01-01', inflow: 5000, outflow: 3000, balance: 10000 },
    { date: '2024-01-02', inflow: 6000, outflow: 4000, balance: 12000 },
    { date: '2024-01-03', inflow: 4000, outflow: 2000, balance: 14000 },
  ],
  forecast: [
    { date: '2024-02-01', predicted_balance: 15000 },
    { date: '2024-02-02', predicted_balance: 16000 },
    { date: '2024-02-03', predicted_balance: 17000 },
  ],
  insight: 'Your cash flow is healthy and trending upward.',
  advice: [
    'Consider investing surplus funds',
    'Maintain current expense levels',
  ],
};

describe('CashFlowForecast', () => {
  const mockFetchForecast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component title', () => {
      render(<CashFlowForecast />);
      expect(screen.getByText('AI Cash Flow Forecast')).toBeInTheDocument();
    });

    it('should render subtitle with AI info', () => {
      render(<CashFlowForecast />);
      expect(screen.getByText(/Last 90 days \+ 30-day AI prediction/i)).toBeInTheDocument();
      expect(screen.getByText(/Powered by Gemini/i)).toBeInTheDocument();
    });

    it('should render refresh button', () => {
      render(<CashFlowForecast />);
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        fetchForecast: mockFetchForecast,
      });

      render(<CashFlowForecast />);
      expect(screen.getByText(/AI is analyzing your transactions/i)).toBeInTheDocument();
    });

    it('should show analyzing text in button when loading', () => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        fetchForecast: mockFetchForecast,
      });

      render(<CashFlowForecast />);
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    it('should disable refresh button when loading', () => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        fetchForecast: mockFetchForecast,
      });

      render(<CashFlowForecast />);
      const refreshButton = screen.getByText('Analyzing...').closest('button');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to fetch forecast',
        fetchForecast: mockFetchForecast,
      });

      render(<CashFlowForecast />);
      expect(screen.getByText('Failed to fetch forecast')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: mockForecastData,
        loading: false,
        error: null,
        fetchForecast: mockFetchForecast,
      });
    });

    it('should render chart when data is available', () => {
      render(<CashFlowForecast />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should display summary stats', () => {
      render(<CashFlowForecast />);
      expect(screen.getByText('Avg Daily Inflow')).toBeInTheDocument();
      expect(screen.getByText('Avg Daily Outflow')).toBeInTheDocument();
      expect(screen.getByText('Best Day')).toBeInTheDocument();
      expect(screen.getByText('Heaviest Outflow Day')).toBeInTheDocument();
    });

    it('should display predicted balance in 30 days', () => {
      render(<CashFlowForecast />);
      expect(screen.getByText('Predicted balance in 30 days')).toBeInTheDocument();
    });

    it('should display AI insight', () => {
      render(<CashFlowForecast />);
      expect(screen.getByText('AI Insight')).toBeInTheDocument();
      expect(screen.getByText(mockForecastData.insight)).toBeInTheDocument();
    });

    it('should display AI advice', () => {
      render(<CashFlowForecast />);
      expect(screen.getByText('AI Financial Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Consider investing surplus funds')).toBeInTheDocument();
      expect(screen.getByText('Maintain current expense levels')).toBeInTheDocument();
    });
  });

  describe('Risk Detection', () => {
    it('should show risk alert when predicted balance is negative', () => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: {
          ...mockForecastData,
          forecast: [
            { date: '2024-02-01', predicted_balance: -1000 },
            { date: '2024-02-02', predicted_balance: -2000 },
          ],
        },
        loading: false,
        error: null,
        fetchForecast: mockFetchForecast,
      });

      render(<CashFlowForecast />);
      expect(screen.getByText('Cash Flow Risk Detected')).toBeInTheDocument();
    });

    it('should not show risk alert when predicted balance is positive', () => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: mockForecastData,
        loading: false,
        error: null,
        fetchForecast: mockFetchForecast,
      });

      render(<CashFlowForecast />);
      expect(screen.queryByText('Cash Flow Risk Detected')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call fetchForecast on mount', () => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        fetchForecast: mockFetchForecast,
      });

      render(<CashFlowForecast />);
      expect(mockFetchForecast).toHaveBeenCalled();
    });

    it('should call fetchForecast when refresh button is clicked', () => {
      const { useForecast } = require('../../hooks/useForecast');
      vi.mocked(useForecast).mockReturnValue({
        data: mockForecastData,
        loading: false,
        error: null,
        fetchForecast: mockFetchForecast,
      });

      render(<CashFlowForecast />);
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      expect(mockFetchForecast).toHaveBeenCalledTimes(2); // Once on mount, once on click
    });
  });

  describe('Styling', () => {
    it('should have proper styling classes', () => {
      const { container } = render(<CashFlowForecast />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('bg-white', 'rounded-xl', 'border');
    });
  });
});
