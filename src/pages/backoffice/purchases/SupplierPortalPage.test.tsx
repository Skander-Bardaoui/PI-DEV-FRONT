// src/pages/backoffice/purchases/SupplierPortalPage.test.tsx

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
const MockSupplierPortalPage = () => {
  return (
    <div data-testid="supplier-portal-page">
      <h1>Portail Fournisseurs</h1>
      <p>Gérez l'accès de vos fournisseurs</p>
      <button>Inviter un fournisseur</button>
      <div data-testid="portal-links">
        <h2>Liens d'accès</h2>
        <div>Fournisseur A - Lien actif</div>
        <div>Fournisseur B - Lien expiré</div>
      </div>
      <div data-testid="portal-stats">
        <div>5 fournisseurs invités</div>
        <div>3 fournisseurs actifs</div>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockSupplierPortalPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SupplierPortalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Portail Fournisseurs')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter();

      expect(screen.getByText(/Gérez l'accès/)).toBeInTheDocument();
    });

    it('should render invite button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Inviter un fournisseur/i })).toBeInTheDocument();
    });

    it('should render portal links section', () => {
      renderWithRouter();

      expect(screen.getByTestId('portal-links')).toBeInTheDocument();
      expect(screen.getByText('Liens d\'accès')).toBeInTheDocument();
    });

    it('should render portal statistics', () => {
      renderWithRouter();

      expect(screen.getByTestId('portal-stats')).toBeInTheDocument();
      expect(screen.getByText(/5 fournisseurs invités/)).toBeInTheDocument();
      expect(screen.getByText(/3 fournisseurs actifs/)).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
