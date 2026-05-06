import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SalesForecastWidget } from './SalesForecastWidget';

// Mock hook
vi.mock('../../hooks/useSalesML', () => ({
  useSalesForecast: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

const mockForecast = {
  predicted_sales: 50000,
  predicted_daily_avg: 1666.67,
  current_daily_avg: 1500,
  growth_rate: 11.1,
  confidence: 0.85,
  trend: 'increasing' as const,
  best_selling_days: ['Lundi', 'Mercredi', 'Vendredi'],
  seasonality_detected: true,
  recommendation: 'Augmentez votre stock pour répondre à la demande croissante',
};

describe('SalesForecastWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner', () => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<SalesForecastWidget businessId="biz-1" />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message', () => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
      });

      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('Prévisions IA non disponibles')).toBeInTheDocument();
      expect(screen.getByText(/Données insuffisantes/i)).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: mockForecast,
        isLoading: false,
        error: null,
      });
    });

    it('should display forecast title with days', () => {
      render(<SalesForecastWidget businessId="biz-1" forecastDays={30} />);
      expect(screen.getByText(/Prévisions IA - 30 jours/i)).toBeInTheDocument();
    });

    it('should display predicted sales', () => {
      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('CA Prévu')).toBeInTheDocument();
      expect(screen.getByText(/50 000/)).toBeInTheDocument();
    });

    it('should display current daily average', () => {
      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('CA Actuel')).toBeInTheDocument();
      expect(screen.getByText(/1 500/)).toBeInTheDocument();
    });

    it('should display growth rate', () => {
      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('Taux de croissance')).toBeInTheDocument();
      expect(screen.getByText('+11.1%')).toBeInTheDocument();
    });

    it('should display confidence percentage', () => {
      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('Confiance de la prédiction')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should display best selling days', () => {
      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText(/Meilleurs jours:/i)).toBeInTheDocument();
      expect(screen.getByText(/Lundi, Mercredi, Vendredi/i)).toBeInTheDocument();
    });

    it('should display seasonality alert when detected', () => {
      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('Saisonnalité détectée dans les ventes')).toBeInTheDocument();
    });

    it('should display recommendation', () => {
      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('Recommandation:')).toBeInTheDocument();
      expect(screen.getByText(mockForecast.recommendation)).toBeInTheDocument();
    });
  });

  describe('Trend Display', () => {
    it('should show increasing trend', () => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: { ...mockForecast, trend: 'increasing' },
        isLoading: false,
        error: null,
      });

      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('En hausse')).toBeInTheDocument();
    });

    it('should show decreasing trend', () => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: { ...mockForecast, trend: 'decreasing', growth_rate: -5.5 },
        isLoading: false,
        error: null,
      });

      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('En baisse')).toBeInTheDocument();
      expect(screen.getByText('-5.5%')).toBeInTheDocument();
    });

    it('should show stable trend', () => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: { ...mockForecast, trend: 'stable' },
        isLoading: false,
        error: null,
      });

      render(<SalesForecastWidget businessId="biz-1" />);
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });
  });

  describe('Confidence Colors', () => {
    it('should show green for high confidence', () => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: { ...mockForecast, confidence: 0.85 },
        isLoading: false,
        error: null,
      });

      render(<SalesForecastWidget businessId="biz-1" />);
      const confidenceText = screen.getByText('85%');
      expect(confidenceText).toHaveClass('text-green-600');
    });

    it('should show amber for medium confidence', () => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: { ...mockForecast, confidence: 0.6 },
        isLoading: false,
        error: null,
      });

      render(<SalesForecastWidget businessId="biz-1" />);
      const confidenceText = screen.getByText('60%');
      expect(confidenceText).toHaveClass('text-amber-600');
    });

    it('should show red for low confidence', () => {
      const { useSalesForecast } = require('../../hooks/useSalesML');
      vi.mocked(useSalesForecast).mockReturnValue({
        data: { ...mockForecast, confidence: 0.4 },
        isLoading: false,
        error: null,
      });

      render(<SalesForecastWidget businessId="biz-1" />);
      const confidenceText = screen.getByText('40%');
      expect(confidenceText).toHaveClass('text-red-600');
    });
  });
});
