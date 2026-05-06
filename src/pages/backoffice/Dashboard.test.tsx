// src/pages/backoffice/Dashboard.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { business_id: 'business-123', id: 'user-1' },
  }),
}));

vi.mock('../../hooks/useSalesInvoices', () => ({
  useSalesInvoices: () => ({
    data: {
      data: [
        { id: '1', net_amount: 1000, status: 'PAID' },
        { id: '2', net_amount: 2000, status: 'SENT' },
        { id: '3', net_amount: 1500, status: 'OVERDUE' },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('../../hooks/usePurchaseInvoices', () => ({
  usePurchaseInvoices: () => ({
    data: {
      data: [
        { id: '1', net_amount: 500, status: 'PENDING' },
        { id: '2', net_amount: 800, status: 'PAID' },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useClients', () => ({
  useClients: () => ({
    data: {
      clients: [
        { id: '1', name: 'Client 1' },
        { id: '2', name: 'Client 2' },
        { id: '3', name: 'Client 3' },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useSuppliers', () => ({
  useSuppliers: () => ({
    data: {
      data: [
        { id: '1', name: 'Supplier 1', is_active: true },
        { id: '2', name: 'Supplier 2', is_active: true },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('../../api/stock-dashboard.api', () => ({
  stockDashboardApi: {
    getProductsDashboard: vi.fn(() =>
      Promise.resolve({
        summary: {
          total_products: 50,
          total_categories: 10,
          total_value: 25000,
          low_stock_count: 5,
        },
      })
    ),
  },
}));

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render page title', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
        expect(screen.getByText("Vue d'ensemble de votre activité")).toBeInTheDocument();
      });
    });

    it('should render all quick stats cards', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Ventes')).toBeInTheDocument();
        expect(screen.getByText('Achats')).toBeInTheDocument();
        expect(screen.getByText('Clients')).toBeInTheDocument();
        expect(screen.getByText('Bénéfice')).toBeInTheDocument();
      });
    });

    it('should render all module cards', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Module commercial')).toBeInTheDocument();
        expect(screen.getByText('Gestion fournisseurs')).toBeInTheDocument();
        expect(screen.getByText('Gestion inventaire')).toBeInTheDocument();
        expect(screen.getByText('Gestion financière')).toBeInTheDocument();
        expect(screen.getByText('Gestion des tâches et équipe')).toBeInTheDocument();
      });
    });
  });

  // ── Quick Stats Tests ───────────────────────────────────────────────────────

  describe('Quick Stats', () => {
    it('should display total sales revenue', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/4 500,000/)).toBeInTheDocument(); // 1000 + 2000 + 1500
      });
    });

    it('should display total purchase expenses', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/1 300,000/)).toBeInTheDocument(); // 500 + 800
      });
    });

    it('should display client count', async () => {
      renderWithRouter();

      await waitFor(() => {
        const clientCards = screen.getAllByText('3');
        expect(clientCards.length).toBeGreaterThan(0);
      });
    });

    it('should calculate and display profit', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/3 200,000/)).toBeInTheDocument(); // 4500 - 1300
      });
    });

    it('should display invoice counts', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('3 factures')).toBeInTheDocument(); // Sales invoices
        expect(screen.getByText('2 factures')).toBeInTheDocument(); // Purchase invoices
      });
    });
  });

  // ── Sales Module Tests ──────────────────────────────────────────────────────

  describe('Sales Module', () => {
    it('should display sales statistics', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('1 payées')).toBeInTheDocument();
        expect(screen.getByText('1 en attente')).toBeInTheDocument();
      });
    });

    it('should navigate to sales dashboard when clicked', async () => {
      renderWithRouter();

      await waitFor(() => {
        const salesCard = screen.getByText('Module commercial').closest('div');
        if (salesCard) fireEvent.click(salesCard);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/sales/dashboard');
    });

    it('should display sales revenue in thousands', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('4k')).toBeInTheDocument(); // 4500 / 1000 = 4.5 -> 4k
      });
    });
  });

  // ── Purchases Module Tests ──────────────────────────────────────────────────

  describe('Purchases Module', () => {
    it('should display supplier count', async () => {
      renderWithRouter();

      await waitFor(() => {
        const supplierElements = screen.getAllByText('2');
        expect(supplierElements.length).toBeGreaterThan(0);
      });
    });

    it('should navigate to purchases dashboard when clicked', async () => {
      renderWithRouter();

      await waitFor(() => {
        const purchasesCard = screen.getByText('Gestion fournisseurs').closest('div');
        if (purchasesCard) fireEvent.click(purchasesCard);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/purchases/dashboard');
    });

    it('should display active suppliers count', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('2 actifs')).toBeInTheDocument();
      });
    });

    it('should display expenses in thousands', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('1k')).toBeInTheDocument(); // 1300 / 1000 = 1.3 -> 1k
      });
    });
  });

  // ── Stock Module Tests ──────────────────────────────────────────────────────

  describe('Stock Module', () => {
    it('should display stock statistics', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument(); // Products
        expect(screen.getByText('10')).toBeInTheDocument(); // Categories
        expect(screen.getByText('25k')).toBeInTheDocument(); // Value
      });
    });

    it('should navigate to stock page when clicked', async () => {
      renderWithRouter();

      await waitFor(() => {
        const stockCard = screen.getByText('Gestion inventaire').closest('div');
        if (stockCard) fireEvent.click(stockCard);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/stock');
    });

    it('should display low stock alert', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('5 en stock faible')).toBeInTheDocument();
      });
    });
  });

  // ── Treasury Module Tests ───────────────────────────────────────────────────

  describe('Treasury Module', () => {
    it('should display treasury statistics', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // À recevoir (pending sales)
        expect(screen.getByText('1')).toBeInTheDocument(); // À payer (pending purchases)
        expect(screen.getByText('1')).toBeInTheDocument(); // En retard (overdue)
      });
    });

    it('should navigate to treasury accounts when clicked', async () => {
      renderWithRouter();

      await waitFor(() => {
        const treasuryCard = screen.getByText('Gestion financière').closest('div');
        if (treasuryCard) fireEvent.click(treasuryCard);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/treasury/accounts');
    });

    it('should display balance', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Solde: 3 200,000/)).toBeInTheDocument();
      });
    });
  });

  // ── Collaboration Module Tests ──────────────────────────────────────────────

  describe('Collaboration Module', () => {
    it('should render collaboration card', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Collaboration')).toBeInTheDocument();
        expect(screen.getByText('Gestion des tâches et équipe')).toBeInTheDocument();
      });
    });

    it('should navigate to collaboration page when clicked', async () => {
      renderWithRouter();

      await waitFor(() => {
        const collabCard = screen.getByText('Gestion des tâches et équipe').closest('div');
        if (collabCard) fireEvent.click(collabCard);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/collaboration');
    });

    it('should display placeholder values for tasks', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tâches actives')).toBeInTheDocument();
        expect(screen.getByText('Complétées')).toBeInTheDocument();
      });
    });
  });

  // ── Loading State Tests ─────────────────────────────────────────────────────

  describe('Loading State', () => {
    it('should show loading spinner when data is loading', () => {
      vi.mock('../../hooks/useSalesInvoices', () => ({
        useSalesInvoices: () => ({
          data: null,
          isLoading: true,
        }),
      }));

      renderWithRouter();

      expect(screen.getByText('Chargement du tableau de bord...')).toBeInTheDocument();
    });
  });

  // ── Styling Tests ───────────────────────────────────────────────────────────

  describe('Styling', () => {
    it('should have gradient backgrounds on module cards', async () => {
      renderWithRouter();

      await waitFor(() => {
        const salesCard = screen.getByText('Module commercial').closest('div');
        expect(salesCard).toHaveClass('bg-gradient-to-br');
      });
    });

    it('should have hover effects on cards', async () => {
      renderWithRouter();

      await waitFor(() => {
        const cards = screen.getAllByText(/Module|Gestion/);
        cards.forEach((card) => {
          const parentCard = card.closest('div');
          expect(parentCard).toHaveClass('hover:shadow-lg');
        });
      });
    });

    it('should have cursor pointer on clickable cards', async () => {
      renderWithRouter();

      await waitFor(() => {
        const salesCard = screen.getByText('Module commercial').closest('div');
        expect(salesCard).toHaveClass('cursor-pointer');
      });
    });
  });

  // ── Responsive Layout Tests ─────────────────────────────────────────────────

  describe('Responsive Layout', () => {
    it('should have responsive grid for quick stats', async () => {
      const { container } = renderWithRouter();

      await waitFor(() => {
        const statsGrid = container.querySelector('.grid.sm\\:grid-cols-2.lg\\:grid-cols-4');
        expect(statsGrid).toBeInTheDocument();
      });
    });

    it('should have responsive grid for module cards', async () => {
      const { container } = renderWithRouter();

      await waitFor(() => {
        const moduleGrid = container.querySelector('.grid.lg\\:grid-cols-2');
        expect(moduleGrid).toBeInTheDocument();
      });
    });
  });
});
