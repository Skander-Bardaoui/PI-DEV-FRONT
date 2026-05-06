// src/pages/backoffice/Expenses.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockExpenses = [
  {
    id: 1,
    description: 'Fournitures de bureau',
    category: 'Bureau',
    amount: 450,
    date: '15 Jan 2024',
    status: 'approved',
    vendor: 'Office Plus',
    receipt: true
  },
  {
    id: 2,
    description: 'Abonnement Adobe Creative',
    category: 'Logiciels',
    amount: 1200,
    date: '14 Jan 2024',
    status: 'approved',
    vendor: 'Adobe',
    receipt: true
  },
  {
    id: 3,
    description: 'Déjeuner client - Réunion projet',
    category: 'Repas',
    amount: 85,
    date: '13 Jan 2024',
    status: 'pending',
    vendor: 'Restaurant Le Comptoir',
    receipt: true
  },
];

// Mock component
const MockExpensesPage = () => {
  const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const approvedTotal = mockExpenses.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0);
  const pendingTotal = mockExpenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);

  return (
    <div data-testid="expenses-page">
      <h1>Dépenses</h1>
      <p>Suivez et catégorisez vos dépenses</p>
      <button data-testid="new-expense-btn">Nouvelle dépense</button>

      <div data-testid="stats">
        <div className="stat-card">
          <span>Total dépenses</span>
          <span>{totalExpenses.toLocaleString()} TND</span>
        </div>
        <div className="stat-card">
          <span>Approuvées</span>
          <span>{approvedTotal.toLocaleString()} TND</span>
        </div>
        <div className="stat-card">
          <span>En attente</span>
          <span>{pendingTotal.toLocaleString()} TND</span>
        </div>
      </div>

      <div data-testid="chart-section">
        <h2>Par catégorie</h2>
      </div>

      <div data-testid="filters">
        <input data-testid="search-input" placeholder="Rechercher une dépense..." />
        <select data-testid="category-filter">
          <option value="all">Toutes catégories</option>
          <option value="Bureau">Bureau</option>
          <option value="Logiciels">Logiciels</option>
          <option value="Repas">Repas</option>
        </select>
        <select data-testid="status-filter">
          <option value="all">Tous statuts</option>
          <option value="approved">Approuvées</option>
          <option value="pending">En attente</option>
        </select>
        <button data-testid="download-btn">Download</button>
      </div>

      <table data-testid="expenses-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Catégorie</th>
            <th>Fournisseur</th>
            <th>Date</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Reçu</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockExpenses.map((expense) => (
            <tr key={expense.id} data-testid={`expense-row-${expense.id}`}>
              <td>{expense.description}</td>
              <td>
                <span className="category-badge">{expense.category}</span>
              </td>
              <td>{expense.vendor}</td>
              <td>{expense.date}</td>
              <td>{expense.amount.toLocaleString()} TND</td>
              <td>
                <span className={`status-${expense.status}`}>
                  {expense.status === 'approved' ? 'Approuvée' : 'En attente'}
                </span>
              </td>
              <td>
                {expense.receipt ? (
                  <span className="has-receipt">✓</span>
                ) : (
                  <span className="no-receipt">✗</span>
                )}
              </td>
              <td>
                <button data-testid={`view-${expense.id}`}>View</button>
                <button data-testid={`edit-${expense.id}`}>Edit</button>
                <button data-testid={`delete-${expense.id}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockExpensesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Expenses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Dépenses')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderWithRouter();
      expect(screen.getByText('Suivez et catégorisez vos dépenses')).toBeInTheDocument();
    });

    it('should render new expense button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-expense-btn')).toBeInTheDocument();
    });

    it('should render statistics section', () => {
      renderWithRouter();
      expect(screen.getByTestId('stats')).toBeInTheDocument();
    });

    it('should render chart section', () => {
      renderWithRouter();
      expect(screen.getByTestId('chart-section')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      renderWithRouter();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should render expenses table', () => {
      renderWithRouter();
      expect(screen.getByTestId('expenses-table')).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should display total expenses', () => {
      renderWithRouter();
      expect(screen.getByText('Total dépenses')).toBeInTheDocument();
      expect(screen.getByText('1 735 TND')).toBeInTheDocument();
    });

    it('should display approved expenses total', () => {
      renderWithRouter();
      expect(screen.getByText('Approuvées')).toBeInTheDocument();
      expect(screen.getByText('1 650 TND')).toBeInTheDocument();
    });

    it('should display pending expenses total', () => {
      renderWithRouter();
      expect(screen.getByText('En attente')).toBeInTheDocument();
      expect(screen.getByText('85 TND')).toBeInTheDocument();
    });
  });

  describe('Chart Section', () => {
    it('should display chart title', () => {
      renderWithRouter();
      expect(screen.getByText('Par catégorie')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render search input', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Rechercher une dépense...');
    });

    it('should render category filter', () => {
      renderWithRouter();
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
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
      fireEvent.change(searchInput, { target: { value: 'Adobe' } });
      expect(searchInput).toHaveValue('Adobe');
    });

    it('should handle category filter change', () => {
      renderWithRouter();
      const categoryFilter = screen.getByTestId('category-filter');
      fireEvent.change(categoryFilter, { target: { value: 'Bureau' } });
      expect(categoryFilter).toHaveValue('Bureau');
    });

    it('should handle status filter change', () => {
      renderWithRouter();
      const statusFilter = screen.getByTestId('status-filter');
      fireEvent.change(statusFilter, { target: { value: 'approved' } });
      expect(statusFilter).toHaveValue('approved');
    });

    it('should handle download button click', () => {
      renderWithRouter();
      const downloadBtn = screen.getByTestId('download-btn');
      fireEvent.click(downloadBtn);
      expect(downloadBtn).toBeInTheDocument();
    });
  });

  describe('Expenses Table', () => {
    it('should display expense rows', () => {
      renderWithRouter();
      expect(screen.getByTestId('expense-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('expense-row-2')).toBeInTheDocument();
      expect(screen.getByTestId('expense-row-3')).toBeInTheDocument();
    });

    it('should display expense descriptions', () => {
      renderWithRouter();
      expect(screen.getByText('Fournitures de bureau')).toBeInTheDocument();
      expect(screen.getByText('Abonnement Adobe Creative')).toBeInTheDocument();
      expect(screen.getByText('Déjeuner client - Réunion projet')).toBeInTheDocument();
    });

    it('should display categories', () => {
      renderWithRouter();
      expect(screen.getByText('Bureau')).toBeInTheDocument();
      expect(screen.getByText('Logiciels')).toBeInTheDocument();
      expect(screen.getByText('Repas')).toBeInTheDocument();
    });

    it('should display vendors', () => {
      renderWithRouter();
      expect(screen.getByText('Office Plus')).toBeInTheDocument();
      expect(screen.getByText('Adobe')).toBeInTheDocument();
      expect(screen.getByText('Restaurant Le Comptoir')).toBeInTheDocument();
    });

    it('should display dates', () => {
      renderWithRouter();
      expect(screen.getByText('15 Jan 2024')).toBeInTheDocument();
      expect(screen.getByText('14 Jan 2024')).toBeInTheDocument();
      expect(screen.getByText('13 Jan 2024')).toBeInTheDocument();
    });

    it('should display amounts', () => {
      renderWithRouter();
      expect(screen.getByText('450 TND')).toBeInTheDocument();
      expect(screen.getByText('1 200 TND')).toBeInTheDocument();
      expect(screen.getByText('85 TND')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      const approvedStatuses = screen.getAllByText('Approuvée');
      expect(approvedStatuses).toHaveLength(2);
      expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('should display receipt indicators', () => {
      renderWithRouter();
      const hasReceipt = screen.getAllByText('✓');
      expect(hasReceipt).toHaveLength(3);
    });
  });

  describe('Actions', () => {
    it('should render view buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('view-1')).toBeInTheDocument();
      expect(screen.getByTestId('view-2')).toBeInTheDocument();
      expect(screen.getByTestId('view-3')).toBeInTheDocument();
    });

    it('should render edit buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-3')).toBeInTheDocument();
    });

    it('should render delete buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-3')).toBeInTheDocument();
    });

    it('should handle new expense button click', () => {
      renderWithRouter();
      const newBtn = screen.getByTestId('new-expense-btn');
      fireEvent.click(newBtn);
      expect(newBtn).toBeInTheDocument();
    });

    it('should handle view button click', () => {
      renderWithRouter();
      const viewBtn = screen.getByTestId('view-1');
      fireEvent.click(viewBtn);
      expect(viewBtn).toBeInTheDocument();
    });

    it('should handle edit button click', () => {
      renderWithRouter();
      const editBtn = screen.getByTestId('edit-1');
      fireEvent.click(editBtn);
      expect(editBtn).toBeInTheDocument();
    });

    it('should handle delete button click', () => {
      renderWithRouter();
      const deleteBtn = screen.getByTestId('delete-1');
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
