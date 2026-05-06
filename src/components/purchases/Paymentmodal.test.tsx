import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentModal } from './Paymentmodal';
import { InvoiceStatus } from '../../types';

describe('PaymentModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const mockInvoice = {
    id: 'inv-1',
    invoice_number_supplier: 'FACT-2026-001',
    status: InvoiceStatus.PENDING,
    net_amount: 1000,
    paid_amount: 0,
    invoice_date: '2026-05-01',
    due_date: '2026-05-31',
    supplier: { id: 'sup-1', name: 'Test Supplier' },
    subtotal_ht: 840.336,
    tax_amount: 159.664,
    timbre_fiscal: 1,
    created_at: '2026-05-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render payment modal', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Enregistrer un paiement')).toBeInTheDocument();
    expect(screen.getByText('FACT-2026-001')).toBeInTheDocument();
  });

  it('should display invoice amounts', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Net TTC')).toBeInTheDocument();
    expect(screen.getByText('1,000.000 TND')).toBeInTheDocument();
    expect(screen.getByText('Déjà payé')).toBeInTheDocument();
    expect(screen.getByText('Reste à payer')).toBeInTheDocument();
  });

  it('should calculate remaining amount correctly', () => {
    const partiallyPaidInvoice = {
      ...mockInvoice,
      paid_amount: 400,
    };

    render(
      <PaymentModal
        invoice={partiallyPaidInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('600.000 TND')).toBeInTheDocument(); // Remaining
  });

  it('should allow entering payment amount', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const amountInput = screen.getByRole('spinbutton');
    fireEvent.change(amountInput, { target: { value: '500' } });

    expect(amountInput).toHaveValue(500);
  });

  it('should show quick payment buttons', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Solde total')).toBeInTheDocument();
  });

  it('should set 50% when 50% button is clicked', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const fiftyPercentButton = screen.getByText('50%');
    fireEvent.click(fiftyPercentButton);

    const amountInput = screen.getByRole('spinbutton');
    expect(amountInput).toHaveValue(500);
  });

  it('should set full amount when "Solde total" button is clicked', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const fullAmountButton = screen.getByText('Solde total');
    fireEvent.click(fullAmountButton);

    const amountInput = screen.getByRole('spinbutton');
    expect(amountInput).toHaveValue(1000);
  });

  it('should show remaining after payment', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const amountInput = screen.getByRole('spinbutton');
    fireEvent.change(amountInput, { target: { value: '600' } });

    expect(screen.getByText('Reste après ce paiement')).toBeInTheDocument();
    expect(screen.getByText('400.000 TND')).toBeInTheDocument();
  });

  it('should show full payment indicator', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const amountInput = screen.getByRole('spinbutton');
    fireEvent.change(amountInput, { target: { value: '1000' } });

    expect(screen.getByText('✓ Facture entièrement payée')).toBeInTheDocument();
  });

  it('should submit payment', async () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const amountInput = screen.getByRole('spinbutton');
    fireEvent.change(amountInput, { target: { value: '500' } });

    const submitButton = screen.getByText('Valider le paiement');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(500);
    });
  });

  it('should close modal on cancel', () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show validation error for invalid amount', async () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const amountInput = screen.getByRole('spinbutton');
    fireEvent.change(amountInput, { target: { value: '0' } });

    const submitButton = screen.getByText('Valider le paiement');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erreurs de validation')).toBeInTheDocument();
    });
  });

  it('should show validation error for amount exceeding remaining', async () => {
    render(
      <PaymentModal
        invoice={mockInvoice}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const amountInput = screen.getByRole('spinbutton');
    fireEvent.change(amountInput, { target: { value: '1500' } });

    const submitButton = screen.getByText('Valider le paiement');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erreurs de validation')).toBeInTheDocument();
    });
  });
});
