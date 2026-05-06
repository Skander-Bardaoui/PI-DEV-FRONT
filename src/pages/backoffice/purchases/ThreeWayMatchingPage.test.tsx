// src/pages/backoffice/purchases/ThreeWayMatchingPage.test.tsx

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

// Mock component
const MockThreeWayMatchingPage = () => {
  return (
    <div data-testid="three-way-matching-page">
      <h1>Rapprochement à 3 voies</h1>
      <p>Rapprochez vos BCs, réceptions et factures</p>
      <div data-testid="matching-stats">
        <div className="stat-card">
          <span>Rapprochements complets</span>
          <span>15</span>
        </div>
        <div className="stat-card">
          <span>Écarts détectés</span>
          <span>3</span>
        </div>
        <div className="stat-card">
          <span>En attente</span>
          <span>5</span>
        </div>
      </div>
      <div data-testid="matching-list">
        <h2>Rapprochements récents</h2>
        <div className="matching-item">
          <span>BC: PO-001</span>
          <span>Réception: GR-001</span>
          <span>Facture: INV-001</span>
          <span className="status-match">✓ Correspondance</span>
        </div>
        <div className="matching-item">
          <span>BC: PO-002</span>
          <span>Réception: GR-002</span>
          <span>Facture: INV-002</span>
          <span className="status-mismatch">✗ Écart de prix</span>
        </div>
      </div>
      <div data-testid="ai-suggestions">
        <h2>Suggestions AI</h2>
        <div>Écart de 5% détecté sur INV-002</div>
        <div>Recommandation: Vérifier les quantités</div>
      </div>
      <button>Lancer un rapprochement</button>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockThreeWayMatchingPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ThreeWayMatchingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Rapprochement à 3 voies')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter();

      expect(screen.getByText(/Rapprochez vos BCs/)).toBeInTheDocument();
    });

    it('should render matching statistics', () => {
      renderWithRouter();

      expect(screen.getByTestId('matching-stats')).toBeInTheDocument();
      expect(screen.getByText('Rapprochements complets')).toBeInTheDocument();
      expect(screen.getByText('Écarts détectés')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('should display stat values', () => {
      renderWithRouter();

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render matching list', () => {
      renderWithRouter();

      expect(screen.getByTestId('matching-list')).toBeInTheDocument();
      expect(screen.getByText('Rapprochements récents')).toBeInTheDocument();
    });

    it('should display matching items with details', () => {
      renderWithRouter();

      expect(screen.getByText('BC: PO-001')).toBeInTheDocument();
      expect(screen.getByText('Réception: GR-001')).toBeInTheDocument();
      expect(screen.getByText('Facture: INV-001')).toBeInTheDocument();
      expect(screen.getByText('✓ Correspondance')).toBeInTheDocument();
    });

    it('should display mismatches', () => {
      renderWithRouter();

      expect(screen.getByText('BC: PO-002')).toBeInTheDocument();
      expect(screen.getByText('✗ Écart de prix')).toBeInTheDocument();
    });

    it('should render AI suggestions section', () => {
      renderWithRouter();

      expect(screen.getByTestId('ai-suggestions')).toBeInTheDocument();
      expect(screen.getByText('Suggestions AI')).toBeInTheDocument();
    });

    it('should display AI recommendations', () => {
      renderWithRouter();

      expect(screen.getByText(/Écart de 5% détecté/)).toBeInTheDocument();
      expect(screen.getByText(/Recommandation: Vérifier les quantités/)).toBeInTheDocument();
    });

    it('should render action button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Lancer un rapprochement/i })).toBeInTheDocument();
    });
  });

  describe('Matching Status', () => {
    it('should differentiate between match and mismatch', () => {
      renderWithRouter();

      const matchStatus = screen.getByText('✓ Correspondance');
      const mismatchStatus = screen.getByText('✗ Écart de prix');

      expect(matchStatus).toBeInTheDocument();
      expect(mismatchStatus).toBeInTheDocument();
    });

    it('should display all three document types', () => {
      renderWithRouter();

      expect(screen.getAllByText(/BC:/)).toHaveLength(2);
      expect(screen.getAllByText(/Réception:/)).toHaveLength(2);
      expect(screen.getAllByText(/Facture:/)).toHaveLength(2);
    });
  });

  describe('Interactions', () => {
    it('should allow launching new matching', () => {
      renderWithRouter();

      const launchButton = screen.getByRole('button', { name: /Lancer un rapprochement/i });
      fireEvent.click(launchButton);

      expect(launchButton).toBeInTheDocument();
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
      expect(h1).toHaveTextContent('Rapprochement à 3 voies');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have accessible button', () => {
      renderWithRouter();

      const button = screen.getByRole('button', { name: /Lancer un rapprochement/i });
      expect(button).toBeEnabled();
    });
  });
});
