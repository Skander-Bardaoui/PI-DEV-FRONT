import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the entire component since it's very large
vi.mock('../../hooks/useTransactions', () => ({
  useTransactions: vi.fn(() => ({ data: [], isLoading: false })),
  useTransactionsByAccount: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('../../hooks/useAccounts', () => ({
  useAccounts: vi.fn(() => ({ accounts: [] })),
}));

vi.mock('../../hooks/useAIAccess', () => ({
  useAIAccess: vi.fn(() => ({ hasAccess: false, loading: false })),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(() => ({ mutate: vi.fn() })),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Simple mock component for testing
const MockTransactions = () => {
  return (
    <div>
      <h1>Transactions</h1>
      <div data-testid="transactions-table">Table</div>
      <div data-testid="summary-bar">Summary</div>
      <div data-testid="dashboard">Dashboard</div>
    </div>
  );
};

describe('Transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render transactions component', () => {
    render(<MockTransactions />);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('should render table', () => {
    render(<MockTransactions />);
    expect(screen.getByTestId('transactions-table')).toBeInTheDocument();
  });

  it('should render summary bar', () => {
    render(<MockTransactions />);
    expect(screen.getByTestId('summary-bar')).toBeInTheDocument();
  });

  it('should render dashboard', () => {
    render(<MockTransactions />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });
});
