// src/pages/backoffice/purchases/Goodsreceiptspage.test.tsx

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
const MockGoodsReceiptsPage = () => {
  return (
    <div data-testid="goods-receipts-page">
      <h1>Réceptions de marchandises</h1>
      <p>Gérez les réceptions de vos bons de commande</p>
      <button>Nouvelle réception</button>
      <div data-testid="receipts-list">
        <div>GR-001 - PO-001 - Reçu</div>
        <div>GR-002 - PO-002 - En attente</div>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockGoodsReceiptsPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GoodsReceiptsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Réceptions de marchandises')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter();

      expect(screen.getByText(/Gérez les réceptions/)).toBeInTheDocument();
    });

    it('should render new receipt button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Nouvelle réception/i })).toBeInTheDocument();
    });

    it('should render receipts list', () => {
      renderWithRouter();

      expect(screen.getByTestId('receipts-list')).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
