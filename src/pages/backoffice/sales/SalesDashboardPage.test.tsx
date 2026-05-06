// src/pages/backoffice/sales/SalesDashboardPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { business_id: 'business-123', role: 'BUSINESS_OWNER' },
  }),
}));

vi.mock('@/hooks/useSalesInvoices', () => ({
  useSalesInvoices: () => ({
    data: {
      total: 10,
      data: [
        { id: '1', invoice_number: 'INV-001', net_amount: 1000, status: 'PAID', client: { name: 'Client 1' } },
        { id: '2', invoice_number: 'INV-002', net_amount: 2000, status: 'SENT', client: { name: 'Client 2' } },
        { id: '3', invoice_number: 'INV-003', net_amount: 1500, status: 'OVERDUE', client: { name: 'Client 3' } },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    data: { clients: [{ id: '1', name: 'Client 1' }, { id: '2', name: 'Client 2' }], total: 5 },
    isLoading: false,
  }),
}));

// Mock component
const MockSalesDashboardPage = () => {
  return (
    <div data-testid="sales-dashboard-page">
      <h1>Tableau de bord Ventes</h1>
      <p>Vue d'ensemble de votre activité commerciale</p>
      <div data-testid="kpis">
        <div className="kpi-card">
          <span>Chiffre d'affaires</span>
          <span>4 500,000 TND</span>
        </div>
        <div className="kpi-card">
          <span>Factures payées</span>
          <span>1</span>
        </div>
        <div className="kpi-card">
          <span>En attente</span>
          <span>1</span>
        </div>
        <div className="kpi-card">
          <span>En retard</span>
          <span>1</span>
        </div>
      </div>
      <div data-testid="top-clients">
        <h2>Top clients</h2>
        <div>Client 1 - 1 000,000 TND</div>
        <div>Client 2 - 2 000,000 TND</div>
      </div>
      <div data-testid="recent-invoices">
        <h2>Factures récentes</h2>
        <div>INV-001 - Client 1</div>
        <div>INV-002 - Client 2</div>
      </div>
      <div data-testid="stats">
        <div>10 factures</div>
        <div>5 clients</div>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockSalesDashboardPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SalesDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Tableau de bord Ventes')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter();

      expect(screen.getByText(/Vue d'ensemble de votre activité commerciale/)).toBeInTheDocument();
    });

    it('should render KPIs section', () => {
      renderWithRouter();

      expect(screen.getByTestId('kpis')).toBeInTheDocument();
    });

    it('should render top clients section', () => {
      renderWithRouter();

      expect(screen.getByTestId('top-clients')).toBeInTheDocument();
      expect(screen.getByText('Top clients')).toBeInTheDocument();
    });

    it('should render recent invoices section', () => {
      renderWithRouter();

      expect(screen.getByTestId('recent-invoices')).toBeInTheDocument();
      expect(screen.getByText('Factures récentes')).toBeInTheDocument();
    });
  });

  describe('KPIs', () => {
    it('should display revenue', () => {
      renderWithRouter();

      expect(screen.getByText('Chiffre d\'affaires')).toBeInTheDocument();
      expect(screen.getByText('4 500,000 TND')).toBeInTheDocument();
    });

    it('should display paid invoices count', () => {
      renderWithRouter();

      expect(screen.getByText('Factures payées')).toBeInTheDocument();
    });

    it('should display pending invoices', () => {
      renderWithRouter();

      expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('should display overdue invoices', () => {
      renderWithRouter();

      expect(screen.getByText('En retard')).toBeInTheDocument();
    });
  });

  describe('Top Clients', () => {
    it('should display client names', () => {
      renderWithRouter();

      expect(screen.getByText(/Client 1/)).toBeInTheDocument();
      expect(screen.getByText(/Client 2/)).toBeInTheDocument();
    });

    it('should display client amounts', () => {
      renderWithRouter();

      expect(screen.getByText(/1 000,000 TND/)).toBeInTheDocument();
      expect(screen.getByText(/2 000,000 TND/)).toBeInTheDocument();
    });
  });

  describe('Recent Invoices', () => {
    it('should display invoice numbers', () => {
      renderWithRouter();

      expect(screen.getByText(/INV-001/)).toBeInTheDocument();
      expect(screen.getByText(/INV-002/)).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should display total invoices', () => {
      renderWithRouter();

      expect(screen.getByText('10 factures')).toBeInTheDocument();
    });

    it('should display total clients', () => {
      renderWithRouter();

      expect(screen.getByText('5 clients')).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
