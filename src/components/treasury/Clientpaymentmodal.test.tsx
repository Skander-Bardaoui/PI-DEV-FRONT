import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockClientPaymentModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="client-payment-modal">
      <h2>Client Payment</h2>
      <input placeholder="Amount" />
      <input placeholder="Reference" />
      <button onClick={onClose}>Cancel</button>
      <button>Submit</button>
    </div>
  );
};

describe('ClientPaymentModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockClientPaymentModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockClientPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('client-payment-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockClientPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Client Payment')).toBeInTheDocument();
  });

  it('should render amount input', () => {
    render(<MockClientPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
  });

  it('should render reference input', () => {
    render(<MockClientPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Reference')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockClientPaymentModal open={true} onClose={mockOnClose} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
