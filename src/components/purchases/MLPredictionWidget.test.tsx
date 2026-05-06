import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MLPredictionWidget from './MLPredictionWidget';
import { BrowserRouter } from 'react-router-dom';

const mockRecommendations = {
  total_recommendations: 10,
  urgent_count: 3,
  total_estimated_value: 5000,
  recommendations: [
    {
      product_id: 'prod-1',
      product_name: 'Product 1',
      predicted_quantity: 50,
      days_until_order: 2,
      urgency_level: 'urgent',
    },
    {
      product_id: 'prod-2',
      product_name: 'Product 2',
      predicted_quantity: 30,
      days_until_order: 5,
      urgency_level: 'urgent',
    },
    {
      product_id: 'prod-3',
      product_name: 'Product 3',
      predicted_quantity: 20,
      days_until_order: 1,
      urgency_level: 'urgent',
    },
    {
      product_id: 'prod-4',
      product_name: 'Product 4',
      predicted_quantity: 40,
      days_until_order: 3,
      urgency_level: 'urgent',
    },
  ],
};

vi.mock('../../hooks/useMLPredictions', () => ({
  useMLRecommendations: vi.fn(() => ({
    data: mockRecommendations,
    isLoading: false,
    error: null,
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MLPredictionWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render widget with title', () => {
    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText('Prédictions ML')).toBeInTheDocument();
  });

  it('should display statistics', () => {
    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Valeur')).toBeInTheDocument();
    expect(screen.getByText('5000 TND')).toBeInTheDocument();
  });

  it('should display urgent recommendations', () => {
    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText(/Commandes urgentes \(4\)/)).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Product 3')).toBeInTheDocument();
  });

  it('should display "Voir tout" link', () => {
    renderWithRouter(<MLPredictionWidget />);

    const link = screen.getByText('Voir tout');
    expect(link).toHaveAttribute('href', '/backoffice/purchases/ml-predictions');
  });

  it('should display loading state', () => {
    const { useMLRecommendations } = require('../../hooks/useMLPredictions');
    useMLRecommendations.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should display error state', () => {
    const { useMLRecommendations } = require('../../hooks/useMLPredictions');
    useMLRecommendations.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API Error'),
    });

    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText('Service ML indisponible')).toBeInTheDocument();
  });

  it('should display empty state when no urgent recommendations', () => {
    const { useMLRecommendations } = require('../../hooks/useMLPredictions');
    useMLRecommendations.mockReturnValue({
      data: {
        total_recommendations: 5,
        urgent_count: 0,
        total_estimated_value: 1000,
        recommendations: [],
      },
      isLoading: false,
      error: null,
    });

    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText('Aucune commande urgente')).toBeInTheDocument();
  });

  it('should limit displayed recommendations to 3', () => {
    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Product 3')).toBeInTheDocument();
    expect(screen.queryByText('Product 4')).not.toBeInTheDocument();
  });

  it('should show link to view more recommendations', () => {
    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText(/Voir 1 autres urgentes/)).toBeInTheDocument();
  });

  it('should display days until order for each recommendation', () => {
    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText(/2j/)).toBeInTheDocument();
    expect(screen.getByText(/5j/)).toBeInTheDocument();
    expect(screen.getByText(/1j/)).toBeInTheDocument();
  });

  it('should display predicted quantity for each recommendation', () => {
    renderWithRouter(<MLPredictionWidget />);

    expect(screen.getByText(/Commander 50 unités/)).toBeInTheDocument();
    expect(screen.getByText(/Commander 30 unités/)).toBeInTheDocument();
    expect(screen.getByText(/Commander 20 unités/)).toBeInTheDocument();
  });
});
