import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientStatsCard from './ClientStatsCard';

describe('ClientStatsCard', () => {
  const mockStats = {
    totalOrders: 25,
    totalInvoices: 30,
    totalRevenue: 15000.500,
    pendingAmount: 2500.750,
    averageOrderValue: 600.020,
    trend: 'up' as const,
    trendPercentage: 15,
  };

  it('should render all stat cards', () => {
    render(<ClientStatsCard stats={mockStats} />);

    expect(screen.getByText('Commandes totales')).toBeInTheDocument();
    expect(screen.getByText('Factures émises')).toBeInTheDocument();
    expect(screen.getByText('Chiffre d\'affaires')).toBeInTheDocument();
    expect(screen.getByText('En attente de paiement')).toBeInTheDocument();
  });

  it('should display total orders', () => {
    render(<ClientStatsCard stats={mockStats} />);

    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should display total invoices', () => {
    render(<ClientStatsCard stats={mockStats} />);

    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should display total revenue with correct format', () => {
    render(<ClientStatsCard stats={mockStats} />);

    expect(screen.getByText('15000.500 DT')).toBeInTheDocument();
  });

  it('should display pending amount with correct format', () => {
    render(<ClientStatsCard stats={mockStats} />);

    expect(screen.getByText('2500.750 DT')).toBeInTheDocument();
  });

  it('should display upward trend', () => {
    render(<ClientStatsCard stats={mockStats} />);

    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('should display downward trend', () => {
    const statsWithDownTrend = {
      ...mockStats,
      trend: 'down' as const,
      trendPercentage: 10,
    };

    render(<ClientStatsCard stats={statsWithDownTrend} />);

    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('should apply correct color for upward trend', () => {
    const { container } = render(<ClientStatsCard stats={mockStats} />);

    const trendElement = container.querySelector('.text-green-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('should apply correct color for downward trend', () => {
    const statsWithDownTrend = {
      ...mockStats,
      trend: 'down' as const,
    };

    const { container } = render(<ClientStatsCard stats={statsWithDownTrend} />);

    const trendElement = container.querySelector('.text-red-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('should display icons for each stat', () => {
    const { container } = render(<ClientStatsCard stats={mockStats} />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should handle zero values', () => {
    const zeroStats = {
      totalOrders: 0,
      totalInvoices: 0,
      totalRevenue: 0,
      pendingAmount: 0,
      averageOrderValue: 0,
      trend: 'up' as const,
      trendPercentage: 0,
    };

    render(<ClientStatsCard stats={zeroStats} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.000 DT')).toBeInTheDocument();
  });
});
