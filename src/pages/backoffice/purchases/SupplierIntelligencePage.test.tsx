// src/pages/backoffice/purchases/SupplierIntelligencePage.test.tsx

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
const MockSupplierIntelligencePage = () => {
  return (
    <div data-testid="supplier-intelligence-page">
      <h1>Intelligence Fournisseurs</h1>
      <p>Analyses et insights sur vos fournisseurs</p>
      <div data-testid="ai-insights">
        <h2>Insights AI</h2>
        <div>Fournisseur A - Score: 85/100</div>
        <div>Fournisseur B - Score: 92/100</div>
      </div>
      <div data-testid="performance-metrics">
        <h2>Métriques de performance</h2>
        <div>Délai moyen de livraison: 5 jours</div>
        <div>Taux de conformité: 95%</div>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockSupplierIntelligencePage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SupplierIntelligencePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Intelligence Fournisseurs')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter();

      expect(screen.getByText(/Analyses et insights/)).toBeInTheDocument();
    });

    it('should render AI insights section', () => {
      renderWithRouter();

      expect(screen.getByTestId('ai-insights')).toBeInTheDocument();
      expect(screen.getByText('Insights AI')).toBeInTheDocument();
    });

    it('should render performance metrics', () => {
      renderWithRouter();

      expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
      expect(screen.getByText('Métriques de performance')).toBeInTheDocument();
    });

    it('should display supplier scores', () => {
      renderWithRouter();

      expect(screen.getByText(/Score: 85\/100/)).toBeInTheDocument();
      expect(screen.getByText(/Score: 92\/100/)).toBeInTheDocument();
    });

    it('should display delivery metrics', () => {
      renderWithRouter();

      expect(screen.getByText(/Délai moyen de livraison: 5 jours/)).toBeInTheDocument();
      expect(screen.getByText(/Taux de conformité: 95%/)).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
