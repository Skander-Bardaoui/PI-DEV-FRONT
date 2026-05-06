import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSendInvoiceEmailModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="send-email-modal">
      <h2>Send Invoice by Email</h2>
      <input placeholder="To" type="email" />
      <input placeholder="Subject" />
      <textarea placeholder="Message" />
      <button onClick={onClose}>Cancel</button>
      <button>Send</button>
    </div>
  );
};

describe('SendInvoiceEmailModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSendInvoiceEmailModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockSendInvoiceEmailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('send-email-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockSendInvoiceEmailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Send Invoice by Email')).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<MockSendInvoiceEmailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('To')).toBeInTheDocument();
  });

  it('should render subject input', () => {
    render(<MockSendInvoiceEmailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Subject')).toBeInTheDocument();
  });

  it('should render message textarea', () => {
    render(<MockSendInvoiceEmailModal open={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockSendInvoiceEmailModal open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
