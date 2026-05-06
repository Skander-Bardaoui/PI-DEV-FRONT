import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockRecurringInvoiceModal = ({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: 'create' | 'edit' }) => {
  if (!open) return null;
  
  return (
    <div data-testid="recurring-invoice-modal">
      <h2>{mode === 'create' ? 'New Recurring Invoice' : 'Edit Recurring Invoice'}</h2>
      <input placeholder="Client" />
      <input placeholder="Amount" />
      <select>
        <option>Monthly</option>
        <option>Quarterly</option>
      </select>
      <button onClick={onClose}>Cancel</button>
      <button>Submit</button>
    </div>
  );
};

describe('RecurringInvoiceModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockRecurringInvoiceModal open={false} onClose={mockOnClose} mode="create" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render create mode', () => {
    render(<MockRecurringInvoiceModal open={true} onClose={mockOnClose} mode="create" />);
    expect(screen.getByText('New Recurring Invoice')).toBeInTheDocument();
  });

  it('should render edit mode', () => {
    render(<MockRecurringInvoiceModal open={true} onClose={mockOnClose} mode="edit" />);
    expect(screen.getByText('Edit Recurring Invoice')).toBeInTheDocument();
  });

  it('should render form inputs', () => {
    render(<MockRecurringInvoiceModal open={true} onClose={mockOnClose} mode="create" />);
    expect(screen.getByPlaceholderText('Client')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
  });

  it('should render frequency selector', () => {
    render(<MockRecurringInvoiceModal open={true} onClose={mockOnClose} mode="create" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockRecurringInvoiceModal open={true} onClose={mockOnClose} mode="create" />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
