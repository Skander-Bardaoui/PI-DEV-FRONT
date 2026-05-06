import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadInvoiceScan from './UploadInvoiceScan';
import axiosInstance from '../../api/axiosInstance';

vi.mock('../../api/axiosInstance');

describe('UploadInvoiceScan', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload zone', () => {
    render(
      <UploadInvoiceScan
        businessId="biz-1"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Glisser-déposer ou cliquer pour choisir')).toBeInTheDocument();
    expect(screen.getByText('PDF, JPG, PNG — max 10 Mo')).toBeInTheDocument();
  });

  it('should show uploaded file preview when value is provided', () => {
    render(
      <UploadInvoiceScan
        businessId="biz-1"
        value="https://example.com/invoice.pdf"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Scan uploadé')).toBeInTheDocument();
    expect(screen.getByText('Voir le fichier')).toBeInTheDocument();
  });

  it('should open file in new tab when view link is clicked', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <UploadInvoiceScan
        businessId="biz-1"
        value="https://example.com/invoice.pdf"
        onChange={mockOnChange}
      />
    );

    const viewLink = screen.getByText('Voir le fichier');
    fireEvent.click(viewLink);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com/invoice.pdf',
      '_blank'
    );

    windowOpenSpy.mockRestore();
  });

  it('should clear uploaded file when delete button is clicked', () => {
    render(
      <UploadInvoiceScan
        businessId="biz-1"
        value="https://example.com/invoice.pdf"
        onChange={mockOnChange}
      />
    );

    const deleteButton = screen.getByTitle('Supprimer');
    fireEvent.click(deleteButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should upload file successfully', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { url: 'https://example.com/uploaded.pdf' },
    });

    render(
      <UploadInvoiceScan
        businessId="biz-1"
        onChange={mockOnChange}
      />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/businesses/biz-1/upload/invoice-scan',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(mockOnChange).toHaveBeenCalledWith('https://example.com/uploaded.pdf');
    });
  });

  it('should show error for unsupported file type', async () => {
    render(
      <UploadInvoiceScan
        businessId="biz-1"
        onChange={mockOnChange}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      expect(screen.getByText(/Format non supporté/i)).toBeInTheDocument();
    });
  });

  it('should show error for file too large', async () => {
    render(
      <UploadInvoiceScan
        businessId="biz-1"
        onChange={mockOnChange}
      />
    );

    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      expect(screen.getByText(/Fichier trop volumineux/i)).toBeInTheDocument();
    });
  });

  it('should handle upload error', async () => {
    (axiosInstance.post as any).mockRejectedValue({
      response: { data: { message: 'Upload failed' } },
    });

    render(
      <UploadInvoiceScan
        businessId="biz-1"
        onChange={mockOnChange}
      />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('should show loading state during upload', async () => {
    (axiosInstance.post as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <UploadInvoiceScan
        businessId="biz-1"
        onChange={mockOnChange}
      />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
    }

    expect(screen.getByText('Upload en cours...')).toBeInTheDocument();
  });

  it('should handle drag and drop', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { url: 'https://example.com/uploaded.pdf' },
    });

    render(
      <UploadInvoiceScan
        businessId="biz-1"
        onChange={mockOnChange}
      />
    );

    const dropZone = screen.getByText('Glisser-déposer ou cliquer pour choisir').parentElement;
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    if (dropZone) {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });
    }

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('https://example.com/uploaded.pdf');
    });
  });
});
