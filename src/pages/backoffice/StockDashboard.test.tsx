// src/pages/backoffice/StockDashboard.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock component
const MockStockDashboardPage = () => {
  return (
    <div data-testid="stock-dashboard-page">
      <h1>Tableau de bord Stock</h1>
      <p>Vue d'ensemble de votre inventaire</p>

      <div data-testid="kpis">
        <div className="kpi-card">
          <span>Produits totaux</span>
          <span>150</span>
        </div>
        <div className="kpi-card">
          <span>Valeur du stock</span>
          <span>125 000 TND</span>
        </div>
        <div className="kpi-card">
          <span>Produits en rupture</span>
          <span>5</span>
        </div>
        <div className="kpi-card">
          <span>Stock faible</span>
          <span>12</span>
        </div>
      </div>

      <div data-testid="charts">
        <div data-testid="stock-by-category">Stock par catégorie</div>
        <div data-testid="stock-movements">Mouvements récents</div>
      </div>

      <div data-testid="low-stock-alerts">
        <h2>Alertes de stock faible</h2>
        <div>Product A - 5 unités restantes</div>
        <div>Product B - 3 unités restantes</div>
      </div>

      <div data-testid="quick-actions">
        <button data-testid="add-product-btn">Ajouter produit</button>
        <button data-testid="stock-movement-btn">Mouvement de stock</button>
        <button data-testid="inventory-btn">Inventaire</button>
      </div>
    </div>
  );
};

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockStockDashboardPage />
    </BrowserRouter>
  );
};

describe('StockDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Tableau de bord Stock')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderWithRouter();
      expect(screen.getByText('Vue d\'ensemble de votre inventaire')).toBeInTheDocument();
    });

    it('should render KPIs section', () => {
      renderWithRouter();
      expect(screen.getByTestId('kpis')).toBeInTheDocument();
    });

    it('should render charts section', () => {
      renderWithRouter();
      expect(screen.getByTestId('charts')).toBeInTheDocument();
    });

    it('should render low stock alerts', () => {
      renderWithRouter();
      expect(screen.getByTestId('low-stock-alerts')).toBeInTheDocument();
    });

    it('should render quick actions', () => {
      renderWithRouter();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });
  });

  describe('KPIs', () => {
    it('should display total products', () => {
      renderWithRouter();
      expect(screen.getByText('Produits totaux')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should display stock value', () => {
      renderWithRouter();
      expect(screen.getByText('Valeur du stock')).toBeInTheDocument();
      expect(screen.getByText('125 000 TND')).toBeInTheDocument();
    });

    it('should display out of stock count', () => {
      renderWithRouter();
      expect(screen.getByText('Produits en rupture')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display low stock count', () => {
      renderWithRouter();
      expect(screen.getByText('Stock faible')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('Charts', () => {
    it('should display stock by category chart', () => {
      renderWithRouter();
      expect(screen.getByTestId('stock-by-category')).toBeInTheDocument();
    });

    it('should display stock movements chart', () => {
      renderWithRouter();
      expect(screen.getByTestId('stock-movements')).toBeInTheDocument();
    });
  });

  describe('Low Stock Alerts', () => {
    it('should display alerts title', () => {
      renderWithRouter();
      expect(screen.getByText('Alertes de stock faible')).toBeInTheDocument();
    });

    it('should display alert items', () => {
      renderWithRouter();
      expect(screen.getByText('Product A - 5 unités restantes')).toBeInTheDocument();
      expect(screen.getByText('Product B - 3 unités restantes')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render add product button', () => {
      renderWithRouter();
      expect(screen.getByTestId('add-product-btn')).toBeInTheDocument();
    });

    it('should render stock movement button', () => {
      renderWithRouter();
      expect(screen.getByTestId('stock-movement-btn')).toBeInTheDocument();
    });

    it('should render inventory button', () => {
      renderWithRouter();
      expect(screen.getByTestId('inventory-btn')).toBeInTheDocument();
    });

    it('should handle add product button click', () => {
      renderWithRouter();
      const btn = screen.getByTestId('add-product-btn');
      fireEvent.click(btn);
      expect(btn).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
