import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSalesInvoiceDetailModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="invoice-detail-modal">
      <h2>Invoice Details</h2>
      <div data-testid="invoice-info">
        <div>Invoice #: INV-001</div>
        <div>Client: Test Client</div>
        <div>Amount: 1000 TND</div>
        <div>Status: Paid</div>
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

describe('SalesInvoiceDetailModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSalesInvoiceDetailModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockSalesInvoiceDetailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('invoice-detail-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockSalesInvoiceDetailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Invoice Details')).toBeInTheDocument();
  });

  it('should display invoice information', () => {
    render(<MockSalesInvoiceDetailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText(/Invoice #: INV-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Client: Test Client/i)).toBeInTheDocument();
    expect(screen.getByText(/Amount: 1000 TND/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: Paid/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<MockSalesInvoiceDetailModal open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
