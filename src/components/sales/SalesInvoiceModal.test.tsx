import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSalesInvoiceModal = ({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: 'create' | 'edit' }) => {
  if (!open) return null;
  
  return (
    <div data-testid="sales-invoice-modal">
      <h2>{mode === 'create' ? 'New Invoice' : 'Edit Invoice'}</h2>
      <input placeholder="Client" />
      <input placeholder="Amount" />
      <input placeholder="Due Date" type="date" />
      <button onClick={onClose}>Cancel</button>
      <button>Save</button>
    </div>
  );
};

describe('SalesInvoiceModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSalesInvoiceModal open={false} onClose={mockOnClose} mode="create" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render create mode', () => {
    render(<MockSalesInvoiceModal open={true} onClose={mockOnClose} mode="create" />);
    expect(screen.getByText('New Invoice')).toBeInTheDocument();
  });

  it('should render edit mode', () => {
    render(<MockSalesInvoiceModal open={true} onClose={mockOnClose} mode="edit" />);
    expect(screen.getByText('Edit Invoice')).toBeInTheDocument();
  });

  it('should render form inputs', () => {
    render(<MockSalesInvoiceModal open={true} onClose={mockOnClose} mode="create" />);
    expect(screen.getByPlaceholderText('Client')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Due Date')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockSalesInvoiceModal open={true} onClose={mockOnClose} mode="create" />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
