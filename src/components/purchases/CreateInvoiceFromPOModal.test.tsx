import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateInvoiceFromPOModal from './CreateInvoiceFromPOModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockPO = {
  id: 'po-1',
  po_number: 'BC-001',
  supplier_id: 'supplier-1',
  subtotal_ht: '1000.000',
  tax_amount: '190.000',
  timbre_fiscal: '1.000',
  net_amount: '1191.000',
  supplier: {
    name: 'Fournisseur Test',
  },
  items: [
    {
      id: 'item-1',
      description: 'Product 1',
      quantity_ordered: 10,
      unit_price_ht: '100.000',
      tax_rate_value: '19.000',
    },
  ],
};

const mockReceipts = [
  {
    id: 'gr-1',
    gr_number: 'BR-001',
    receipt_date: '2026-05-01',
    items: [
      {
        supplier_po_item_id: 'item-1',
        quantity_received: 10,
      },
    ],
  },
];

vi.mock('../../hooks/usePurchaseInvoices', () => ({
  useCreatePurchaseInvoice: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'inv-1' }),
    isPending: false,
  })),
  usePurchaseInvoices: vi.fn(() => ({
    data: [],
  })),
}));

vi.mock('../../hooks/useGoodsReceipts', () => ({
  useGoodsReceiptsByPO: vi.fn(() => ({
    data: mockReceipts,
  })),
}));

vi.mock('../ui/Toast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock('../ui/ConfirmModal', () => ({
  useApiError: vi.fn(() => ({
    handleError: vi.fn(),
  })),
}));

vi.mock('./OcrInvoiceModal', () => ({
  default: vi.fn(() => <div>OCR Modal</div>),
}));

vi.mock('./UploadInvoiceScan', () => ({
  default: vi.fn(({ value, onChange }) => (
    <input
      data-testid="upload-scan"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )),
}));

vi.mock('../../types', () => ({
  formatAmount: vi.fn((val) => `${Number(val).toFixed(3)} TND`),
  round3: vi.fn((val) => Math.round(val * 1000) / 1000),
  TIMBRE_FISCAL: 1.000,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CreateInvoiceFromPOModal', () => {
  const mockOnClose = vi.fn();
  const businessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with PO information', () => {
    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Créer une facture')).toBeInTheDocument();
    expect(screen.getByText(/BC-001/)).toBeInTheDocument();
    expect(screen.getByText(/Fournisseur Test/)).toBeInTheDocument();
  });

  it('should display goods receipts selector', () => {
    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Bon de réception à facturer/i)).toBeInTheDocument();
    expect(screen.getByText(/BR-001/)).toBeInTheDocument();
  });

  it('should pre-fill amounts from PO', () => {
    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const subtotalInput = screen.getByLabelText(/Sous-total HT/i) as HTMLInputElement;
    expect(subtotalInput.value).toBe('1000');
  });

  it('should handle date inputs', () => {
    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const invoiceDateInput = screen.getByLabelText(/Date facture/i);
    fireEvent.change(invoiceDateInput, { target: { value: '2026-05-15' } });

    expect(invoiceDateInput).toHaveValue('2026-05-15');
  });

  it('should submit form and create invoice', async () => {
    const { useCreatePurchaseInvoice } = require('../../hooks/usePurchaseInvoices');
    const mockCreate = vi.fn().mockResolvedValue({ id: 'inv-1' });
    
    useCreatePurchaseInvoice.mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
    });

    const { useToast } = require('../ui/Toast');
    const mockToast = { success: vi.fn(), error: vi.fn() };
    useToast.mockReturnValue(mockToast);

    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /Créer la facture/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should validate required fields', async () => {
    const { useToast } = require('../ui/Toast');
    const mockToast = { success: vi.fn(), error: vi.fn() };
    useToast.mockReturnValue(mockToast);

    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const invoiceDateInput = screen.getByLabelText(/Date facture/i);
    fireEvent.change(invoiceDateInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /Créer la facture/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Validation',
        expect.stringContaining('date de facture est obligatoire')
      );
    });
  });

  it('should validate negative amounts', async () => {
    const { useToast } = require('../ui/Toast');
    const mockToast = { success: vi.fn(), error: vi.fn() };
    useToast.mockReturnValue(mockToast);

    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const subtotalInput = screen.getByLabelText(/Sous-total HT/i);
    fireEvent.change(subtotalInput, { target: { value: '-100' } });

    const submitButton = screen.getByRole('button', { name: /Créer la facture/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Validation',
        expect.stringContaining('ne peut pas être négatif')
      );
    });
  });

  it('should validate due date after invoice date', async () => {
    const { useToast } = require('../ui/Toast');
    const mockToast = { success: vi.fn(), error: vi.fn() };
    useToast.mockReturnValue(mockToast);

    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const invoiceDateInput = screen.getByLabelText(/Date facture/i);
    const dueDateInput = screen.getByLabelText(/Échéance/i);

    fireEvent.change(invoiceDateInput, { target: { value: '2026-05-15' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-05-10' } });

    const submitButton = screen.getByRole('button', { name: /Créer la facture/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Validation',
        expect.stringContaining('postérieure à la date de facture')
      );
    });
  });

  it('should open OCR modal', () => {
    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const ocrButton = screen.getByRole('button', { name: /Import OCR/i });
    fireEvent.click(ocrButton);

    expect(screen.getByText('OCR Modal')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const { useCreatePurchaseInvoice } = require('../../hooks/usePurchaseInvoices');
    const mockCreate = vi.fn().mockRejectedValue({
      response: { data: { message: 'API Error' } },
    });
    
    useCreatePurchaseInvoice.mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
    });

    const { useApiError } = require('../ui/ConfirmModal');
    const mockHandleError = vi.fn();
    useApiError.mockReturnValue({ handleError: mockHandleError });

    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /Créer la facture/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalled();
    });
  });

  it('should display loading state during submission', async () => {
    const { useCreatePurchaseInvoice } = require('../../hooks/usePurchaseInvoices');
    useCreatePurchaseInvoice.mockReturnValue({
      mutateAsync: vi.fn(() => new Promise(() => {})),
      isPending: true,
    });

    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /Création.../i });
    expect(submitButton).toBeDisabled();
  });

  it('should select goods receipt', () => {
    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const grSelect = screen.getByRole('combobox');
    fireEvent.change(grSelect, { target: { value: 'gr-1' } });

    expect(grSelect).toHaveValue('gr-1');
  });

  it('should display auto-generated invoice number message', () => {
    render(
      <CreateInvoiceFromPOModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Numéro de facture auto-généré/i)).toBeInTheDocument();
    expect(screen.getByText(/FACT-2026-XXXX/i)).toBeInTheDocument();
  });
});
