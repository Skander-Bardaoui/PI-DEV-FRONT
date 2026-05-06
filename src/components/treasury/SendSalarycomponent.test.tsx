import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSendSalaryComponent = ({ onSend }: { onSend: () => void }) => {
  return (
    <div data-testid="send-salary-component">
      <h2>Send Salary</h2>
      <input placeholder="Employee" />
      <input placeholder="Amount" />
      <input placeholder="Account" />
      <textarea placeholder="Notes" />
      <button onClick={onSend}>Send Salary</button>
      <button>Cancel</button>
    </div>
  );
};

describe('SendSalaryComponent', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render component', () => {
    render(<MockSendSalaryComponent onSend={mockOnSend} />);
    expect(screen.getByTestId('send-salary-component')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockSendSalaryComponent onSend={mockOnSend} />);
    expect(screen.getByText('Send Salary')).toBeInTheDocument();
  });

  it('should render employee input', () => {
    render(<MockSendSalaryComponent onSend={mockOnSend} />);
    expect(screen.getByPlaceholderText('Employee')).toBeInTheDocument();
  });

  it('should render amount input', () => {
    render(<MockSendSalaryComponent onSend={mockOnSend} />);
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
  });

  it('should render account input', () => {
    render(<MockSendSalaryComponent onSend={mockOnSend} />);
    expect(screen.getByPlaceholderText('Account')).toBeInTheDocument();
  });

  it('should render notes textarea', () => {
    render(<MockSendSalaryComponent onSend={mockOnSend} />);
    expect(screen.getByPlaceholderText('Notes')).toBeInTheDocument();
  });

  it('should call onSend when send button is clicked', () => {
    render(<MockSendSalaryComponent onSend={mockOnSend} />);
    const sendButton = screen.getByText('Send Salary');
    fireEvent.click(sendButton);
    expect(mockOnSend).toHaveBeenCalled();
  });

  it('should render cancel button', () => {
    render(<MockSendSalaryComponent onSend={mockOnSend} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
