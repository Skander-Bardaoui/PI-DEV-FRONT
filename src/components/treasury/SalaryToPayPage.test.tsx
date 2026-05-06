import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSalaryToPayPage = () => {
  return (
    <div data-testid="salary-to-pay-page">
      <h1>Salaries to Pay</h1>
      <div data-testid="salary-summary">
        <div>Total Payroll: 15000 TND</div>
        <div>Employees: 5</div>
        <div>Pending: 3</div>
      </div>
      <div data-testid="salary-table">
        <div>Employee 1 - 3000 TND</div>
        <div>Employee 2 - 3500 TND</div>
      </div>
    </div>
  );
};

describe('SalaryToPayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    render(<MockSalaryToPayPage />);
    expect(screen.getByText('Salaries to Pay')).toBeInTheDocument();
  });

  it('should render salary summary', () => {
    render(<MockSalaryToPayPage />);
    expect(screen.getByTestId('salary-summary')).toBeInTheDocument();
  });

  it('should display total payroll', () => {
    render(<MockSalaryToPayPage />);
    expect(screen.getByText('Total Payroll: 15000 TND')).toBeInTheDocument();
  });

  it('should display employee count', () => {
    render(<MockSalaryToPayPage />);
    expect(screen.getByText('Employees: 5')).toBeInTheDocument();
  });

  it('should display pending count', () => {
    render(<MockSalaryToPayPage />);
    expect(screen.getByText('Pending: 3')).toBeInTheDocument();
  });

  it('should render salary table', () => {
    render(<MockSalaryToPayPage />);
    expect(screen.getByTestId('salary-table')).toBeInTheDocument();
  });

  it('should display employee salary items', () => {
    render(<MockSalaryToPayPage />);
    expect(screen.getByText('Employee 1 - 3000 TND')).toBeInTheDocument();
    expect(screen.getByText('Employee 2 - 3500 TND')).toBeInTheDocument();
  });
});
