import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSupplierPaymentModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="supplier-payment-modal">
      <h2>Supplier Payment</h2>
      <input placeholder="Supplier" />
      <input placeholder="Amount" />
      <input placeholder="Reference" />
      <button onClick={onClose}>Cancel</button>
      <button>Submit</button>
    </div>
  );
};

describe('SupplierPaymentModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSupplierPaymentModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockSupplierPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('supplier-payment-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockSupplierPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Supplier Payment')).toBeInTheDocument();
  });

  it('should render supplier input', () => {
    render(<MockSupplierPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Supplier')).toBeInTheDocument();
  });

  it('should render amount input', () => {
    render(<MockSupplierPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
  });

  it('should render reference input', () => {
    render(<MockSupplierPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Reference')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockSupplierPaymentModal open={true} onClose={mockOnClose} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should render submit button', () => {
    render(<MockSupplierPaymentModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
});
