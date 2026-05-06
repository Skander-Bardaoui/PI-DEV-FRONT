import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisputeModal from './Disputemodal ';

const mockInvoice = {
  id: 'inv-1',
  invoice_number_supplier: 'FACT-001',
  net_amount: '1191.000',
  invoice_date: '2026-05-01',
  supplier: {
    name: 'Fournisseur Test',
  },
};

vi.mock('../../types', () => ({
  formatAmount: vi.fn((val) => `${Number(val).toFixed(3)} TND`),
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString('fr-FR')),
}));

describe('DisputeModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with invoice information', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Signaler un litige')).toBeInTheDocument();
    expect(screen.getByText('FACT-001')).toBeInTheDocument();
    expect(screen.getByText('Fournisseur Test')).toBeInTheDocument();
  });

  it('should display all dispute reason options', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Montant incorrect')).toBeInTheDocument();
    expect(screen.getByText('Produit non conforme')).toBeInTheDocument();
    expect(screen.getByText('Facture déjà réglée')).toBeInTheDocument();
    expect(screen.getByText('Double facturation')).toBeInTheDocument();
    expect(screen.getByText('Prestation non réalisée')).toBeInTheDocument();
    expect(screen.getByText('Autre')).toBeInTheDocument();
  });

  it('should select a dispute reason', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const reasonOption = screen.getByLabelText(/Montant incorrect/i);
    fireEvent.click(reasonOption);

    expect(reasonOption).toBeChecked();
  });

  it('should show custom reason textarea when "Autre" is selected', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const autreOption = screen.getByLabelText(/Autre/i);
    fireEvent.click(autreOption);

    expect(screen.getByPlaceholderText(/Décrivez en détail le motif/i)).toBeInTheDocument();
  });

  it('should validate custom reason length', async () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const autreOption = screen.getByLabelText(/Autre/i);
    fireEvent.click(autreOption);

    const textarea = screen.getByPlaceholderText(/Décrivez en détail le motif/i);
    fireEvent.change(textarea, { target: { value: 'Court' } });

    const submitButton = screen.getByRole('button', { name: /Confirmer le litige/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/minimum 10 caractères/i)).toBeInTheDocument();
    });
  });

  it('should submit with standard reason', async () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const reasonOption = screen.getByLabelText(/Montant incorrect/i);
    fireEvent.click(reasonOption);

    const submitButton = screen.getByRole('button', { name: /Confirmer le litige/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('Montant incorrect');
    });
  });

  it('should submit with custom reason', async () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const autreOption = screen.getByLabelText(/Autre/i);
    fireEvent.click(autreOption);

    const textarea = screen.getByPlaceholderText(/Décrivez en détail le motif/i);
    fireEvent.change(textarea, { target: { value: 'Motif personnalisé détaillé' } });

    const submitButton = screen.getByRole('button', { name: /Confirmer le litige/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('Autre : Motif personnalisé détaillé');
    });
  });

  it('should show validation error when no reason is selected', async () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Confirmer le litige/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Veuillez sélectionner un motif/i)).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when cancel button is clicked', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display character count for custom reason', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const autreOption = screen.getByLabelText(/Autre/i);
    fireEvent.click(autreOption);

    const textarea = screen.getByPlaceholderText(/Décrivez en détail le motif/i);
    fireEvent.change(textarea, { target: { value: 'Test' } });

    expect(screen.getByText(/4 \/ 10 caractères minimum/i)).toBeInTheDocument();
  });

  it('should clear custom reason when switching from "Autre" to another option', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const autreOption = screen.getByLabelText(/Autre/i);
    fireEvent.click(autreOption);

    const textarea = screen.getByPlaceholderText(/Décrivez en détail le motif/i);
    fireEvent.change(textarea, { target: { value: 'Test custom reason' } });

    const montantOption = screen.getByLabelText(/Montant incorrect/i);
    fireEvent.click(montantOption);

    expect(screen.queryByPlaceholderText(/Décrivez en détail le motif/i)).not.toBeInTheDocument();
  });

  it('should display important information message', () => {
    render(
      <DisputeModal
        invoice={mockInvoice as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/Cette facture sera marquée comme "En litige"/i)).toBeInTheDocument();
  });
});
