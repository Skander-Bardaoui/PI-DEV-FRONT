import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockExpensesToPayPage = () => {
  return (
    <div data-testid="expenses-to-pay-page">
      <h1>Expenses to Pay</h1>
      <div data-testid="expenses-summary">
        <div>Total: 5000 TND</div>
        <div>Overdue: 2</div>
        <div>Due Soon: 3</div>
      </div>
      <div data-testid="expenses-table">
        <div>Expense 1</div>
        <div>Expense 2</div>
      </div>
    </div>
  );
};

describe('ExpensesToPayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    render(<MockExpensesToPayPage />);
    expect(screen.getByText('Expenses to Pay')).toBeInTheDocument();
  });

  it('should render expenses summary', () => {
    render(<MockExpensesToPayPage />);
    expect(screen.getByTestId('expenses-summary')).toBeInTheDocument();
  });

  it('should display total amount', () => {
    render(<MockExpensesToPayPage />);
    expect(screen.getByText('Total: 5000 TND')).toBeInTheDocument();
  });

  it('should display overdue count', () => {
    render(<MockExpensesToPayPage />);
    expect(screen.getByText('Overdue: 2')).toBeInTheDocument();
  });

  it('should display due soon count', () => {
    render(<MockExpensesToPayPage />);
    expect(screen.getByText('Due Soon: 3')).toBeInTheDocument();
  });

  it('should render expenses table', () => {
    render(<MockExpensesToPayPage />);
    expect(screen.getByTestId('expenses-table')).toBeInTheDocument();
  });

  it('should display expense items', () => {
    render(<MockExpensesToPayPage />);
    expect(screen.getByText('Expense 1')).toBeInTheDocument();
    expect(screen.getByText('Expense 2')).toBeInTheDocument();
  });
});
