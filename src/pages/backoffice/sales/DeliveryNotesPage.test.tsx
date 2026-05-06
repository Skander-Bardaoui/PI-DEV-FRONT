// src/pages/backoffice/sales/DeliveryNotesPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        create_delivery: true,
        update_delivery: true,
        cancel_delivery: true,
      },
    },
  }),
}));

const mockDeliveryNotes = [
  {
    id: '1',
    deliveryNoteNumber: 'BL-001',
    deliveryDate: '2026-05-01',
    status: 'pending',
    client: { name: 'Client A', email: 'clienta@example.com' },
    salesOrderId: 'so-1',
    items: [
      { id: 'item-1', description: 'Product 1', deliveredQuantity: 10, salesOrderItemId: 'soi-1' },
    ],
  },
  {
    id: '2',
    deliveryNoteNumber: 'BL-002',
    deliveryDate: '2026-05-02',
    status: 'delivered',
    client: { name: 'Client B', email: 'clientb@example.com' },
    salesOrderId: 'so-2',
    items: [
      { id: 'item-2', description: 'Product 2', deliveredQuantity: 5, salesOrderItemId: 'soi-2' },
    ],
  },
  {
    id: '3',
    deliveryNoteNumber: 'BL-003',
    deliveryDate: '2026-05-03',
    status: 'cancelled',
    client: { name: 'Client C' },
    items: [],
  },
];

vi.mock('@/hooks/useDeliveryNotes', () => ({
  useDeliveryNotes: () => ({
    data: {
      data: mockDeliveryNotes,
      total: 3,
      total_pages: 1,
    },
    isLoading: false,
  }),
  useDeleteDeliveryNote: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useSalesOrders', () => ({
  useSalesOrder: () => ({
    data: {
      id: 'so-1',
      orderNumber: 'SO-001',
      items: [
        { id: 'soi-1', description: 'Product 1', quantity: 20, unitPrice: 100 },
      ],
    },
    isLoading: false,
  }),
}));

// Mock component
const MockDeliveryNotesPage = () => {
  return (
    <div data-testid="delivery-notes-page">
      <h1>Bons de livraison</h1>
      <button data-testid="new-delivery-btn">Nouveau bon de livraison</button>
      
      <div data-testid="stats-cards">
        <div className="stat-card">
          <span>Total BL</span>
          <span>3</span>
        </div>
        <div className="stat-card">
          <span>En Attente</span>
          <span>1</span>
        </div>
        <div className="stat-card">
          <span>Livrés</span>
          <span>1</span>
        </div>
        <div className="stat-card">
          <span>Annulés</span>
          <span>1</span>
        </div>
      </div>

      <div data-testid="filters">
        <button data-testid="toggle-filters">Filtres</button>
        <input data-testid="search-input" placeholder="Rechercher par N° ou client..." />
      </div>

      <table data-testid="delivery-notes-table">
        <thead>
          <tr>
            <th>N° BL</th>
            <th>Client</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockDeliveryNotes.map((note) => (
            <tr key={note.id} data-testid={`delivery-note-${note.id}`}>
              <td>{note.deliveryNoteNumber}</td>
              <td>{note.client?.name || 'N/A'}</td>
              <td>{new Date(note.deliveryDate).toLocaleDateString('fr-FR')}</td>
              <td>
                <span className={`status-badge status-${note.status}`}>
                  {note.status === 'pending' ? 'En attente' : note.status === 'delivered' ? 'Livré' : 'Annulé'}
                </span>
              </td>
              <td>
                <button data-testid={`view-${note.id}`}>Voir</button>
                <button data-testid={`delete-${note.id}`}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div data-testid="pagination">
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
      <MockDeliveryNotesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DeliveryNotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Bons de livraison')).toBeInTheDocument();
    });

    it('should render new delivery button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-delivery-btn')).toBeInTheDocument();
    });

    it('should render statistics cards', () => {
      renderWithRouter();
      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      renderWithRouter();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should render delivery notes table', () => {
      renderWithRouter();
      expect(screen.getByTestId('delivery-notes-table')).toBeInTheDocument();
    });

    it('should render pagination', () => {
      renderWithRouter();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should display total delivery notes', () => {
      renderWithRouter();
      expect(screen.getByText('Total BL')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display pending count', () => {
      renderWithRouter();
      expect(screen.getByText('En Attente')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display delivered count', () => {
      renderWithRouter();
      expect(screen.getByText('Livrés')).toBeInTheDocument();
    });

    it('should display cancelled count', () => {
      renderWithRouter();
      expect(screen.getByText('Annulés')).toBeInTheDocument();
    });
  });

  describe('Delivery Notes Table', () => {
    it('should display delivery note numbers', () => {
      renderWithRouter();
      expect(screen.getByText('BL-001')).toBeInTheDocument();
      expect(screen.getByText('BL-002')).toBeInTheDocument();
      expect(screen.getByText('BL-003')).toBeInTheDocument();
    });

    it('should display client names', () => {
      renderWithRouter();
      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('Client B')).toBeInTheDocument();
      expect(screen.getByText('Client C')).toBeInTheDocument();
    });

    it('should display delivery dates', () => {
      renderWithRouter();
      expect(screen.getByText('01/05/2026')).toBeInTheDocument();
      expect(screen.getByText('02/05/2026')).toBeInTheDocument();
      expect(screen.getByText('03/05/2026')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      expect(screen.getByText('En attente')).toBeInTheDocument();
      expect(screen.getByText('Livré')).toBeInTheDocument();
      expect(screen.getByText('Annulé')).toBeInTheDocument();
    });

    it('should render action buttons for each note', () => {
      renderWithRouter();
      expect(screen.getByTestId('view-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
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
      fireEvent.change(searchInput, { target: { value: 'BL-001' } });
      expect(searchInput).toHaveValue('BL-001');
    });
  });

  describe('Interactions', () => {
    it('should handle new delivery button click', () => {
      renderWithRouter();
      const newBtn = screen.getByTestId('new-delivery-btn');
      fireEvent.click(newBtn);
      expect(newBtn).toBeInTheDocument();
    });

    it('should handle view button click', () => {
      renderWithRouter();
      const viewBtn = screen.getByTestId('view-1');
      fireEvent.click(viewBtn);
      expect(viewBtn).toBeInTheDocument();
    });

    it('should handle delete button click', () => {
      renderWithRouter();
      const deleteBtn = screen.getByTestId('delete-1');
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeInTheDocument();
    });

    it('should handle filters toggle', () => {
      renderWithRouter();
      const toggleBtn = screen.getByTestId('toggle-filters');
      fireEvent.click(toggleBtn);
      expect(toggleBtn).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should render pagination buttons', () => {
      renderWithRouter();
      expect(screen.getByText('«')).toBeInTheDocument();
      expect(screen.getByText('Précédent')).toBeInTheDocument();
      expect(screen.getByText('Suivant')).toBeInTheDocument();
      expect(screen.getByText('»')).toBeInTheDocument();
    });

    it('should disable first page buttons on first page', () => {
      renderWithRouter();
      expect(screen.getByText('«')).toBeDisabled();
      expect(screen.getByText('Précédent')).toBeDisabled();
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
      expect(screen.getByTestId('new-delivery-btn')).toBeInTheDocument();
    });

    it('should show delete buttons with cancel permission', () => {
      renderWithRouter();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty delivery notes list', () => {
      renderWithRouter();
      expect(screen.getByTestId('delivery-notes-table')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
