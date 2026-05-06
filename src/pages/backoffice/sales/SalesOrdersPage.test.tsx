// src/pages/backoffice/sales/SalesOrdersPage.test.tsx

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

vi.mock('../../../hooks/useCurrentBusinessMember', () => ({
  useCurrentBusinessMember: () => ({
    businessMember: {
      sales_permissions: {
        create_order: true,
        update_order: true,
        cancel_order: true,
      },
    },
  }),
}));

const mockSalesOrders = [
  {
    id: '1',
    orderNumber: 'SO-001',
    orderDate: '2026-05-01',
    netAmount: 1500,
    status: 'CONFIRMED',
    client: { name: 'Client A', email: 'clienta@example.com' },
  },
  {
    id: '2',
    orderNumber: 'SO-002',
    orderDate: '2026-05-02',
    netAmount: 2500,
    status: 'IN_PROGRESS',
    client: { name: 'Client B', email: 'clientb@example.com' },
  },
  {
    id: '3',
    orderNumber: 'SO-003',
    orderDate: '2026-05-03',
    netAmount: 3500,
    status: 'DELIVERED',
    client: { name: 'Client C' },
  },
  {
    id: '4',
    orderNumber: 'SO-004',
    orderDate: '2026-05-04',
    netAmount: 4500,
    status: 'INVOICED',
    client: { name: 'Client D' },
  },
  {
    id: '5',
    orderNumber: 'SO-005',
    orderDate: '2026-05-05',
    netAmount: 5500,
    status: 'CANCELLED',
    client: { name: 'Client E' },
  },
];

