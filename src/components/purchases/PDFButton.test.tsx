import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PDFButton from './PDFButton';

describe('PDFButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ghost variant by default', () => {
    render(<PDFButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('PDF');
    expect(button).toHaveClass('border-red-200');
  });

  it('should render primary variant', () => {
    render(<PDFButton onClick={mockOnClick} variant="primary" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('should render icon variant', () => {
    render(<PDFButton onClick={mockOnClick} variant="icon" label="Download PDF" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Download PDF');
    expect(button).not.toHaveTextContent('Download PDF');
  });

  it('should call onClick when clicked', () => {
    render(<PDFButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should display loading spinner when loading', () => {
    render(<PDFButton onClick={mockOnClick} loading={true} />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should be disabled when loading', () => {
    render(<PDFButton onClick={mockOnClick} loading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    render(<PDFButton onClick={mockOnClick} loading={true} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<PDFButton onClick={mockOnClick} className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should display custom label', () => {
    render(<PDFButton onClick={mockOnClick} label="Télécharger" />);

    expect(screen.getByText('Télécharger')).toBeInTheDocument();
  });

  it('should handle async onClick', async () => {
    const asyncOnClick = vi.fn().mockResolvedValue(undefined);
    render(<PDFButton onClick={asyncOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(asyncOnClick).toHaveBeenCalled();
  });

  it('should show loading spinner in primary variant', () => {
    render(<PDFButton onClick={mockOnClick} variant="primary" loading={true} />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should show loading spinner in icon variant', () => {
    render(<PDFButton onClick={mockOnClick} variant="icon" loading={true} />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });
});
