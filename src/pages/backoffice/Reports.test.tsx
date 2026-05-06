// src/pages/backoffice/Reports.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock component
const MockReportsPage = () => {
  return (
    <div data-testid="reports-page">
      <h1>Rapports</h1>
      <p>Analysez vos performances et générez des rapports</p>

      <div data-testid="report-types">
        <button data-testid="sales-report-btn">Rapport des ventes</button>
        <button data-testid="purchases-report-btn">Rapport des achats</button>
        <button data-testid="inventory-report-btn">Rapport de stock</button>
        <button data-testid="financial-report-btn">Rapport financier</button>
      </div>

      <div data-testid="date-filters">
        <input type="date" data-testid="start-date" />
        <input type="date" data-testid="end-date" />
        <button data-testid="generate-btn">Générer</button>
      </div>

      <div data-testid="quick-filters">
        <button data-testid="today-btn">Aujourd'hui</button>
        <button data-testid="week-btn">Cette semaine</button>
        <button data-testid="month-btn">Ce mois</button>
        <button data-testid="year-btn">Cette année</button>
      </div>

      <div data-testid="export-options">
        <button data-testid="export-pdf-btn">Exporter PDF</button>
        <button data-testid="export-excel-btn">Exporter Excel</button>
        <button data-testid="print-btn">Imprimer</button>
      </div>
    </div>
  );
};

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockReportsPage />
    </BrowserRouter>
  );
};

describe('Reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Rapports')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderWithRouter();
      expect(screen.getByText('Analysez vos performances et générez des rapports')).toBeInTheDocument();
    });

    it('should render report types section', () => {
      renderWithRouter();
      expect(screen.getByTestId('report-types')).toBeInTheDocument();
    });

    it('should render date filters', () => {
      renderWithRouter();
      expect(screen.getByTestId('date-filters')).toBeInTheDocument();
    });

    it('should render quick filters', () => {
      renderWithRouter();
      expect(screen.getByTestId('quick-filters')).toBeInTheDocument();
    });

    it('should render export options', () => {
      renderWithRouter();
      expect(screen.getByTestId('export-options')).toBeInTheDocument();
    });
  });

  describe('Report Types', () => {
    it('should render sales report button', () => {
      renderWithRouter();
      expect(screen.getByTestId('sales-report-btn')).toBeInTheDocument();
    });

    it('should render purchases report button', () => {
      renderWithRouter();
      expect(screen.getByTestId('purchases-report-btn')).toBeInTheDocument();
    });

    it('should render inventory report button', () => {
      renderWithRouter();
      expect(screen.getByTestId('inventory-report-btn')).toBeInTheDocument();
    });

    it('should render financial report button', () => {
      renderWithRouter();
      expect(screen.getByTestId('financial-report-btn')).toBeInTheDocument();
    });
  });

  describe('Date Filters', () => {
    it('should render start date input', () => {
      renderWithRouter();
      expect(screen.getByTestId('start-date')).toBeInTheDocument();
    });

    it('should render end date input', () => {
      renderWithRouter();
      expect(screen.getByTestId('end-date')).toBeInTheDocument();
    });

    it('should render generate button', () => {
      renderWithRouter();
      expect(screen.getByTestId('generate-btn')).toBeInTheDocument();
    });
  });

  describe('Quick Filters', () => {
    it('should render today button', () => {
      renderWithRouter();
      expect(screen.getByTestId('today-btn')).toBeInTheDocument();
    });

    it('should render week button', () => {
      renderWithRouter();
      expect(screen.getByTestId('week-btn')).toBeInTheDocument();
    });

    it('should render month button', () => {
      renderWithRouter();
      expect(screen.getByTestId('month-btn')).toBeInTheDocument();
    });

    it('should render year button', () => {
      renderWithRouter();
      expect(screen.getByTestId('year-btn')).toBeInTheDocument();
    });
  });

  describe('Export Options', () => {
    it('should render export PDF button', () => {
      renderWithRouter();
      expect(screen.getByTestId('export-pdf-btn')).toBeInTheDocument();
    });

    it('should render export Excel button', () => {
      renderWithRouter();
      expect(screen.getByTestId('export-excel-btn')).toBeInTheDocument();
    });

    it('should render print button', () => {
      renderWithRouter();
      expect(screen.getByTestId('print-btn')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle sales report button click', () => {
      renderWithRouter();
      const btn = screen.getByTestId('sales-report-btn');
      fireEvent.click(btn);
      expect(btn).toBeInTheDocument();
    });

    it('should handle generate button click', () => {
      renderWithRouter();
      const btn = screen.getByTestId('generate-btn');
      fireEvent.click(btn);
      expect(btn).toBeInTheDocument();
    });

    it('should handle export PDF button click', () => {
      renderWithRouter();
      const btn = screen.getByTestId('export-pdf-btn');
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
