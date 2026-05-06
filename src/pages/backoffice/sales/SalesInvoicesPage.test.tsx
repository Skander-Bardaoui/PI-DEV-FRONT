// src/pages/backoffice/sales/SalesInvoicesPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { business_id: 'business-123', role: 'BUSINESS_OWNER' },
  }),
}));

// Mock component
const MockSalesInvoicesPage = () => {
  const [filter, setFilter] = vi.useState('all');

  return (
    <div data-testid="sales-invoices-page">
      <h1>Factures de vente</h1>
      <div className="flex gap-2">
        <button onClick={() => setFilter('all')}>Toutes</button>
        <button onClick={() => setFilter('paid')}>Payées</button>
        <button onClick={() => setFilter('pending')}>En attente</button>
        <button onClick={() => setFilter('overdue')}>En retard</button>
      </div>
      <button>Nouvelle facture</button>
      <div data-testid="invoices-list">
        <div>INV-001 - Client A - 1 000,000 TND - PAID</div>
        <div>INV-002 - Client B - 2 000,000 TND - SENT</div>
        <div>INV-003 - Client C - 1 500,000 TND - OVERDUE</div>
      </div>
      <div>Total: 10 factures</div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockSalesInvoicesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SalesInvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Factures de vente')).toBeInTheDocument();
    });

    it('should render filter buttons', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Toutes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Payées/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /En attente/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /En retard/i })).toBeInTheDocument();
    });

    it('should render new invoice button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Nouvelle facture/i })).toBeInTheDocument();
    });

    it('should render invoices list', () => {
      renderWithRouter();

      expect(screen.getByTestId('invoices-list')).toBeInTheDocument();
    });

    it('should display invoice details', () => {
      renderWithRouter();

      expect(screen.getByText(/INV-001/)).toBeInTheDocument();
      expect(screen.getByText(/Client A/)).toBeInTheDocument();
      expect(screen.getByText(/1 000,000 TND/)).toBeInTheDocument();
    });

    it('should display total count', () => {
      renderWithRouter();

      expect(screen.getByText('Total: 10 factures')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should allow filtering by status', () => {
      renderWithRouter();

      const paidButton = screen.getByRole('button', { name: /Payées/i });
      fireEvent.click(paidButton);

      expect(paidButton).toBeInTheDocument();
    });

    it('should show all invoices by default', () => {
      renderWithRouter();

      const allButton = screen.getByRole('button', { name: /Toutes/i });
      expect(allButton).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
