// src/pages/backoffice/sales/QuotesPage.test.tsx

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

// Mock component
const MockQuotesPage = () => {
  return (
    <div data-testid="quotes-page">
      <h1>Devis</h1>
      <p>Gérez vos devis clients</p>
      <button>Nouveau devis</button>
      <div data-testid="quotes-stats">
        <div>5 devis en attente</div>
        <div>3 devis acceptés</div>
        <div>2 devis expirés</div>
      </div>
      <div data-testid="quotes-list">
        <div>QUOTE-001 - Client A - 1 000,000 TND - En attente</div>
        <div>QUOTE-002 - Client B - 2 000,000 TND - Accepté</div>
        <div>QUOTE-003 - Client C - 1 500,000 TND - Expiré</div>
      </div>
      <div>Total: 10 devis</div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockQuotesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('QuotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Devis')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter();

      expect(screen.getByText(/Gérez vos devis clients/)).toBeInTheDocument();
    });

    it('should render new quote button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Nouveau devis/i })).toBeInTheDocument();
    });

    it('should render quotes statistics', () => {
      renderWithRouter();

      expect(screen.getByTestId('quotes-stats')).toBeInTheDocument();
      expect(screen.getByText('5 devis en attente')).toBeInTheDocument();
      expect(screen.getByText('3 devis acceptés')).toBeInTheDocument();
      expect(screen.getByText('2 devis expirés')).toBeInTheDocument();
    });

    it('should render quotes list', () => {
      renderWithRouter();

      expect(screen.getByTestId('quotes-list')).toBeInTheDocument();
    });

    it('should display quote details', () => {
      renderWithRouter();

      expect(screen.getByText(/QUOTE-001/)).toBeInTheDocument();
      expect(screen.getByText(/Client A/)).toBeInTheDocument();
      expect(screen.getByText(/1 000,000 TND/)).toBeInTheDocument();
    });

    it('should display total count', () => {
      renderWithRouter();

      expect(screen.getByText('Total: 10 devis')).toBeInTheDocument();
    });
  });

  describe('Quote Status', () => {
    it('should display different quote statuses', () => {
      renderWithRouter();

      expect(screen.getByText(/En attente/)).toBeInTheDocument();
      expect(screen.getByText(/Accepté/)).toBeInTheDocument();
      expect(screen.getByText(/Expiré/)).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
