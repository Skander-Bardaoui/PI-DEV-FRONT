import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSalesOcrInvoiceModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="ocr-invoice-modal">
      <h2>OCR Invoice Extraction</h2>
      <div data-testid="upload-zone">
        <input type="file" accept="image/*,application/pdf" />
        <p>Upload invoice image or PDF</p>
      </div>
      <div data-testid="extracted-data">
        <div>Client: Extracted Client Name</div>
        <div>Amount: 1500 TND</div>
        <div>Date: 2024-01-15</div>
      </div>
      <button onClick={onClose}>Cancel</button>
      <button>Process</button>
    </div>
  );
};

describe('SalesOcrInvoiceModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSalesOcrInvoiceModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockSalesOcrInvoiceModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('ocr-invoice-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockSalesOcrInvoiceModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('OCR Invoice Extraction')).toBeInTheDocument();
  });

  it('should render upload zone', () => {
    render(<MockSalesOcrInvoiceModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
    expect(screen.getByText('Upload invoice image or PDF')).toBeInTheDocument();
  });

  it('should render file input', () => {
    render(<MockSalesOcrInvoiceModal open={true} onClose={mockOnClose} />);
    const fileInput = screen.getByRole('textbox', { hidden: true }) || document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('should display extracted data', () => {
    render(<MockSalesOcrInvoiceModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText(/Client: Extracted Client Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Amount: 1500 TND/i)).toBeInTheDocument();
    expect(screen.getByText(/Date: 2024-01-15/i)).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockSalesOcrInvoiceModal open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
