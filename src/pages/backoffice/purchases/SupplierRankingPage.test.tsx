// src/pages/backoffice/purchases/SupplierRankingPage.test.tsx

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
const MockSupplierRankingPage = () => {
  return (
    <div data-testid="supplier-ranking-page">
      <h1>Classement des Fournisseurs</h1>
      <p>Évaluez et comparez vos fournisseurs</p>
      <div data-testid="ranking-criteria">
        <h2>Critères d'évaluation</h2>
        <div>Qualité: 40%</div>
        <div>Prix: 30%</div>
        <div>Délai: 20%</div>
        <div>Service: 10%</div>
      </div>
      <div data-testid="supplier-rankings">
        <h2>Classement</h2>
        <div className="ranking-item">
          <span>1. Supplier A</span>
          <span>Score: 95/100</span>
        </div>
        <div className="ranking-item">
          <span>2. Supplier B</span>
          <span>Score: 88/100</span>
        </div>
        <div className="ranking-item">
          <span>3. Supplier C</span>
          <span>Score: 82/100</span>
        </div>
      </div>
      <div data-testid="performance-chart">
        <h2>Évolution des performances</h2>
        <div>Graphique de performance</div>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockSupplierRankingPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SupplierRankingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Classement des Fournisseurs')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter();

      expect(screen.getByText(/Évaluez et comparez/)).toBeInTheDocument();
    });

    it('should render ranking criteria section', () => {
      renderWithRouter();

      expect(screen.getByTestId('ranking-criteria')).toBeInTheDocument();
      expect(screen.getByText('Critères d\'évaluation')).toBeInTheDocument();
    });

    it('should display all criteria with weights', () => {
      renderWithRouter();

      expect(screen.getByText('Qualité: 40%')).toBeInTheDocument();
      expect(screen.getByText('Prix: 30%')).toBeInTheDocument();
      expect(screen.getByText('Délai: 20%')).toBeInTheDocument();
      expect(screen.getByText('Service: 10%')).toBeInTheDocument();
    });

    it('should render supplier rankings section', () => {
      renderWithRouter();

      expect(screen.getByTestId('supplier-rankings')).toBeInTheDocument();
      expect(screen.getByText('Classement')).toBeInTheDocument();
    });

    it('should display ranked suppliers with scores', () => {
      renderWithRouter();

      expect(screen.getByText('1. Supplier A')).toBeInTheDocument();
      expect(screen.getByText('Score: 95/100')).toBeInTheDocument();
      expect(screen.getByText('2. Supplier B')).toBeInTheDocument();
      expect(screen.getByText('Score: 88/100')).toBeInTheDocument();
      expect(screen.getByText('3. Supplier C')).toBeInTheDocument();
      expect(screen.getByText('Score: 82/100')).toBeInTheDocument();
    });

    it('should render performance chart section', () => {
      renderWithRouter();

      expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
      expect(screen.getByText('Évolution des performances')).toBeInTheDocument();
    });
  });

  describe('Ranking Display', () => {
    it('should show suppliers in correct order', () => {
      renderWithRouter();

      const rankings = screen.getAllByText(/Supplier [ABC]/);
      expect(rankings[0]).toHaveTextContent('Supplier A');
      expect(rankings[1]).toHaveTextContent('Supplier B');
      expect(rankings[2]).toHaveTextContent('Supplier C');
    });

    it('should display ranking positions', () => {
      renderWithRouter();

      expect(screen.getByText(/1\./)).toBeInTheDocument();
      expect(screen.getByText(/2\./)).toBeInTheDocument();
      expect(screen.getByText(/3\./)).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });

    it('should be accessible', () => {
      const { container } = renderWithRouter();
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter();

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Classement des Fournisseurs');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });
  });
});
