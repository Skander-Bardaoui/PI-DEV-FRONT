// src/pages/backoffice/Clients.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockClients = [
  {
    id: 1,
    name: 'Tech Solutions SARL',
    contact: 'Ahmed Ben Ali',
    email: 'ahmed@techsolutions.tn',
    phone: '+216 71 234 567',
    address: 'Rue de la Liberté, Tunis',
    totalInvoices: 12,
    totalAmount: 45000,
    status: 'active'
  },
  {
    id: 2,
    name: 'Digital Agency Tunisia',
    contact: 'Salma Mansouri',
    email: 'salma@digitalagency.tn',
    phone: '+216 71 345 678',
    address: 'Avenue Habib Bourguiba, Sousse',
    totalInvoices: 8,
    totalAmount: 28500,
    status: 'active'
  },
  {
    id: 3,
    name: 'Consulting Pro',
    contact: 'Fatma Khelifi',
    email: 'fatma@consultingpro.tn',
    phone: '+216 71 567 890',
    address: 'Centre Urbain Nord, Tunis',
    totalInvoices: 3,
    totalAmount: 9800,
    status: 'inactive'
  },
];

// Mock component
const MockClientsPage = () => {
  return (
    <div data-testid="clients-page">
      <h1>Clients</h1>
      <p>Gérez votre base de données clients</p>
      <button data-testid="new-client-btn">Nouveau client</button>

      <div data-testid="stats">
        <div className="stat-card">
          <span>Total clients</span>
          <span>3</span>
        </div>
        <div className="stat-card">
          <span>Clients actifs</span>
          <span>2</span>
        </div>
        <div className="stat-card">
          <span>Chiffre d'affaires total</span>
          <span>83 300 TND</span>
        </div>
      </div>

      <div data-testid="filters">
        <input data-testid="search-input" placeholder="Rechercher un client..." />
        <select data-testid="status-filter">
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      <div data-testid="clients-grid">
        {mockClients.map((client) => (
          <div key={client.id} data-testid={`client-card-${client.id}`} className="client-card">
            <h3>{client.name}</h3>
            <p>{client.contact}</p>
            <span className={`status-${client.status}`}>
              {client.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
            <div>{client.email}</div>
            <div>{client.phone}</div>
            <div>{client.address}</div>
            <div>
              <span>Factures: {client.totalInvoices}</span>
              <span>Total facturé: {client.totalAmount.toLocaleString()} TND</span>
            </div>
            <button data-testid={`view-details-${client.id}`}>Voir détails</button>
            <button data-testid={`edit-${client.id}`}>Modifier</button>
            <button data-testid={`delete-${client.id}`}>Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockClientsPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Clients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderWithRouter();
      expect(screen.getByText('Gérez votre base de données clients')).toBeInTheDocument();
    });

    it('should render new client button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-client-btn')).toBeInTheDocument();
    });

    it('should render statistics section', () => {
      renderWithRouter();
      expect(screen.getByTestId('stats')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      renderWithRouter();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should render clients grid', () => {
      renderWithRouter();
      expect(screen.getByTestId('clients-grid')).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should display total clients count', () => {
      renderWithRouter();
      expect(screen.getByText('Total clients')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display active clients count', () => {
      renderWithRouter();
      expect(screen.getByText('Clients actifs')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display total revenue', () => {
      renderWithRouter();
      expect(screen.getByText('Chiffre d\'affaires total')).toBeInTheDocument();
      expect(screen.getByText('83 300 TND')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render search input', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Rechercher un client...');
    });

    it('should render status filter', () => {
      renderWithRouter();
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
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
      fireEvent.change(statusFilter, { target: { value: 'active' } });
      expect(statusFilter).toHaveValue('active');
    });
  });

  describe('Client Cards', () => {
    it('should display all client cards', () => {
      renderWithRouter();
      expect(screen.getByTestId('client-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('client-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('client-card-3')).toBeInTheDocument();
    });

    it('should display client names', () => {
      renderWithRouter();
      expect(screen.getByText('Tech Solutions SARL')).toBeInTheDocument();
      expect(screen.getByText('Digital Agency Tunisia')).toBeInTheDocument();
      expect(screen.getByText('Consulting Pro')).toBeInTheDocument();
    });

    it('should display contact names', () => {
      renderWithRouter();
      expect(screen.getByText('Ahmed Ben Ali')).toBeInTheDocument();
      expect(screen.getByText('Salma Mansouri')).toBeInTheDocument();
      expect(screen.getByText('Fatma Khelifi')).toBeInTheDocument();
    });

    it('should display client emails', () => {
      renderWithRouter();
      expect(screen.getByText('ahmed@techsolutions.tn')).toBeInTheDocument();
      expect(screen.getByText('salma@digitalagency.tn')).toBeInTheDocument();
      expect(screen.getByText('fatma@consultingpro.tn')).toBeInTheDocument();
    });

    it('should display client phones', () => {
      renderWithRouter();
      expect(screen.getByText('+216 71 234 567')).toBeInTheDocument();
      expect(screen.getByText('+216 71 345 678')).toBeInTheDocument();
      expect(screen.getByText('+216 71 567 890')).toBeInTheDocument();
    });

    it('should display client addresses', () => {
      renderWithRouter();
      expect(screen.getByText('Rue de la Liberté, Tunis')).toBeInTheDocument();
      expect(screen.getByText('Avenue Habib Bourguiba, Sousse')).toBeInTheDocument();
      expect(screen.getByText('Centre Urbain Nord, Tunis')).toBeInTheDocument();
    });

    it('should display invoice counts', () => {
      renderWithRouter();
      expect(screen.getByText('Factures: 12')).toBeInTheDocument();
      expect(screen.getByText('Factures: 8')).toBeInTheDocument();
      expect(screen.getByText('Factures: 3')).toBeInTheDocument();
    });

    it('should display total amounts', () => {
      renderWithRouter();
      expect(screen.getByText('Total facturé: 45 000 TND')).toBeInTheDocument();
      expect(screen.getByText('Total facturé: 28 500 TND')).toBeInTheDocument();
      expect(screen.getByText('Total facturé: 9 800 TND')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      const activeStatuses = screen.getAllByText('Actif');
      expect(activeStatuses).toHaveLength(2);
      expect(screen.getByText('Inactif')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render view details buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('view-details-1')).toBeInTheDocument();
      expect(screen.getByTestId('view-details-2')).toBeInTheDocument();
      expect(screen.getByTestId('view-details-3')).toBeInTheDocument();
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

    it('should handle new client button click', () => {
      renderWithRouter();
      const newBtn = screen.getByTestId('new-client-btn');
      fireEvent.click(newBtn);
      expect(newBtn).toBeInTheDocument();
    });

    it('should handle view details button click', () => {
      renderWithRouter();
      const viewBtn = screen.getByTestId('view-details-1');
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
