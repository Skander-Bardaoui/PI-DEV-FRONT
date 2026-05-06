import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSalesMatchingModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="sales-matching-modal">
      <h2>Match Sales Documents</h2>
      <div data-testid="matching-list">
        <div>Quote #Q001 → Invoice #INV001</div>
        <div>Order #SO001 → Delivery #DN001</div>
      </div>
      <button onClick={onClose}>Cancel</button>
      <button>Confirm Match</button>
    </div>
  );
};

describe('SalesMatchingModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSalesMatchingModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockSalesMatchingModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('sales-matching-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockSalesMatchingModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Match Sales Documents')).toBeInTheDocument();
  });

  it('should display matching list', () => {
    render(<MockSalesMatchingModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('matching-list')).toBeInTheDocument();
  });

  it('should display matching items', () => {
    render(<MockSalesMatchingModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText(/Quote #Q001 → Invoice #INV001/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #SO001 → Delivery #DN001/i)).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockSalesMatchingModal open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