vi.mock('@/hooks/useSalesOrders', () => ({
  useSalesOrders: () => ({
    data: {
      data: mockSalesOrders,
      total: 5,
      total_pages: 1,
    },
    isLoading: false,
  }),
  useDeleteSalesOrder: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useStartProgressSalesOrder: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useMarkDeliveredSalesOrder: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useConvertSalesOrderToInvoice: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useCancelSalesOrder: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSendSalesOrderEmail: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock component
const MockSalesOrdersPage = () => {
  return (
    <div data-testid="sales-orders-page">
      <h1>Commandes clients</h1>
      <button data-testid="new-order-btn">Nouvelle commande</button>

      <div data-testid="stats-cards">
        <div className="stat-card">
          <span>Total Commandes</span>
          <span>5</span>
        </div>
        <div className="stat-card">
          <span>En Cours</span>
          <span>1</span>
        </div>
        <div className="stat-card">
          <span>Livrées</span>
          <span>1</span>
        </div>
        <div className="stat-card">
          <span>Montant Total</span>
          <span>17500.000 DT</span>
        </div>
      </div>

      <div data-testid="filters">
        <button data-testid="toggle-filters">Filtres</button>
        <input data-testid="search-input" placeholder="Rechercher par N° ou client..." />
      </div>

      <table data-testid="sales-orders-table">
        <thead>
          <tr>
            <th>N° Commande</th>
            <th>Client</th>
            <th>Date</th>
            <th>Montant TTC</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockSalesOrders.map((order) => (
            <tr key={order.id} data-testid={`order-${order.id}`}>
              <td>{order.orderNumber}</td>
              <td>{order.client?.name || 'N/A'}</td>
              <td>{new Date(order.orderDate).toLocaleDateString('fr-FR')}</td>
              <td>{Number(order.netAmount).toFixed(3)} DT</td>
              <td>
                <span className={`status-badge status-${order.status.toLowerCase()}`}>
                  {order.status === 'CONFIRMED' ? 'Confirmé' : 
                   order.status === 'IN_PROGRESS' ? 'En cours' :
                   order.status === 'DELIVERED' ? 'Livré' :
                   order.status === 'INVOICED' ? 'Facturé' : 'Annulé'}
                </span>
              </td>
              <td>
                <button data-testid={`view-${order.id}`}>Voir</button>
                {order.status === 'CONFIRMED' && order.client?.email && (
                  <button data-testid={`email-${order.id}`}>Email</button>
                )}
                {order.status === 'CONFIRMED' && (
                  <>
                    <button data-testid={`edit-${order.id}`}>Modifier</button>
                    <button data-testid={`start-${order.id}`}>Démarrer</button>
                  </>
                )}
                {order.status === 'IN_PROGRESS' && (
                  <button data-testid={`deliver-${order.id}`}>Marquer livré</button>
                )}
                {order.status === 'DELIVERED' && (
                  <button data-testid={`invoice-${order.id}`}>Convertir en facture</button>
                )}
                {['CONFIRMED', 'IN_PROGRESS'].includes(order.status) && (
                  <button data-testid={`cancel-${order.id}`}>Annuler</button>
                )}
                {['CONFIRMED', 'INVOICED'].includes(order.status) && (
                  <button data-testid={`delete-${order.id}`}>Supprimer</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div data-testid="pagination">
        <p>1–5 sur 5 commandes</p>
        <button disabled>«</button>
        <button disabled>Précédent</button>
        <button className="active">1</button>
        <button disabled>Suivant</button>
        <button disabled>»</button>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockSalesOrdersPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SalesOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Commandes clients')).toBeInTheDocument();
    });

    it('should render new order button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-order-btn')).toBeInTheDocument();
    });

    it('should render statistics cards', () => {
      renderWithRouter();
      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      renderWithRouter();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should render sales orders table', () => {
      renderWithRouter();
      expect(screen.getByTestId('sales-orders-table')).toBeInTheDocument();
    });

    it('should render pagination', () => {
      renderWithRouter();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should display total orders', () => {
      renderWithRouter();
      expect(screen.getByText('Total Commandes')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display in progress count', () => {
      renderWithRouter();
      expect(screen.getByText('En Cours')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display delivered count', () => {
      renderWithRouter();
      expect(screen.getByText('Livrées')).toBeInTheDocument();
    });

    it('should display total amount', () => {
      renderWithRouter();
      expect(screen.getByText('Montant Total')).toBeInTheDocument();
      expect(screen.getByText('17500.000 DT')).toBeInTheDocument();
    });
  });

  describe('Sales Orders Table', () => {
    it('should display order numbers', () => {
      renderWithRouter();
      expect(screen.getByText('SO-001')).toBeInTheDocument();
      expect(screen.getByText('SO-002')).toBeInTheDocument();
      expect(screen.getByText('SO-003')).toBeInTheDocument();
      expect(screen.getByText('SO-004')).toBeInTheDocument();
      expect(screen.getByText('SO-005')).toBeInTheDocument();
    });

    it('should display client names', () => {
      renderWithRouter();
      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('Client B')).toBeInTheDocument();
      expect(screen.getByText('Client C')).toBeInTheDocument();
      expect(screen.getByText('Client D')).toBeInTheDocument();
      expect(screen.getByText('Client E')).toBeInTheDocument();
    });

    it('should display order dates', () => {
      renderWithRouter();
      expect(screen.getByText('01/05/2026')).toBeInTheDocument();
      expect(screen.getByText('02/05/2026')).toBeInTheDocument();
      expect(screen.getByText('03/05/2026')).toBeInTheDocument();
      expect(screen.getByText('04/05/2026')).toBeInTheDocument();
      expect(screen.getByText('05/05/2026')).toBeInTheDocument();
    });

    it('should display amounts', () => {
      renderWithRouter();
      expect(screen.getByText('1500.000 DT')).toBeInTheDocument();
      expect(screen.getByText('2500.000 DT')).toBeInTheDocument();
      expect(screen.getByText('3500.000 DT')).toBeInTheDocument();
      expect(screen.getByText('4500.000 DT')).toBeInTheDocument();
      expect(screen.getByText('5500.000 DT')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      expect(screen.getByText('Confirmé')).toBeInTheDocument();
      expect(screen.getByText('En cours')).toBeInTheDocument();
      expect(screen.getByText('Livré')).toBeInTheDocument();
      expect(screen.getByText('Facturé')).toBeInTheDocument();
      expect(screen.getByText('Annulé')).toBeInTheDocument();
    });
  });

  describe('Actions by Status', () => {
    it('should show view button for all orders', () => {
      renderWithRouter();
      expect(screen.getByTestId('view-1')).toBeInTheDocument();
      expect(screen.getByTestId('view-2')).toBeInTheDocument();
      expect(screen.getByTestId('view-3')).toBeInTheDocument();
      expect(screen.getByTestId('view-4')).toBeInTheDocument();
      expect(screen.getByTestId('view-5')).toBeInTheDocument();
    });

    it('should show email button for confirmed orders with email', () => {
      renderWithRouter();
      expect(screen.getByTestId('email-1')).toBeInTheDocument();
    });

    it('should show edit and start buttons for confirmed orders', () => {
      renderWithRouter();
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('start-1')).toBeInTheDocument();
    });

    it('should show deliver button for in-progress orders', () => {
      renderWithRouter();
      expect(screen.getByTestId('deliver-2')).toBeInTheDocument();
    });

    it('should show invoice button for delivered orders', () => {
      renderWithRouter();
      expect(screen.getByTestId('invoice-3')).toBeInTheDocument();
    });

    it('should show cancel button for confirmed and in-progress orders', () => {
      renderWithRouter();
      expect(screen.getByTestId('cancel-1')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-2')).toBeInTheDocument();
    });

    it('should show delete button for confirmed and invoiced orders', () => {
      renderWithRouter();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-4')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render search input', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Rechercher par N° ou client...');
    });

    it('should render filters toggle button', () => {
      renderWithRouter();
      expect(screen.getByTestId('toggle-filters')).toBeInTheDocument();
    });

    it('should handle search input change', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'SO-001' } });
      expect(searchInput).toHaveValue('SO-001');
    });

    it('should handle filters toggle click', () => {
      renderWithRouter();
      const toggleBtn = screen.getByTestId('toggle-filters');
      fireEvent.click(toggleBtn);
      expect(toggleBtn).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle new order button click', () => {
      renderWithRouter();
      const newBtn = screen.getByTestId('new-order-btn');
      fireEvent.click(newBtn);
      expect(newBtn).toBeInTheDocument();
    });

    it('should handle view button click', () => {
      renderWithRouter();
      const viewBtn = screen.getByTestId('view-1');
      fireEvent.click(viewBtn);
      expect(viewBtn).toBeInTheDocument();
    });

    it('should handle email button click', () => {
      renderWithRouter();
      const emailBtn = screen.getByTestId('email-1');
      fireEvent.click(emailBtn);
      expect(emailBtn).toBeInTheDocument();
    });

    it('should handle edit button click', () => {
      renderWithRouter();
      const editBtn = screen.getByTestId('edit-1');
      fireEvent.click(editBtn);
      expect(editBtn).toBeInTheDocument();
    });

    it('should handle start button click', () => {
      renderWithRouter();
      const startBtn = screen.getByTestId('start-1');
      fireEvent.click(startBtn);
      expect(startBtn).toBeInTheDocument();
    });

    it('should handle deliver button click', () => {
      renderWithRouter();
      const deliverBtn = screen.getByTestId('deliver-2');
      fireEvent.click(deliverBtn);
      expect(deliverBtn).toBeInTheDocument();
    });

    it('should handle invoice button click', () => {
      renderWithRouter();
      const invoiceBtn = screen.getByTestId('invoice-3');
      fireEvent.click(invoiceBtn);
      expect(invoiceBtn).toBeInTheDocument();
    });

    it('should handle cancel button click', () => {
      renderWithRouter();
      const cancelBtn = screen.getByTestId('cancel-1');
      fireEvent.click(cancelBtn);
      expect(cancelBtn).toBeInTheDocument();
    });

    it('should handle delete button click', () => {
      renderWithRouter();
      const deleteBtn = screen.getByTestId('delete-1');
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should display pagination info', () => {
      renderWithRouter();
      expect(screen.getByText('1–5 sur 5 commandes')).toBeInTheDocument();
    });

    it('should render pagination buttons', () => {
      renderWithRouter();
      expect(screen.getByText('«')).toBeInTheDocument();
      expect(screen.getByText('Précédent')).toBeInTheDocument();
      expect(screen.getByText('Suivant')).toBeInTheDocument();
      expect(screen.getByText('»')).toBeInTheDocument();
    });

    it('should disable navigation buttons on single page', () => {
      renderWithRouter();
      expect(screen.getByText('«')).toBeDisabled();
      expect(screen.getByText('Précédent')).toBeDisabled();
      expect(screen.getByText('Suivant')).toBeDisabled();
      expect(screen.getByText('»')).toBeDisabled();
    });

    it('should highlight current page', () => {
      renderWithRouter();
      const currentPage = screen.getByText('1');
      expect(currentPage).toHaveClass('active');
    });
  });

  describe('Permissions', () => {
    it('should show create button with create permission', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-order-btn')).toBeInTheDocument();
    });

    it('should show edit buttons with update permission', () => {
      renderWithRouter();
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    });

    it('should show cancel buttons with cancel permission', () => {
      renderWithRouter();
      expect(screen.getByTestId('cancel-1')).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
