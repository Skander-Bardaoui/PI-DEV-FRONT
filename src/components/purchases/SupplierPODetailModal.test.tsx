import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierPODetailModal from './SupplierPODetailModal';
import { useGoodsReceiptsByPO } from '../../hooks/useGoodsReceipts';
import { useSupplierPO, useSendSupplierPO, useConfirmSupplierPO, useCancelSupplierPO } from '../../hooks/useSupplierPOs';
import { usePurchaseInvoicesByPO } from '../../hooks/usePurchaseInvoices';
import { usePDFExport } from '../../hooks/usePDFExport';
import { useToast } from '../ui/Toast';
import { POStatus } from '../../types';

vi.mock('../../hooks/useGoodsReceipts', () => ({
  useGoodsReceiptsByPO: vi.fn(),
}));

vi.mock('../../hooks/useSupplierPOs', () => ({
  useSupplierPO: vi.fn(),
  useSendSupplierPO: vi.fn(),
  useConfirmSupplierPO: vi.fn(),
  useCancelSupplierPO: vi.fn(),
}));

vi.mock('../../hooks/usePurchaseInvoices', () => ({
  usePurchaseInvoicesByPO: vi.fn(),
}));

vi.mock('../../hooks/usePDFExport', () => ({
  usePDFExport: vi.fn(),
}));

vi.mock('../ui/Toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('./EditSupplierPOModal', () => ({
  default: () => <div>Edit Modal</div>,
}));

vi.mock('./GoodsReceiptModal', () => ({
  default: () => <div>Goods Receipt Modal</div>,
}));

vi.mock('./CreateInvoiceFromPOModal', () => ({
  default: () => <div>Create Invoice Modal</div>,
}));

vi.mock('./Invoicedetailmodal ', () => ({
  default: () => <div>Invoice Detail Modal</div>,
}));

