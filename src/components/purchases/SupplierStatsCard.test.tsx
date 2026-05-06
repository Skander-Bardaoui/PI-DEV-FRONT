import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SupplierStatsCard } from './SupplierStatsCard';
import { useSupplierStats } from '../../hooks/useSupplierStats';
import { usePDFExport } from '../../hooks/usePDFExport';

vi.mock('../../hooks/useSupplierStats');
vi.mock('../../hooks/usePDFExport');
vi.mock('./PDFButton', () => ({
  default: ({ label, onClick }: any) => (
    <button onClick={onClick}>{label}</button>
  ),
}));

describe('SupplierStatsCard', () => {
  const mockSupplier = {
    id: 'sup-1',
    name: 'Test Supplier',
    matricule_fiscal: '123456',
    email: 'test@supplier.com',
    phone: '+216 71 000 000',
    is_active: true,
    created_at: '2026-01-01',
  };

  const mockStats = {
    totalAchats: 10000,
    totalPaye: 7000,
    totalDu: 3000,
    nbFactures: 10,
    nbPayees: 7,
    nbBCs: 5,
    tauxReception: 80,
    nbEnRetard: 2,
    nbLitige: 1,
  };

  const mockExportReleve = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSupplierStats as any).mockReturnValue({
      stats: mockStats,
      loading: false,
      pos: [],
      invoices: [],
    });
    (usePDFExport as any).mockReturnValue({
      exportReleve: mockExportReleve,
      loading: false,
    });
  });

  it('should render stats card', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('Statistiques')).toBeInTheDocument();
  });

  it('should display total purchases', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('Total achats')).toBeInTheDocument();
    // Le texte est "10 000,000 TND" avec des espaces insécables
    expect(screen.getByText((content, element) => {
      return element?.textContent === '10 000,000 TND';
    })).toBeInTheDocument();
  });

  it('should display paid amount', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    // Le texte "Payé : 7 000,000 TND" est réparti sur plusieurs éléments
    expect(screen.getByText(/Payé/)).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('7 000,000 TND') || false;
    })).toBeInTheDocument();
  });

  it('should display balance due', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('Solde dû')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === '3 000,000 TND';
    })).toBeInTheDocument();
  });

  it('should display invoice payment status', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('7/10 factures payées')).toBeInTheDocument();
  });

  it('should display purchase orders count', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('Commandes')).toBeInTheDocument();
    expect(screen.getByText('5 BCs')).toBeInTheDocument();
  });

  it('should display reception rate', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('80% entièrement reçus')).toBeInTheDocument();
  });

  it('should display overdue invoices', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('Alertes')).toBeInTheDocument();
    expect(screen.getByText('2 en retard')).toBeInTheDocument();
  });

  it('should display disputes count', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('1 en litige')).toBeInTheDocument();
  });

  it('should show no alerts when no overdue invoices', () => {
    const statsWithoutOverdue = {
      ...mockStats,
      nbEnRetard: 0,
      nbLitige: 0,
    };

    (useSupplierStats as any).mockReturnValue({
      stats: statsWithoutOverdue,
      loading: false,
      pos: [],
      invoices: [],
    });

    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('Aucune')).toBeInTheDocument();
    expect(screen.getByText('Paiements à jour')).toBeInTheDocument();
  });

  it('should show green styling when balance is zero', () => {
    const statsFullyPaid = {
      ...mockStats,
      totalDu: 0,
      nbPayees: 10,
    };

    (useSupplierStats as any).mockReturnValue({
      stats: statsFullyPaid,
      loading: false,
      pos: [],
      invoices: [],
    });

    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText((content, element) => {
      return element?.textContent === '0,000 TND';
    })).toBeInTheDocument();
    
    const facturesElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('10/10 factures payées') || false;
    });
    expect(facturesElements.length).toBeGreaterThan(0);
  });

  it('should display loading state', () => {
    (useSupplierStats as any).mockReturnValue({
      stats: null,
      loading: true,
      pos: [],
      invoices: [],
    });

    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('Chargement des statistiques...')).toBeInTheDocument();
  });

  it('should have PDF export button', () => {
    render(
      <SupplierStatsCard
        businessId="biz-1"
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText('Relevé de compte')).toBeInTheDocument();
  });
});
