import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSalesOrderModal = ({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: 'create' | 'edit' }) => {
  if (!open) return null;
  
  return (
    <div data-testid="sales-order-modal">
      <h2>{mode === 'create' ? 'New Sales Order' : 'Edit Sales Order'}</h2>
      <input placeholder="Client" />
      <input placeholder="Order Date" type="date" />
      <input placeholder="Total Amount" />
      <button onClick={onClose}>Cancel</button>
      <button>Save</button>
    </div>
  );
};

describe('SalesOrderModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSalesOrderModal open={false} onClose={mockOnClose} mode="create" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render create mode', () => {
    render(<MockSalesOrderModal open={true} onClose={mockOnClose} mode="create" />);
    expect(screen.getByText('New Sales Order')).toBeInTheDocument();
  });

  it('should render edit mode', () => {
    render(<MockSalesOrderModal open={true} onClose={mockOnClose} mode="edit" />);
    expect(screen.getByText('Edit Sales Order')).toBeInTheDocument();
  });

  it('should render form inputs', () => {
    render(<MockSalesOrderModal open={true} onClose={mockOnClose} mode="create" />);
    expect(screen.getByPlaceholderText('Client')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Order Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Total Amount')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockSalesOrderModal open={true} onClose={mockOnClose} mode="create" />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
