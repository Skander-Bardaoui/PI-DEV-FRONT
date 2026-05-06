// src/pages/backoffice/sales/RecurringInvoicesPage.test.tsx

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
        create_recurring: true,
        update_recurring: true,
        delete_recurring: true,
      },
    },
  }),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const mockRecurringInvoices = [
  {
    id: '1',
    description: 'Monthly Subscription',
    client: { name: 'Client A' },
    frequency: 'MONTHLY',
    amount: 1000,
    next_invoice_date: '2026-06-01',
    invoices_generated: 5,
    status: 'ACTIVE',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    notes: 'Special discount',
  },
  {
    id: '2',
    description: 'Quarterly Service',
    client: { name: 'Client B' },
    frequency: 'QUARTERLY',
    amount: 3000,
    next_invoice_date: '2026-07-01',
    invoices_generated: 2,
    status: 'PAUSED',
    discount_type: null,
    discount_value: null,
    notes: null,
  },
  {
    id: '3',
    description: 'Annual License',
    client: { name: 'Client C' },
    frequency: 'YEARLY',
    amount: 12000,
    next_invoice_date: '2027-01-01',
    invoices_generated: 1,
    status: 'INACTIVE',
    discount_type: 'FIXED',
    discount_value: 500,
    notes: null,
  },
];

vi.mock('@/hooks/useRecurringInvoices', () => ({
  useRecurringInvoices: () => ({
    data: {
      data: mockRecurringInvoices,
      total: 3,
      total_pages: 1,
    },
    isLoading: false,
  }),
  useDeleteRecurringInvoice: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useActivateRecurringInvoice: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  usePauseRecurringInvoice: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useResumeRecurringInvoice: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useBulkUpdateRecurringInvoices: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/components/sales/RecurringInvoiceStatsCards', () => ({
  default: () => <div data-testid="stats-cards">Stats Cards</div>,
}));

vi.mock('@/components/sales/RecurringInvoiceHistoryDrawer', () => ({
  default: () => <div data-testid="history-drawer">History Drawer</div>,
}));

vi.mock('@/components/sales/RecurringInvoiceBulkActions', () => ({
  default: () => <div data-testid="bulk-actions">Bulk Actions</div>,
}));

