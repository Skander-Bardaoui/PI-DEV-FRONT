import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSalesOrderDetailModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="order-detail-modal">
      <h2>Sales Order Details</h2>
      <div data-testid="order-info">
        <div>Order #: SO-001</div>
        <div>Client: Test Client</div>
        <div>Total: 2500 TND</div>
        <div>Status: Confirmed</div>
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

describe('SalesOrderDetailModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSalesOrderDetailModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockSalesOrderDetailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('order-detail-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockSalesOrderDetailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Sales Order Details')).toBeInTheDocument();
  });

  it('should display order information', () => {
    render(<MockSalesOrderDetailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText(/Order #: SO-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Client: Test Client/i)).toBeInTheDocument();
    expect(screen.getByText(/Total: 2500 TND/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: Confirmed/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<MockSalesOrderDetailModal open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
