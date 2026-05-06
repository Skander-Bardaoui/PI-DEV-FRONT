import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierScoreModal from './SupplierScoreModal';
import { useSupplierScore } from '../../hooks/useSupplierScoring';

vi.mock('../../hooks/useSupplierScoring');

describe('SupplierScoreModal', () => {
  const mockOnClose = vi.fn();

  const mockScore = {
    total_score: 85,
    grade: 'A' as const,
    computed_at: '2026-05-01T10:00:00Z',
    criteria: [
      {
        name: 'Delivery Performance',
        score: 90,
        weight: 30,
        label: 'Excellent',
        detail: 'On-time delivery rate: 95%',
      },
      {
        name: 'Price Competitiveness',
        score: 80,
        weight: 25,
        label: 'Good',
        detail: 'Prices within market range',
      },
      {
        name: 'Quality',
        score: 85,
        weight: 25,
        label: 'Very Good',
        detail: 'Low defect rate',
      },
      {
        name: 'Payment Terms',
        score: 75,
        weight: 20,
        label: 'Good',
        detail: 'Standard payment terms',
      },
    ],
    stats: {
      total_pos: 50,
      delivery_rate_pct: 95,
      on_time_rate_pct: 92,
      disputed_invoices: 2,
      total_invoiced: 50000,
      avg_payment_days: 28,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render score modal', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Score fournisseur')).toBeInTheDocument();
      expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (useSupplierScore as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Calcul du score...')).toBeInTheDocument();
  });

  it('should display total score and grade', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });
  });

  it('should display all criteria', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Delivery Performance')).toBeInTheDocument();
      expect(screen.getByText('Price Competitiveness')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
      expect(screen.getByText('Payment Terms')).toBeInTheDocument();
    });
  });

  it('should display criteria scores and weights', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Poids 30%')).toBeInTheDocument();
      expect(screen.getByText('90')).toBeInTheDocument();
    });
  });

  it('should display statistics', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Statistiques')).toBeInTheDocument();
      expect(screen.getByText('BCs total')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });

  it('should display computed date', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Calculé le/)).toBeInTheDocument();
    });
  });

  it('should show different grade colors', async () => {
    const bGradeScore = {
      ...mockScore,
      total_score: 75,
      grade: 'B' as const,
    };

    (useSupplierScore as any).mockReturnValue({
      data: bGradeScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('Bon')).toBeInTheDocument();
    });
  });

  it('should display progress bar', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar', { hidden: true });
      expect(progressBar).toBeInTheDocument();
    });
  });

  it('should show criteria details', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('On-time delivery rate: 95%')).toBeInTheDocument();
      expect(screen.getByText('Prices within market range')).toBeInTheDocument();
    });
  });

  it('should display total invoiced amount', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Total facturé')).toBeInTheDocument();
      expect(screen.getByText('50000 TND')).toBeInTheDocument();
    });
  });

  it('should show disputed invoices count', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Litiges')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should display average payment days', async () => {
    (useSupplierScore as any).mockReturnValue({
      data: mockScore,
      isLoading: false,
    });

    render(
      <SupplierScoreModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Délai paiement')).toBeInTheDocument();
      expect(screen.getByText('28j')).toBeInTheDocument();
    });
  });
});
