import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThreeWayMatchModal from './ThreeWayMatchModal';
import { useInvoiceMatch, useApplyMatch } from '../../hooks/useThreeWayMatching';

vi.mock('../../hooks/useThreeWayMatching');

describe('ThreeWayMatchModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  const mockMatchResult = {
    status: 'MATCHED' as const,
    invoice_number: 'FACT-2026-001',
    po_number: 'BC-2026-001',
    supplier_name: 'Test Supplier',
    gr_numbers: ['BR-001', 'BR-002'],
    po_total: 1000,
    received_total: 1000,
    invoiced_total: 1000,
    total_discrepancy: 0,
    discrepancy_pct: 0,
    line_discrepancies: [
      {
        description: 'Product A',
        po_quantity: 10,
        received_quantity: 10,
        po_unit_price: 100,
        po_line_total: 1000,
        received_total: 1000,
        discrepancy_amount: 0,
        status: 'OK' as const,
      },
    ],
    issues: [],
    recommendations: [],
    can_auto_approve: true,
    should_auto_dispute: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useInvoiceMatch as any).mockReturnValue({
      data: mockMatchResult,
      isLoading: false,
    });
    (useApplyMatch as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('should render three-way match modal', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Contrôle de Facture')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (useInvoiceMatch as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Analyse en cours...')).toBeInTheDocument();
  });

  it('should display match status', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Rapprochement validé')).toBeInTheDocument();
    });
  });

  it('should display invoice and PO references', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/FACT-2026-001/)).toBeInTheDocument();
      expect(screen.getByText(/BC-2026-001/)).toBeInTheDocument();
      expect(screen.getByText(/Test Supplier/)).toBeInTheDocument();
    });
  });

  it('should display totals comparison', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Montant BC')).toBeInTheDocument();
      expect(screen.getByText('Montant reçu')).toBeInTheDocument();
      expect(screen.getByText('Montant facturé')).toBeInTheDocument();
    });
  });

  it('should display line discrepancies', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Détail par ligne')).toBeInTheDocument();
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Conforme')).toBeInTheDocument();
    });
  });

  it('should show auto-approve button when can_auto_approve is true', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Approuver automatiquement')).toBeInTheDocument();
    });
  });

  it('should apply match when approve button is clicked', async () => {
    mockMutateAsync.mockResolvedValue({ can_auto_approve: true });

    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const approveButton = screen.getByText('Approuver automatiquement');
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('inv-1');
    });
  });

  it('should show mismatch status for discrepancies', async () => {
    const mismatchResult = {
      ...mockMatchResult,
      status: 'MISMATCH' as const,
      total_discrepancy: 100,
      discrepancy_pct: 10,
      can_auto_approve: false,
      should_auto_dispute: true,
    };

    (useInvoiceMatch as any).mockReturnValue({
      data: mismatchResult,
      isLoading: false,
    });

    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Écarts significatifs détectés')).toBeInTheDocument();
    });
  });

  it('should display issues when present', async () => {
    const resultWithIssues = {
      ...mockMatchResult,
      issues: ['Price mismatch on line 1', 'Quantity discrepancy on line 2'],
    };

    (useInvoiceMatch as any).mockReturnValue({
      data: resultWithIssues,
      isLoading: false,
    });

    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Problèmes détectés')).toBeInTheDocument();
      expect(screen.getByText(/Price mismatch on line 1/)).toBeInTheDocument();
    });
  });

  it('should display recommendations when present', async () => {
    const resultWithRecommendations = {
      ...mockMatchResult,
      recommendations: ['Contact supplier', 'Review pricing'],
    };

    (useInvoiceMatch as any).mockReturnValue({
      data: resultWithRecommendations,
      isLoading: false,
    });

    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Recommandations')).toBeInTheDocument();
      expect(screen.getByText(/Contact supplier/)).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const closeButton = screen.getByText('Fermer');
      fireEvent.click(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show auto-dispute button when should_auto_dispute is true', async () => {
    const disputeResult = {
      ...mockMatchResult,
      can_auto_approve: false,
      should_auto_dispute: true,
    };

    (useInvoiceMatch as any).mockReturnValue({
      data: disputeResult,
      isLoading: false,
    });

    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Mettre en litige automatiquement')).toBeInTheDocument();
    });
  });

  it('should display goods receipt numbers', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/BR-001, BR-002/)).toBeInTheDocument();
    });
  });

  it('should show success message after applying match', async () => {
    mockMutateAsync.mockResolvedValue({ can_auto_approve: true });

    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const approveButton = screen.getByText('Approuver automatiquement');
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Facture approuvée automatiquement/)
      ).toBeInTheDocument();
    });
  });

  it('should display line status badges', async () => {
    const resultWithMismatch = {
      ...mockMatchResult,
      line_discrepancies: [
        {
          ...mockMatchResult.line_discrepancies[0],
          status: 'PRICE_MISMATCH' as const,
        },
      ],
    };

    (useInvoiceMatch as any).mockReturnValue({
      data: resultWithMismatch,
      isLoading: false,
    });

    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Prix différent')).toBeInTheDocument();
    });
  });

  it('should show explanation of three-way matching', async () => {
    render(
      <ThreeWayMatchModal
        businessId="biz-1"
        invoiceId="inv-1"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Qu\'est-ce que le contrôle de facture ?')).toBeInTheDocument();
      expect(screen.getByText(/compare automatiquement 3 documents/)).toBeInTheDocument();
    });
  });
});
