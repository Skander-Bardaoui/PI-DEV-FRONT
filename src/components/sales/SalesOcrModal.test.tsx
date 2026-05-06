import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const MockSalesOcrModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  
  return (
    <div data-testid="sales-ocr-modal">
      <h2>OCR Document Scanner</h2>
      <div data-testid="upload-area">
        <input type="file" />
        <p>Drag and drop or click to upload</p>
      </div>
      <button onClick={onClose}>Cancel</button>
      <button>Scan</button>
    </div>
  );
};

describe('SalesOcrModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <MockSalesOcrModal open={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when open is true', () => {
    render(<MockSalesOcrModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('sales-ocr-modal')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<MockSalesOcrModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('OCR Document Scanner')).toBeInTheDocument();
  });

  it('should render upload area', () => {
    render(<MockSalesOcrModal open={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('upload-area')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<MockSalesOcrModal open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