describe('SupplierPODetailModal', () => {
  const mockOnClose = vi.fn();
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  };
  const mockExportBC = vi.fn();

  const mockPO = {
    id: 'po-1',
    po_number: 'BC-2024-001',
    status: POStatus.DRAFT,
    supplier: {
      id: 'supplier-1',
      name: 'Test Supplier',
      matricule_fiscal: '1234567/A/B/C/000',
      email: 'test@supplier.tn',
      phone: '+216 71 000 000',
      payment_terms: 30,
    },
    items: [
      {
        id: 'item-1',
        description: 'Product A',
        quantity_ordered: 10,
        quantity_received: 5,
        unit_price_ht: 100,
        tax_rate_value: 19,
        line_total_ht: 1000,
      },
    ],
    subtotal_ht: 1000,
    tax_amount: 190,
    timbre_fiscal: 1,
    net_amount: 1191,
    created_at: '2024-01-01',
    expected_delivery: '2024-01-15',
    notes: 'Test notes',
    business_id: 'business-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useToast as any).mockReturnValue(mockToast);
    (usePDFExport as any).mockReturnValue({
      exportBC: mockExportBC,
      loading: false,
    });

    (useSupplierPO as any).mockReturnValue({
      data: mockPO,
      isLoading: false,
    });

    (useGoodsReceiptsByPO as any).mockReturnValue({
      data: [],
    });

    (usePurchaseInvoicesByPO as any).mockReturnValue({
      data: [],
    });

    (useSendSupplierPO as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    (useConfirmSupplierPO as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    (useCancelSupplierPO as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('should render modal correctly', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('BC-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Test Supplier')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display supplier information', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    expect(screen.getByText('1234567/A/B/C/000')).toBeInTheDocument();
    expect(screen.getByText('test@supplier.tn')).toBeInTheDocument();
    expect(screen.getByText('+216 71 000 000')).toBeInTheDocument();
  });

  it('should display PO items', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('10.000')).toBeInTheDocument();
    expect(screen.getByText('5.000')).toBeInTheDocument();
  });

  it('should toggle items section', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const toggleButton = screen.getByText(/Lignes du bon de commande/);
    fireEvent.click(toggleButton);

    // Items should still be visible (default is expanded)
    expect(screen.getByText('Product A')).toBeInTheDocument();
  });

  it('should display totals correctly', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Sous-total HT')).toBeInTheDocument();
    expect(screen.getByText('TVA')).toBeInTheDocument();
    expect(screen.getByText('Timbre fiscal')).toBeInTheDocument();
    expect(screen.getByText('Net TTC')).toBeInTheDocument();
  });

  it('should display notes when present', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('should show edit button for draft PO', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Modifier')).toBeInTheDocument();
  });

  it('should show send button for draft PO', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Envoyer au fournisseur')).toBeInTheDocument();
  });

  it('should show confirm button for sent PO', () => {
    const sentPO = { ...mockPO, status: POStatus.SENT };

    render(
      <SupplierPODetailModal
        po={sentPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Confirmer')).toBeInTheDocument();
  });

  it('should show goods receipt button for confirmed PO', () => {
    const confirmedPO = { ...mockPO, status: POStatus.CONFIRMED };

    render(
      <SupplierPODetailModal
        po={confirmedPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Bon de réception')).toBeInTheDocument();
  });

  it('should handle PDF export', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const pdfButton = screen.getByText('Télécharger PDF');
    fireEvent.click(pdfButton);

    expect(mockExportBC).toHaveBeenCalledWith(mockPO);
  });

  it('should handle send PO action', async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    (useSendSupplierPO as any).mockReturnValue({
      mutateAsync: mockSend,
      isPending: false,
    });

    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const sendButton = screen.getByText('Envoyer au fournisseur');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith('po-1');
      expect(mockToast.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle confirm PO action', async () => {
    const mockConfirm = vi.fn().mockResolvedValue({});
    (useConfirmSupplierPO as any).mockReturnValue({
      mutateAsync: mockConfirm,
      isPending: false,
    });

    const sentPO = { ...mockPO, status: POStatus.SENT };

    render(
      <SupplierPODetailModal
        po={sentPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const confirmButton = screen.getByText('Confirmer');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('po-1');
      expect(mockToast.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle cancel PO action', async () => {
    const mockCancel = vi.fn().mockResolvedValue({});
    (useCancelSupplierPO as any).mockReturnValue({
      mutateAsync: mockCancel,
      isPending: false,
    });

    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText('Annuler le BC');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockCancel).toHaveBeenCalledWith('po-1');
      expect(mockToast.warning).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle send error', async () => {
    const mockSend = vi.fn().mockRejectedValue({
      response: { data: { message: 'Send failed' } },
    });
    (useSendSupplierPO as any).mockReturnValue({
      mutateAsync: mockSend,
      isPending: false,
    });

    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const sendButton = screen.getByText('Envoyer au fournisseur');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erreur', 'Send failed');
    });
  });

  it('should display goods receipts', () => {
    (useGoodsReceiptsByPO as any).mockReturnValue({
      data: [
        {
          id: 'gr-1',
          gr_number: 'GR-2024-001',
          receipt_date: '2024-01-10',
          items: [{ quantity_received: 5 }],
        },
      ],
    });

    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('GR-2024-001')).toBeInTheDocument();
  });

  it('should display existing invoices', () => {
    (usePurchaseInvoicesByPO as any).mockReturnValue({
      data: [
        {
          id: 'inv-1',
          invoice_number_supplier: 'INV-2024-001',
          invoice_date: '2024-01-15',
          net_amount: 1191,
          status: 'PENDING',
        },
      ],
    });

    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useSupplierPO as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should open edit modal', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const editButton = screen.getByText('Modifier');
    fireEvent.click(editButton);

    expect(screen.getByText('Edit Modal')).toBeInTheDocument();
  });

  it('should open goods receipt modal', () => {
    const confirmedPO = { ...mockPO, status: POStatus.CONFIRMED };

    render(
      <SupplierPODetailModal
        po={confirmedPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grButton = screen.getByText('Bon de réception');
    fireEvent.click(grButton);

    expect(screen.getByText('Goods Receipt Modal')).toBeInTheDocument();
  });

  it('should calculate reliquat correctly', () => {
    render(
      <SupplierPODetailModal
        po={mockPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    // Reliquat = 10 - 5 = 5
    expect(screen.getByText('5.000')).toBeInTheDocument();
  });

  it('should show complete status for fully received items', () => {
    const fullyReceivedPO = {
      ...mockPO,
      items: [
        {
          ...mockPO.items[0],
          quantity_ordered: 10,
          quantity_received: 10,
        },
      ],
    };

    render(
      <SupplierPODetailModal
        po={fullyReceivedPO}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});
