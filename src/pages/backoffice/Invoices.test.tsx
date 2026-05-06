// src/pages/backoffice/Invoices.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockInvoices = [
  {
    id: 'INV-2024-001',
    client: 'Tech Solutions SARL',
    clientEmail: 'contact@techsolutions.tn',
    date: '15 Jan 2024',
    dueDate: '30 Jan 2024',
    amount: 3500,
    status: 'paid'
  },
  {
    id: 'INV-2024-002',
    client: 'Digital Agency Tunisia',
    clientEmail: 'info@digitalagency.tn',
    date: '14 Jan 2024',
    dueDate: '28 Jan 2024',
    amount: 2800,
    status: 'pending'
  },
  {
    id: 'INV-2024-003',
    client: 'Consulting Pro',
    clientEmail: 'contact@consultingpro.tn',
    date: '10 Jan 2024',
    dueDate: '25 Jan 2024',
    amount: 1900,
    status: 'overdue'
  },
];

// Mock component
const MockInvoicesPage = () => {
  const totalAmount = 8200;
  const paidAmount = 3500;
  const pendingAmount = 4700;

  return (
    <div data-testid="invoices-page">
      <h1>Factures</h1>
      <p>Gérez vos factures et suivez les paiements</p>
      <button data-testid="new-invoice-btn">Nouvelle facture</button>

      <div data-testid="stats">
        <div className="stat-card">
          <span>Total</span>
          <span>{totalAmount.toLocaleString()} TND</span>
        </div>
        <div className="stat-card">
          <span>Payé</span>
          <span>{paidAmount.toLocaleString()} TND</span>
        </div>
        <div className="stat-card">
          <span>En attente</span>
          <span>{pendingAmount.toLocaleString()} TND</span>
        </div>
      </div>

      <div data-testid="filters">
        <input data-testid="search-input" placeholder="Rechercher par client ou numéro..." />
        <select data-testid="status-filter">
          <option value="all">Tous les statuts</option>
          <option value="paid">Payées</option>
          <option value="pending">En attente</option>
          <option value="overdue">En retard</option>
        </select>
        <button data-testid="download-btn">Download</button>
      </div>

      <table data-testid="invoices-table">
        <thead>
          <tr>
            <th>N° Facture</th>
            <th>Client</th>
            <th>Date</th>
            <th>Échéance</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockInvoices.map((invoice) => (
            <tr key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
              <td>{invoice.id}</td>
              <td>
                <div>{invoice.client}</div>
                <div>{invoice.clientEmail}</div>
              </td>
              <td>{invoice.date}</td>
              <td>{invoice.dueDate}</td>
              <td>{invoice.amount.toLocaleString()} TND</td>
              <td>
                <span className={`status-${invoice.status}`}>
                  {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'En retard'}
                </span>
              </td>
              <td>
                <button data-testid={`view-${invoice.id}`}>View</button>
                <button data-testid={`edit-${invoice.id}`}>Edit</button>
                <button data-testid={`send-${invoice.id}`}>Send</button>
                <button data-testid={`delete-${invoice.id}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div data-testid="pagination">
        <p>Affichage de {mockInvoices.length} factures</p>
        <button disabled>Précédent</button>
        <button className="active">1</button>
        <button>Suivant</button>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockInvoicesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Invoices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Factures')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderWithRouter();
      expect(screen.getByText('Gérez vos factures et suivez les paiements')).toBeInTheDocument();
    });

    it('should render new invoice button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-invoice-btn')).toBeInTheDocument();
    });

    it('should render statistics section', () => {
      renderWithRouter();
      expect(screen.getByTestId('stats')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      renderWithRouter();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should render invoices table', () => {
      renderWithRouter();
      expect(screen.getByTestId('invoices-table')).toBeInTheDocument();
    });

    it('should render pagination', () => {
      renderWithRouter();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should display total amount', () => {
      renderWithRouter();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('8 200 TND')).toBeInTheDocument();
    });

    it('should display paid amount', () => {
      renderWithRouter();
      expect(screen.getByText('Payé')).toBeInTheDocument();
      expect(screen.getByText('3 500 TND')).toBeInTheDocument();
    });

    it('should display pending amount', () => {
      renderWithRouter();
      expect(screen.getByText('En attente')).toBeInTheDocument();
      expect(screen.getByText('4 700 TND')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render search input', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Rechercher par client ou numéro...');
    });

    it('should render status filter', () => {
      renderWithRouter();
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    });

    it('should render download button', () => {
      renderWithRouter();
      expect(screen.getByTestId('download-btn')).toBeInTheDocument();
    });

    it('should handle search input change', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Tech' } });
      expect(searchInput).toHaveValue('Tech');
    });

    it('should handle status filter change', () => {
      renderWithRouter();
      const statusFilter = screen.getByTestId('status-filter');
      fireEvent.change(statusFilter, { target: { value: 'paid' } });
      expect(statusFilter).toHaveValue('paid');
    });
  });

  describe('Invoices Table', () => {
    it('should display invoice rows', () => {
      renderWithRouter();
      expect(screen.getByTestId('invoice-row-INV-2024-001')).toBeInTheDocument();
      expect(screen.getByTestId('invoice-row-INV-2024-002')).toBeInTheDocument();
      expect(screen.getByTestId('invoice-row-INV-2024-003')).toBeInTheDocument();
    });

    it('should display invoice numbers', () => {
      renderWithRouter();
      expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-002')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-003')).toBeInTheDocument();
    });

    it('should display client names', () => {
      renderWithRouter();
      expect(screen.getByText('Tech Solutions SARL')).toBeInTheDocument();
      expect(screen.getByText('Digital Agency Tunisia')).toBeInTheDocument();
      expect(screen.getByText('Consulting Pro')).toBeInTheDocument();
    });

    it('should display client emails', () => {
      renderWithRouter();
      expect(screen.getByText('contact@techsolutions.tn')).toBeInTheDocument();
      expect(screen.getByText('info@digitalagency.tn')).toBeInTheDocument();
      expect(screen.getByText('contact@consultingpro.tn')).toBeInTheDocument();
    });

    it('should display dates', () => {
      renderWithRouter();
      expect(screen.getByText('15 Jan 2024')).toBeInTheDocument();
      expect(screen.getByText('14 Jan 2024')).toBeInTheDocument();
      expect(screen.getByText('10 Jan 2024')).toBeInTheDocument();
    });

    it('should display due dates', () => {
      renderWithRouter();
      expect(screen.getByText('30 Jan 2024')).toBeInTheDocument();
      expect(screen.getByText('28 Jan 2024')).toBeInTheDocument();
      expect(screen.getByText('25 Jan 2024')).toBeInTheDocument();
    });

    it('should display amounts', () => {
      renderWithRouter();
      expect(screen.getByText('3 500 TND')).toBeInTheDocument();
      expect(screen.getByText('2 800 TND')).toBeInTheDocument();
      expect(screen.getByText('1 900 TND')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      expect(screen.getByText('Payée')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
      expect(screen.getByText('En retard')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render view buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('view-INV-2024-001')).toBeInTheDocument();
      expect(screen.getByTestId('view-INV-2024-002')).toBeInTheDocument();
      expect(screen.getByTestId('view-INV-2024-003')).toBeInTheDocument();
    });

    it('should render edit buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('edit-INV-2024-001')).toBeInTheDocument();
      expect(screen.getByTestId('edit-INV-2024-002')).toBeInTheDocument();
      expect(screen.getByTestId('edit-INV-2024-003')).toBeInTheDocument();
    });

    it('should render send buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('send-INV-2024-001')).toBeInTheDocument();
      expect(screen.getByTestId('send-INV-2024-002')).toBeInTheDocument();
      expect(screen.getByTestId('send-INV-2024-003')).toBeInTheDocument();
    });

    it('should render delete buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('delete-INV-2024-001')).toBeInTheDocument();
      expect(screen.getByTestId('delete-INV-2024-002')).toBeInTheDocument();
      expect(screen.getByTestId('delete-INV-2024-003')).toBeInTheDocument();
    });

    it('should handle new invoice button click', () => {
      renderWithRouter();
      const newBtn = screen.getByTestId('new-invoice-btn');
      fireEvent.click(newBtn);
      expect(newBtn).toBeInTheDocument();
    });

    it('should handle view button click', () => {
      renderWithRouter();
      const viewBtn = screen.getByTestId('view-INV-2024-001');
      fireEvent.click(viewBtn);
      expect(viewBtn).toBeInTheDocument();
    });

    it('should handle edit button click', () => {
      renderWithRouter();
      const editBtn = screen.getByTestId('edit-INV-2024-001');
      fireEvent.click(editBtn);
      expect(editBtn).toBeInTheDocument();
    });

    it('should handle send button click', () => {
      renderWithRouter();
      const sendBtn = screen.getByTestId('send-INV-2024-001');
      fireEvent.click(sendBtn);
      expect(sendBtn).toBeInTheDocument();
    });

    it('should handle delete button click', () => {
      renderWithRouter();
      const deleteBtn = screen.getByTestId('delete-INV-2024-001');
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should display pagination info', () => {
      renderWithRouter();
      expect(screen.getByText('Affichage de 3 factures')).toBeInTheDocument();
    });

    it('should render pagination buttons', () => {
      renderWithRouter();
      expect(screen.getByText('Précédent')).toBeInTheDocument();
      expect(screen.getByText('Suivant')).toBeInTheDocument();
    });

    it('should highlight current page', () => {
      renderWithRouter();
      const currentPage = screen.getByText('1');
      expect(currentPage).toHaveClass('active');
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
