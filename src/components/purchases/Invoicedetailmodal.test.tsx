import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceDetailModal from './Invoicedetailmodal ';
import { usePDFExport } from '../../hooks/usePDFExport';
import { InvoiceStatus } from '../../types';

vi.mock('../../hooks/usePDFExport');
vi.mock('./CorrectInvoiceModal', () => ({
  default: ({ onClose }: any) => (
    <div data-testid="correct-invoice-modal">
      <button onClick={onClose}>Close Correct Modal</button>
    </div>
  ),
}));
vi.mock('../ui/ActionButton', () => ({
  ActionButton: ({ label, onClick }: any) => (
    <button onClick={onClick}>{label}</button>
  ),
  ActionSection: ({ title, children }: any) => (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

describe('InvoiceDetailModal', () => {
  const mockOnClose = vi.fn();
  const mockExportFacture = vi.fn();

  const mockInvoice = {
    id: 'inv-1',
    invoice_number_supplier: 'FACT-2026-001',
    status: InvoiceStatus.PENDING,
    invoice_date: '2026-05-01',
    due_date: '2026-05-31',
    supplier: {
      id: 'sup-1',
      name: 'Test Supplier',
    },
    supplier_po: {
      id: 'po-1',
      po_number: 'BC-2026-001',
    },
    subtotal_ht: 1000,
    tax_amount: 190,
    timbre_fiscal: 1,
    net_amount: 1191,
    paid_amount: 0,
    receipt_url: 'https://example.com/receipt.pdf',
    dispute_reason: null,
    created_at: '2026-05-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePDFExport as any).mockReturnValue({
      exportFacture: mockExportFacture,
      loading: false,
    });
  });

  it('should render invoice details', () => {
    render(
      <InvoiceDetailModal
        invoice={mockInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('FACT-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    expect(screen.getByText('BC: BC-2026-001')).toBeInTheDocument();
  });

  it('should display invoice status badge', () => {
    render(
      <InvoiceDetailModal
        invoice={mockInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  it('should show invoice amounts', () => {
    render(
      <InvoiceDetailModal
        invoice={mockInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('1,000.000 TND')).toBeInTheDocument(); // Subtotal HT
    expect(screen.getByText('190.000 TND')).toBeInTheDocument(); // TVA
    expect(screen.getByText('1.000 TND')).toBeInTheDocument(); // Timbre
    expect(screen.getByText('1,191.000 TND')).toBeInTheDocument(); // Net TTC
  });

  it('should display payment tracking', () => {
    render(
      <InvoiceDetailModal
        invoice={mockInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Suivi du paiement')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Montant payé')).toBeInTheDocument();
    expect(screen.getByText('Reste à payer')).toBeInTheDocument();
  });

  it('should show dispute reason when invoice is disputed', () => {
    const disputedInvoice = {
      ...mockInvoice,
      status: InvoiceStatus.DISPUTED,
      dispute_reason: 'Price mismatch detected',
    };

    render(
      <InvoiceDetailModal
        invoice={disputedInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Motif du litige')).toBeInTheDocument();
    expect(screen.getByText('Price mismatch detected')).toBeInTheDocument();
    expect(screen.getByText('Résoudre ce litige')).toBeInTheDocument();
  });

  it('should open correct invoice modal when resolve button is clicked', () => {
    const disputedInvoice = {
      ...mockInvoice,
      status: InvoiceStatus.DISPUTED,
      dispute_reason: 'Price mismatch',
    };

    render(
      <InvoiceDetailModal
        invoice={disputedInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    const resolveButton = screen.getByText('Résoudre ce litige');
    fireEvent.click(resolveButton);

    expect(screen.getByTestId('correct-invoice-modal')).toBeInTheDocument();
  });

  it('should call exportFacture when download PDF is clicked', () => {
    render(
      <InvoiceDetailModal
        invoice={mockInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    const downloadButton = screen.getByText('Télécharger PDF');
    fireEvent.click(downloadButton);

    expect(mockExportFacture).toHaveBeenCalledWith(mockInvoice);
  });

  it('should open receipt URL in new tab when view scan is clicked', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <InvoiceDetailModal
        invoice={mockInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    const viewScanButton = screen.getByText('Voir le scan');
    fireEvent.click(viewScanButton);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com/receipt.pdf',
      '_blank'
    );

    windowOpenSpy.mockRestore();
  });

  it('should close modal when close button is clicked', () => {
    render(
      <InvoiceDetailModal
        invoice={mockInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-x')
    );

    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show overdue status for overdue invoices', () => {
    const overdueInvoice = {
      ...mockInvoice,
      status: InvoiceStatus.OVERDUE,
    };

    render(
      <InvoiceDetailModal
        invoice={overdueInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('En retard')).toBeInTheDocument();
  });

  it('should calculate payment percentage correctly', () => {
    const partiallyPaidInvoice = {
      ...mockInvoice,
      paid_amount: 595.5, // 50% paid
    };

    render(
      <InvoiceDetailModal
        invoice={partiallyPaidInvoice}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should not show receipt button if no receipt URL', () => {
    const invoiceWithoutReceipt = {
      ...mockInvoice,
      receipt_url: null,
    };

    render(
      <InvoiceDetailModal
        invoice={invoiceWithoutReceipt}
        businessId="biz-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Voir le scan')).not.toBeInTheDocument();
  });
});
