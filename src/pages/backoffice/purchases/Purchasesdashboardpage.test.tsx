// src/pages/backoffice/purchases/Purchasesdashboardpage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PurchasesDashboardPage from './Purchasesdashboardpage';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { business_id: 'business-123', id: 'user-1' },
  }),
}));

vi.mock('@/hooks/useSuppliers', () => ({
  useSuppliers: () => ({
    data: {
      total: 5,
      data: [
        { id: '1', name: 'Supplier 1', is_active: true },
        { id: '2', name: 'Supplier 2', is_active: true },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useSupplierPOs', () => ({
  useSupplierPOs: () => ({
    data: {
      total: 10,
      data: [
        { id: '1', po_number: 'PO-001', status: 'DRAFT', supplier: { name: 'Supplier 1' } },
        { id: '2', po_number: 'PO-002', status: 'CONFIRMED', supplier: { name: 'Supplier 2' } },
        { id: '3', po_number: 'PO-003', status: 'SENT', supplier: { name: 'Supplier 1' } },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/usePurchaseInvoices', () => ({
  usePurchaseInvoices: () => ({
    data: {
      total: 15,
      data: [
        {
          id: '1',
          invoice_number_supplier: 'INV-001',
          net_amount: 1000,
          paid_amount: 1000,
          status: 'PAID',
          supplier_id: '1',
          supplier: { name: 'Supplier 1' },
          created_at: '2024-01-01',
        },
        {
          id: '2',
          invoice_number_supplier: 'INV-002',
          net_amount: 2000,
          paid_amount: 0,
          status: 'PENDING',
          supplier_id: '2',
          supplier: { name: 'Supplier 2' },
          created_at: '2024-01-02',
        },
        {
          id: '3',
          invoice_number_supplier: 'INV-003',
          net_amount: 1500,
          paid_amount: 0,
          status: 'OVERDUE',
          supplier_id: '1',
          supplier: { name: 'Supplier 1' },
          created_at: '2024-01-03',
        },
      ],
    },
    isLoading: false,
  }),
}));

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <PurchasesDashboardPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PurchasesDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Tableau de bord Achats')).toBeInTheDocument();
      expect(screen.getByText(/Vue d'ensemble du module/)).toBeInTheDocument();
    });

    it('should render all KPI cards', () => {
      renderWithRouter();

      expect(screen.getByText('Total achats')).toBeInTheDocument();
      expect(screen.getByText('Total dû')).toBeInTheDocument();
      expect(screen.getByText('Factures en retard')).toBeInTheDocument();
      expect(screen.getByText('BCs à réceptionner')).toBeInTheDocument();
    });

    it('should render top 5 suppliers section', () => {
      renderWithRouter();

      expect(screen.getByText('Top 5 fournisseurs')).toBeInTheDocument();
    });

    it('should render PO status section', () => {
      renderWithRouter();

      expect(screen.getByText('Statuts des BCs')).toBeInTheDocument();
    });

    it('should render pending receipts section', () => {
      renderWithRouter();

      expect(screen.getByText('BCs en attente de réception')).toBeInTheDocument();
    });

    it('should render recent invoices section', () => {
      renderWithRouter();

      expect(screen.getByText('Factures récentes')).toBeInTheDocument();
    });

    it('should render global summary', () => {
      renderWithRouter();

      expect(screen.getByText('Résumé global')).toBeInTheDocument();
    });
  });

  // ── KPIs Tests ──────────────────────────────────────────────────────────────

  describe('KPIs', () => {
    it('should display total purchases amount', () => {
      renderWithRouter();

      expect(screen.getByText(/4 500,000/)).toBeInTheDocument(); // 1000 + 2000 + 1500
      expect(screen.getByText('15 factures')).toBeInTheDocument();
    });

    it('should display total due amount', () => {
      renderWithRouter();

      expect(screen.getByText(/3 500,000/)).toBeInTheDocument(); // 4500 - 1000
    });

    it('should display overdue invoices count', () => {
      renderWithRouter();

      expect(screen.getByText('1')).toBeInTheDocument(); // 1 overdue invoice
    });

    it('should highlight overdue invoices in red', () => {
      const { container } = renderWithRouter();

      const overdueCard = container.querySelector('.bg-red-50');
      expect(overdueCard).toBeInTheDocument();
    });

    it('should display pending POs count', () => {
      renderWithRouter();

      expect(screen.getByText('1')).toBeInTheDocument(); // 1 confirmed PO
      expect(screen.getByText('2 en attente de confirmation')).toBeInTheDocument(); // 2 draft/sent
    });
  });

  // ── Top Suppliers Tests ─────────────────────────────────────────────────────

  describe('Top Suppliers', () => {
    it('should display supplier names', () => {
      renderWithRouter();

      expect(screen.getByText('Supplier 1')).toBeInTheDocument();
      expect(screen.getByText('Supplier 2')).toBeInTheDocument();
    });

    it('should display supplier totals', () => {
      renderWithRouter();

      expect(screen.getByText(/2 500,000/)).toBeInTheDocument(); // Supplier 1: 1000 + 1500
      expect(screen.getByText(/2 000,000/)).toBeInTheDocument(); // Supplier 2: 2000
    });

    it('should display invoice counts per supplier', () => {
      renderWithRouter();

      const invoiceCounts = screen.getAllByText(/facture\(s\)/);
      expect(invoiceCounts.length).toBeGreaterThan(0);
    });

    it('should show empty state when no suppliers', () => {
      vi.mock('@/hooks/usePurchaseInvoices', () => ({
        usePurchaseInvoices: () => ({
          data: { total: 0, data: [] },
          isLoading: false,
        }),
      }));

      renderWithRouter();

      expect(screen.getByText('Aucune donnée')).toBeInTheDocument();
    });
  });

  // ── PO Status Tests ─────────────────────────────────────────────────────────

  describe('PO Status', () => {
    it('should display PO status badges', () => {
      renderWithRouter();

      // Status labels should be visible
      const statusElements = screen.getAllByText(/DRAFT|SENT|CONFIRMED/);
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should show empty state when no POs', () => {
      vi.mock('@/hooks/useSupplierPOs', () => ({
        useSupplierPOs: () => ({
          data: { total: 0, data: [] },
          isLoading: false,
        }),
      }));

      renderWithRouter();

      expect(screen.getByText('Aucun bon de commande')).toBeInTheDocument();
    });
  });

  // ── Pending Receipts Tests ──────────────────────────────────────────────────

  describe('Pending Receipts', () => {
    it('should display pending PO numbers', () => {
      renderWithRouter();

      expect(screen.getByText('PO-002')).toBeInTheDocument();
    });

    it('should display supplier names for pending POs', () => {
      renderWithRouter();

      expect(screen.getByText('Supplier 2')).toBeInTheDocument();
    });

    it('should show empty state when no pending receipts', () => {
      vi.mock('@/hooks/useSupplierPOs', () => ({
        useSupplierPOs: () => ({
          data: {
            total: 1,
            data: [{ id: '1', po_number: 'PO-001', status: 'DRAFT', supplier: { name: 'Supplier 1' } }],
          },
          isLoading: false,
        }),
      }));

      renderWithRouter();

      expect(screen.getByText('Aucun BC en attente')).toBeInTheDocument();
    });
  });

  // ── Recent Invoices Tests ───────────────────────────────────────────────────

  describe('Recent Invoices', () => {
    it('should display recent invoice numbers', () => {
      renderWithRouter();

      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
      expect(screen.getByText('INV-003')).toBeInTheDocument();
    });

    it('should display invoice amounts', () => {
      renderWithRouter();

      expect(screen.getByText(/1 000,000/)).toBeInTheDocument();
      expect(screen.getByText(/2 000,000/)).toBeInTheDocument();
      expect(screen.getByText(/1 500,000/)).toBeInTheDocument();
    });

    it('should display invoice status badges', () => {
      renderWithRouter();

      // Status labels should be visible
      const statusElements = screen.getAllByText(/PAID|PENDING|OVERDUE/);
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should show empty state when no invoices', () => {
      vi.mock('@/hooks/usePurchaseInvoices', () => ({
        usePurchaseInvoices: () => ({
          data: { total: 0, data: [] },
          isLoading: false,
        }),
      }));

      renderWithRouter();

      expect(screen.getByText('Aucune facture')).toBeInTheDocument();
    });
  });

  // ── Global Summary Tests ────────────────────────────────────────────────────

  describe('Global Summary', () => {
    it('should display total suppliers count', () => {
      renderWithRouter();

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Fournisseurs actifs')).toBeInTheDocument();
    });

    it('should display total POs count', () => {
      renderWithRouter();

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Bons de commande')).toBeInTheDocument();
    });

    it('should display total invoices count', () => {
      renderWithRouter();

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Factures fournisseurs')).toBeInTheDocument();
    });

    it('should display paid invoices count', () => {
      renderWithRouter();

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Factures payées')).toBeInTheDocument();
    });
  });

  // ── Responsive Layout Tests ─────────────────────────────────────────────────

  describe('Responsive Layout', () => {
    it('should have responsive grid for KPIs', () => {
      const { container } = renderWithRouter();

      const kpiGrid = container.querySelector('.grid.grid-cols-2.lg\\:grid-cols-4');
      expect(kpiGrid).toBeInTheDocument();
    });

    it('should have responsive grid for sections', () => {
      const { container } = renderWithRouter();

      const sectionGrids = container.querySelectorAll('.grid.lg\\:grid-cols-2');
      expect(sectionGrids.length).toBeGreaterThan(0);
    });
  });

  // ── Accessibility Tests ─────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter();

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Tableau de bord Achats');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have descriptive text for all metrics', () => {
      renderWithRouter();

      expect(screen.getByText('Total achats')).toBeInTheDocument();
      expect(screen.getByText('Total dû')).toBeInTheDocument();
      expect(screen.getByText('Factures en retard')).toBeInTheDocument();
    });
  });
});