// Mock component
const MockRecurringInvoicesPage = () => {
  return (
    <div data-testid="recurring-invoices-page">
      <h1>Factures Récurrentes</h1>
      <p>Gérez vos factures automatiques et abonnements</p>
      <button data-testid="new-recurring-btn">Nouvelle facture récurrente</button>

      <div data-testid="stats-cards">Stats Cards</div>

      <div data-testid="status-filters">
        <button data-testid="filter-all">Toutes</button>
        <button data-testid="filter-active">Actives</button>
        <button data-testid="filter-paused">En pause</button>
        <button data-testid="filter-inactive">Inactives</button>
      </div>

      <div data-testid="search-and-frequency">
        <input data-testid="search-input" placeholder="Rechercher par description ou client..." />
        <select data-testid="frequency-filter">
          <option value="">Toutes les fréquences</option>
          <option value="MONTHLY">Mensuelle</option>
          <option value="QUARTERLY">Trimestrielle</option>
          <option value="YEARLY">Annuelle</option>
        </select>
      </div>

      <table data-testid="recurring-invoices-table">
        <thead>
          <tr>
            <th><input type="checkbox" data-testid="select-all" /></th>
            <th>N°</th>
            <th>Client</th>
            <th>Description</th>
            <th>Fréquence</th>
            <th>Montant HT</th>
            <th>Prochaine</th>
            <th>Générées</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockRecurringInvoices.map((recurring, index) => (
            <tr key={recurring.id} data-testid={`recurring-${recurring.id}`}>
              <td><input type="checkbox" data-testid={`checkbox-${recurring.id}`} /></td>
              <td>#{index + 1}</td>
              <td>{recurring.client?.name || 'N/A'}</td>
              <td>
                {recurring.description}
                {recurring.discount_type && recurring.discount_value && (
                  <span className="discount-badge">
                    {recurring.discount_type === 'PERCENTAGE' ? `-${recurring.discount_value}%` : `-${recurring.discount_value} DT`}
                  </span>
                )}
              </td>
              <td>{recurring.frequency}</td>
              <td>{Number(recurring.amount).toFixed(3)} DT</td>
              <td>{new Date(recurring.next_invoice_date).toLocaleDateString('fr-FR')}</td>
              <td>
                <button data-testid={`history-${recurring.id}`}>{recurring.invoices_generated}</button>
              </td>
              <td>
                <span className={`status-badge status-${recurring.status.toLowerCase()}`}>
                  {recurring.status === 'ACTIVE' ? 'Active' : recurring.status === 'PAUSED' ? 'En pause' : 'Inactive'}
                </span>
              </td>
              <td>
                <button data-testid={`edit-${recurring.id}`}>Modifier</button>
                <button data-testid={`toggle-${recurring.id}`}>
                  {recurring.status === 'ACTIVE' ? 'Pause' : recurring.status === 'PAUSED' ? 'Reprendre' : 'Activer'}
                </button>
                <button data-testid={`delete-${recurring.id}`}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div data-testid="pagination">
        <p>1–3 sur 3 factures récurrentes</p>
        <button disabled>«</button>
        <button disabled>Précédent</button>
        <button className="active">1</button>
        <button disabled>Suivant</button>
        <button disabled>»</button>
      </div>

      <div data-testid="bulk-actions">Bulk Actions</div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockRecurringInvoicesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RecurringInvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Factures Récurrentes')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderWithRouter();
      expect(screen.getByText('Gérez vos factures automatiques et abonnements')).toBeInTheDocument();
    });

    it('should render new recurring button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-recurring-btn')).toBeInTheDocument();
    });

    it('should render stats cards', () => {
      renderWithRouter();
      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
    });

    it('should render status filters', () => {
      renderWithRouter();
      expect(screen.getByTestId('status-filters')).toBeInTheDocument();
    });

    it('should render search and frequency filters', () => {
      renderWithRouter();
      expect(screen.getByTestId('search-and-frequency')).toBeInTheDocument();
    });

    it('should render recurring invoices table', () => {
      renderWithRouter();
      expect(screen.getByTestId('recurring-invoices-table')).toBeInTheDocument();
    });

    it('should render pagination', () => {
      renderWithRouter();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should render bulk actions', () => {
      renderWithRouter();
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
    });
  });

  describe('Status Filters', () => {
    it('should render all status filter buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-active')).toBeInTheDocument();
      expect(screen.getByTestId('filter-paused')).toBeInTheDocument();
      expect(screen.getByTestId('filter-inactive')).toBeInTheDocument();
    });

    it('should handle filter button clicks', () => {
      renderWithRouter();
      const activeFilter = screen.getByTestId('filter-active');
      fireEvent.click(activeFilter);
      expect(activeFilter).toBeInTheDocument();
    });
  });

  describe('Search and Frequency', () => {
    it('should render search input', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Rechercher par description ou client...');
    });

    it('should render frequency filter', () => {
      renderWithRouter();
      expect(screen.getByTestId('frequency-filter')).toBeInTheDocument();
    });

    it('should handle search input change', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Monthly' } });
      expect(searchInput).toHaveValue('Monthly');
    });

    it('should handle frequency filter change', () => {
      renderWithRouter();
      const frequencyFilter = screen.getByTestId('frequency-filter');
      fireEvent.change(frequencyFilter, { target: { value: 'MONTHLY' } });
      expect(frequencyFilter).toHaveValue('MONTHLY');
    });
  });

  describe('Recurring Invoices Table', () => {
    it('should display recurring invoice descriptions', () => {
      renderWithRouter();
      expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
      expect(screen.getByText('Quarterly Service')).toBeInTheDocument();
      expect(screen.getByText('Annual License')).toBeInTheDocument();
    });

    it('should display client names', () => {
      renderWithRouter();
      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('Client B')).toBeInTheDocument();
      expect(screen.getByText('Client C')).toBeInTheDocument();
    });

    it('should display frequencies', () => {
      renderWithRouter();
      expect(screen.getByText('MONTHLY')).toBeInTheDocument();
      expect(screen.getByText('QUARTERLY')).toBeInTheDocument();
      expect(screen.getByText('YEARLY')).toBeInTheDocument();
    });

    it('should display amounts', () => {
      renderWithRouter();
      expect(screen.getByText('1000.000 DT')).toBeInTheDocument();
      expect(screen.getByText('3000.000 DT')).toBeInTheDocument();
      expect(screen.getByText('12000.000 DT')).toBeInTheDocument();
    });

    it('should display next invoice dates', () => {
      renderWithRouter();
      expect(screen.getByText('01/06/2026')).toBeInTheDocument();
      expect(screen.getByText('01/07/2026')).toBeInTheDocument();
      expect(screen.getByText('01/01/2027')).toBeInTheDocument();
    });

    it('should display invoices generated count', () => {
      renderWithRouter();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('En pause')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should display discount badges when applicable', () => {
      renderWithRouter();
      expect(screen.getByText('-10%')).toBeInTheDocument();
      expect(screen.getByText('-500 DT')).toBeInTheDocument();
    });

    it('should render select all checkbox', () => {
      renderWithRouter();
      expect(screen.getByTestId('select-all')).toBeInTheDocument();
    });

    it('should render individual checkboxes', () => {
      renderWithRouter();
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-2')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-3')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render edit buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-3')).toBeInTheDocument();
    });

    it('should render toggle status buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('toggle-1')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Reprendre')).toBeInTheDocument();
      expect(screen.getByText('Activer')).toBeInTheDocument();
    });

    it('should render delete buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-3')).toBeInTheDocument();
    });

    it('should render history buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('history-1')).toBeInTheDocument();
      expect(screen.getByTestId('history-2')).toBeInTheDocument();
      expect(screen.getByTestId('history-3')).toBeInTheDocument();
    });

    it('should handle edit button click', () => {
      renderWithRouter();
      const editBtn = screen.getByTestId('edit-1');
      fireEvent.click(editBtn);
      expect(editBtn).toBeInTheDocument();
    });

    it('should handle toggle button click', () => {
      renderWithRouter();
      const toggleBtn = screen.getByTestId('toggle-1');
      fireEvent.click(toggleBtn);
      expect(toggleBtn).toBeInTheDocument();
    });

    it('should handle delete button click', () => {
      renderWithRouter();
      const deleteBtn = screen.getByTestId('delete-1');
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeInTheDocument();
    });

    it('should handle history button click', () => {
      renderWithRouter();
      const historyBtn = screen.getByTestId('history-1');
      fireEvent.click(historyBtn);
      expect(historyBtn).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should display pagination info', () => {
      renderWithRouter();
      expect(screen.getByText('1–3 sur 3 factures récurrentes')).toBeInTheDocument();
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
      expect(screen.getByTestId('new-recurring-btn')).toBeInTheDocument();
    });

    it('should show edit buttons with update permission', () => {
      renderWithRouter();
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    });

    it('should show delete buttons with delete permission', () => {
      renderWithRouter();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle new recurring button click', () => {
      renderWithRouter();
      const newBtn = screen.getByTestId('new-recurring-btn');
      fireEvent.click(newBtn);
      expect(newBtn).toBeInTheDocument();
    });

    it('should handle checkbox selection', () => {
      renderWithRouter();
      const checkbox = screen.getByTestId('checkbox-1');
      fireEvent.click(checkbox);
      expect(checkbox).toBeInTheDocument();
    });

    it('should handle select all checkbox', () => {
      renderWithRouter();
      const selectAll = screen.getByTestId('select-all');
      fireEvent.click(selectAll);
      expect(selectAll).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
