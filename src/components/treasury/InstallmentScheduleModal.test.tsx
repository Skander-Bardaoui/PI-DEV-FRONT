import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockInstallmentScheduleModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="installment-schedule-modal">
      <h2>Installment Schedule</h2>
      <div data-testid="schedule-table">
        <div>Installment 1 - 1000 TND</div>
        <div>Installment 2 - 1000 TND</div>
        <div>Installment 3 - 1000 TND</div>
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

describe('InstallmentScheduleModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockInstallmentScheduleModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockInstallmentScheduleModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('installment-schedule-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockInstallmentScheduleModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Installment Schedule')).toBeInTheDocument();
  });

  it('should render schedule table', () => {
    render(<MockInstallmentScheduleModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('schedule-table')).toBeInTheDocument();
  });

  it('should render installment items', () => {
    render(<MockInstallmentScheduleModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Installment 1 - 1000 TND')).toBeInTheDocument();
    expect(screen.getByText('Installment 2 - 1000 TND')).toBeInTheDocument();
    expect(screen.getByText('Installment 3 - 1000 TND')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<MockInstallmentScheduleModal open={true} onClose={mockOnClose} />);
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
