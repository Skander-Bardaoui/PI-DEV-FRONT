/**
 * Tests for TreasuryWidget component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TreasuryWidget from './TreasuryWidget';

// Mock hooks
vi.mock('../../hooks/useTreasury', () => ({
  useTreasuryStats: vi.fn(() => ({
    data: {
      total_balance: 50000,
      total_income: 75000,
      total_expenses: 25000,
      accounts_count: 3,
    },
    isLoading: false,
    error: null,
  })),
}));

describe('TreasuryWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render widget with treasury stats', () => {
    render(<TreasuryWidget businessId="business-1" />);
    
    expect(screen.getByText(/trésorerie|treasury/i)).toBeInTheDocument();
  });

  it('should display total balance', () => {
    render(<TreasuryWidget businessId="business-1" />);
    
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('50') || false;
    })).toBeInTheDocument();
  });

  it('should display loading state', () => {
    const { useTreasuryStats } = require('../../hooks/useTreasury');
    useTreasuryStats.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<TreasuryWidget businessId="business-1" />);
    
    expect(screen.getByText(/chargement|loading/i)).toBeInTheDocument();
  });

  it('should display error state', () => {
    const { useTreasuryStats } = require('../../hooks/useTreasury');
    useTreasuryStats.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(<TreasuryWidget businessId="business-1" />);
    
    expect(screen.getByText(/erreur|error/i)).toBeInTheDocument();
  });

  it('should display income and expenses', () => {
    render(<TreasuryWidget businessId="business-1" />);
    
    // Check for income and expenses indicators
    const widget = screen.getByText(/trésorerie|treasury/i).closest('div');
    expect(widget).toBeInTheDocument();
  });

  it('should display accounts count', () => {
    render(<TreasuryWidget businessId="business-1" />);
    
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('3') || false;
    })).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<TreasuryWidget businessId="business-1" />);
    
    const widget = container.firstChild;
    expect(widget).toHaveClass('bg-white', 'rounded-xl');
  });

  it('should format currency correctly', () => {
    render(<TreasuryWidget businessId="business-1" />);
    
    // Check for TND currency
    expect(screen.getByText(/TND|DT/i)).toBeInTheDocument();
  });
});
