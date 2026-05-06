import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecurringInvoiceStatsCards from './RecurringInvoiceStatsCards';

// Mock hook
vi.mock('../../hooks/useRecurringInvoices', () => ({
  useRecurringInvoiceStats: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
}));

const mockStats = {
  monthly_revenue_forecast: 15000.5,
  total_active: 10,
  total_inactive: 2,
  total_paused: 3,
  invoices_generated_this_month: 25,
  activation_rate: 66.7,
};

describe('RecurringInvoiceStatsCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show skeleton loaders when loading', () => {
      const { useRecurringInvoiceStats } = require('../../hooks/useRecurringInvoices');
      vi.mocked(useRecurringInvoiceStats).mockReturnValue({
        data: null,
        isLoading: true,
      });

      const { container } = render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(4);
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      const { useRecurringInvoiceStats } = require('../../hooks/useRecurringInvoices');
      vi.mocked(useRecurringInvoiceStats).mockReturnValue({
        data: mockStats,
        isLoading: false,
      });
    });

    it('should display monthly revenue forecast', () => {
      render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      expect(screen.getByText('Revenu mensuel prévisionnel')).toBeInTheDocument();
      expect(screen.getByText('15000.500 DT')).toBeInTheDocument();
    });

    it('should display active recurring invoices count', () => {
      render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      expect(screen.getByText('Récurrences actives')).toBeInTheDocument();
      expect(screen.getByText('10 / 15')).toBeInTheDocument();
    });

    it('should display paused count when applicable', () => {
      render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      expect(screen.getByText('3 en pause')).toBeInTheDocument();
    });

    it('should display invoices generated this month', () => {
      render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      expect(screen.getByText('Factures générées')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should display activation rate', () => {
      render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      expect(screen.getByText('Taux d\'activation')).toBeInTheDocument();
      expect(screen.getByText('66.7%')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should not render when no data', () => {
      const { useRecurringInvoiceStats } = require('../../hooks/useRecurringInvoices');
      vi.mocked(useRecurringInvoiceStats).mockReturnValue({
        data: null,
        isLoading: false,
      });

      const { container } = render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Styling', () => {
    beforeEach(() => {
      const { useRecurringInvoiceStats } = require('../../hooks/useRecurringInvoices');
      vi.mocked(useRecurringInvoiceStats).mockReturnValue({
        data: mockStats,
        isLoading: false,
      });
    });

    it('should have gradient backgrounds', () => {
      const { container } = render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      const cards = container.querySelectorAll('.bg-gradient-to-br');
      expect(cards.length).toBe(4);
    });

    it('should display progress bar for activation rate', () => {
      const { container } = render(<RecurringInvoiceStatsCards businessId="biz-1" />);
      const progressBar = container.querySelector('.bg-amber-600');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
