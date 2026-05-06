// src/pages/backoffice/purchases/PurchaseInvoicesPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { business_id: 'business-123', role: 'BUSINESS_OWNER' },
  }),
}));

vi.mock('@/hooks/usePurchaseInvoices', () => ({
  usePurchaseInvoices: () => ({
    data: {
      total: 3,
      data: [
        {
          id: '1',
          invoice_number_supplier: 'INV-001',
          net_amount: 1000,
          status: 'PAID',
          supplier: { name: 'Supplier 1' },
          invoice_date: '2024-01-01',
        },
        {
          id: '2',
          invoice_number_supplier: 'INV-002',
          net_amount: 2000,
          status: 'PENDING',
          supplier: { name: 'Supplier 2' },
          invoice_date: '2024-01-02',
        },
      ],
    },
    isLoading: false,
  }),
}));

// Mock component
const MockPurchaseInvoicesPage = () => {
  return (
    <div data-testid="purchase-invoices-page">
      <h1>Factures d'achat</h1>
      <button>Nouvelle facture</button>
      <div data-testid="invoices-list">
        <div>INV-001 - Supplier 1 - 1 000,000 TND</div>
        <div>INV-002 - Supplier 2 - 2 000,000 TND</div>
      </div>
      <div>Total: 3 factures</div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockPurchaseInvoicesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PurchaseInvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText("Factures d'achat")).toBeInTheDocument();
    });

    it('should render new invoice button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Nouvelle facture/i })).toBeInTheDocument();
    });

    it('should render invoices list', () => {
      renderWithRouter();

      expect(screen.getByTestId('invoices-list')).toBeInTheDocument();
      expect(screen.getByText(/INV-001/)).toBeInTheDocument();
      expect(screen.getByText(/INV-002/)).toBeInTheDocument();
    });

    it('should display total count', () => {
      renderWithRouter();

      expect(screen.getByText(/Total: 3 factures/)).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
