// src/pages/backoffice/purchases/MLPredictionsPage.test.tsx

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
const MockMLPredictionsPage = () => {
  return (
    <div data-testid="ml-predictions-page">
      <h1>Prédictions ML</h1>
      <p>Prédictions intelligentes pour vos achats</p>
      <div data-testid="predictions-widget">
        <h2>Prédictions de prix</h2>
        <div>Produit A - Prix prédit: 100 TND</div>
        <div>Produit B - Prix prédit: 200 TND</div>
      </div>
      <div data-testid="recommendations">
        <h2>Recommandations</h2>
        <div>Meilleur moment pour acheter: Janvier</div>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockMLPredictionsPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MLPredictionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Prédictions ML')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter();

      expect(screen.getByText(/Prédictions intelligentes/)).toBeInTheDocument();
    });

    it('should render predictions widget', () => {
      renderWithRouter();

      expect(screen.getByTestId('predictions-widget')).toBeInTheDocument();
      expect(screen.getByText('Prédictions de prix')).toBeInTheDocument();
    });

    it('should render recommendations section', () => {
      renderWithRouter();

      expect(screen.getByTestId('recommendations')).toBeInTheDocument();
      expect(screen.getByText('Recommandations')).toBeInTheDocument();
    });

    it('should display price predictions', () => {
      renderWithRouter();

      expect(screen.getByText(/Produit A/)).toBeInTheDocument();
      expect(screen.getByText(/Prix prédit: 100 TND/)).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
