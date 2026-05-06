import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CorrectInvoiceModal from './CorrectInvoiceModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockInvoice = {
  id: 'inv-1',
  invoice_number_supplier: 'FACT-001',
  dispute_reason: 'Montant incorrect',
  subtotal_ht: '1000.000',
  tax_amount: '190.000',
  timbre_fiscal: '1.000',
  net_amount: '1191.000',
  paid_amount: '0.000',
  invoice_date: '2026-05-01',
  due_date: '2026-05-31',
  receipt_url: '',
};

vi.mock('../../hooks/usePurchaseInvoices', () => ({
  useUpdatePurchaseInvoice: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useResolveDispute: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useUpdatePayment: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
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

describe('CorrectInvoiceModal', () => {
  const mockOnClose = vi.fn();
  const businessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with header and dispute reason', () => {
    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Résoudre le litige')).toBeInTheDocument();
    expect(screen.getByText('FACT-001')).toBeInTheDocument();
    expect(screen.getByText('Montant incorrect')).toBeInTheDocument();
  });

  it('should display action options', () => {
    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Corriger les montants')).toBeInTheDocument();
    expect(screen.getByText('Résoudre sans modification')).toBeInTheDocument();
  });

  it('should navigate to correct amounts screen', () => {
    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const correctButton = screen.getByText('Corriger les montants');
    fireEvent.click(correctButton);

    expect(screen.getByText('Montants corrigés')).toBeInTheDocument();
    expect(screen.getByLabelText(/Sous-total HT/i)).toBeInTheDocument();
  });

  it('should navigate to mark paid screen for already paid invoice', () => {
    const paidInvoice = {
      ...mockInvoice,
      dispute_reason: 'Facture déjà réglée',
    };

    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={paidInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const markPaidButton = screen.getByText('Enregistrer le paiement existant');
    fireEvent.click(markPaidButton);

    expect(screen.getByText('Paiement déjà effectué')).toBeInTheDocument();
  });

  it('should navigate to resolve only screen', () => {
    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const resolveButton = screen.getByText('Résoudre sans modification');
    fireEvent.click(resolveButton);

    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  it('should handle amount corrections', async () => {
    const { useUpdatePurchaseInvoice, useResolveDispute } = require('../../hooks/usePurchaseInvoices');
    const mockUpdate = vi.fn().mockResolvedValue({});
    const mockResolve = vi.fn().mockResolvedValue({});
    
    useUpdatePurchaseInvoice.mockReturnValue({
      mutateAsync: mockUpdate,
      isPending: false,
    });
    useResolveDispute.mockReturnValue({
      mutateAsync: mockResolve,
      isPending: false,
    });

    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const correctButton = screen.getByText('Corriger les montants');
    fireEvent.click(correctButton);

    const subtotalInput = screen.getByLabelText(/Sous-total HT/i);
    fireEvent.change(subtotalInput, { target: { value: '1100' } });

    const submitButton = screen.getByRole('button', { name: /Corriger et résoudre/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResolve).toHaveBeenCalledWith('inv-1');
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should validate amounts before submission', async () => {
    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const correctButton = screen.getByText('Corriger les montants');
    fireEvent.click(correctButton);

    const subtotalInput = screen.getByLabelText(/Sous-total HT/i);
    fireEvent.change(subtotalInput, { target: { value: '-100' } });

    const submitButton = screen.getByRole('button', { name: /Corriger et résoudre/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/sous-total HT ne peut pas être négatif/i)).toBeInTheDocument();
    });
  });

  it('should handle mark as paid action', async () => {
    const { useResolveDispute, useUpdatePayment } = require('../../hooks/usePurchaseInvoices');
    const mockResolve = vi.fn().mockResolvedValue({});
    const mockUpdatePayment = vi.fn().mockResolvedValue({});
    
    useResolveDispute.mockReturnValue({
      mutateAsync: mockResolve,
      isPending: false,
    });
    useUpdatePayment.mockReturnValue({
      mutateAsync: mockUpdatePayment,
      isPending: false,
    });

    const paidInvoice = {
      ...mockInvoice,
      dispute_reason: 'Facture déjà réglée',
    };

    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={paidInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const markPaidButton = screen.getByText('Enregistrer le paiement existant');
    fireEvent.click(markPaidButton);

    const submitButton = screen.getByRole('button', { name: /Enregistrer et résoudre/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResolve).toHaveBeenCalledWith('inv-1');
      expect(mockUpdatePayment).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should validate paid amount', async () => {
    const paidInvoice = {
      ...mockInvoice,
      dispute_reason: 'Facture déjà réglée',
    };

    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={paidInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const markPaidButton = screen.getByText('Enregistrer le paiement existant');
    fireEvent.click(markPaidButton);

    const amountInput = screen.getByLabelText(/Montant à enregistrer/i);
    fireEvent.change(amountInput, { target: { value: '0' } });

    const submitButton = screen.getByRole('button', { name: /Enregistrer et résoudre/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/montant payé doit être supérieur à 0/i)).toBeInTheDocument();
    });
  });

  it('should handle resolve only action', async () => {
    const { useResolveDispute } = require('../../hooks/usePurchaseInvoices');
    const mockResolve = vi.fn().mockResolvedValue({});
    
    useResolveDispute.mockReturnValue({
      mutateAsync: mockResolve,
      isPending: false,
    });

    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const resolveButton = screen.getByText('Résoudre sans modification');
    fireEvent.click(resolveButton);

    const confirmButton = screen.getByRole('button', { name: /Confirmer la résolution/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockResolve).toHaveBeenCalledWith('inv-1');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should allow navigation back from correction screen', () => {
    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const correctButton = screen.getByText('Corriger les montants');
    fireEvent.click(correctButton);

    const backButton = screen.getByRole('button', { name: /Retour/i });
    fireEvent.click(backButton);

    expect(screen.getByText('Comment voulez-vous résoudre ce litige ?')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display error message on API failure', async () => {
    const { useResolveDispute } = require('../../hooks/usePurchaseInvoices');
    const mockResolve = vi.fn().mockRejectedValue({
      response: { data: { message: 'API Error' } },
    });
    
    useResolveDispute.mockReturnValue({
      mutateAsync: mockResolve,
      isPending: false,
    });

    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={mockInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const resolveButton = screen.getByText('Résoudre sans modification');
    fireEvent.click(resolveButton);

    const confirmButton = screen.getByRole('button', { name: /Confirmer la résolution/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  it('should handle different dispute types correctly', () => {
    const doubleInvoice = {
      ...mockInvoice,
      dispute_reason: 'Double facturation',
    };

    render(
      <CorrectInvoiceModal
        businessId={businessId}
        invoice={doubleInvoice as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Double facturation')).toBeInTheDocument();
  });
});
