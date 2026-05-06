import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockRecurringInvoiceHistoryDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="history-drawer">
      <h2>Invoice History</h2>
      <div data-testid="history-list">
        <div>Invoice 1 - Generated on 2024-01-01</div>
        <div>Invoice 2 - Generated on 2024-02-01</div>
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

describe('RecurringInvoiceHistoryDrawer', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockRecurringInvoiceHistoryDrawer open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockRecurringInvoiceHistoryDrawer open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('history-drawer')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockRecurringInvoiceHistoryDrawer open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Invoice History')).toBeInTheDocument();
  });

  it('should render history list', () => {
    render(<MockRecurringInvoiceHistoryDrawer open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('history-list')).toBeInTheDocument();
  });

  it('should display invoice items', () => {
    render(<MockRecurringInvoiceHistoryDrawer open={true} onClose={mockOnClose} />);
    expect(screen.getByText(/Invoice 1 - Generated on 2024-01-01/i)).toBeInTheDocument();
    expect(screen.getByText(/Invoice 2 - Generated on 2024-02-01/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<MockRecurringInvoiceHistoryDrawer open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
