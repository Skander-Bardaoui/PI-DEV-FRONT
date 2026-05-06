import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AiForecastPanel } from './AiForecastPanel';
import { useQuery } from '@tanstack/react-query';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

describe('AiForecastPanel', () => {
  const mockForecastData = {
    predictedRevenue: 15000,
    confidence: 'HIGH' as const,
    churnRisks: [
      {
        clientId: 'client-1',
        clientName: 'Client A',
        lastOrderDate: '2024-01-01',
        orderFrequencyDrop: 50,
        riskLevel: 'HIGH',
      },
    ],
    summary: 'Revenue expected to increase by 20%',
    recommendations: [
      'Contact at-risk clients',
      'Offer promotions to inactive customers',
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should render forecast data correctly', () => {
    (useQuery as any).mockReturnValue({
      data: mockForecastData,
      isLoading: false,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.getByText('Prévisions IA')).toBeInTheDocument();
    expect(screen.getByText('15000.000 DT')).toBeInTheDocument();
    expect(screen.getByText('Haute confiance')).toBeInTheDocument();
  });

  it('should display summary', () => {
    (useQuery as any).mockReturnValue({
      data: mockForecastData,
      isLoading: false,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.getByText('Revenue expected to increase by 20%')).toBeInTheDocument();
  });

  it('should display churn risks', () => {
    (useQuery as any).mockReturnValue({
      data: mockForecastData,
      isLoading: false,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.getByText('Clients à risque')).toBeInTheDocument();
    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('-50%')).toBeInTheDocument();
  });

  it('should display recommendations', () => {
    (useQuery as any).mockReturnValue({
      data: mockForecastData,
      isLoading: false,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.getByText('Recommandations')).toBeInTheDocument();
    expect(screen.getByText('Contact at-risk clients')).toBeInTheDocument();
    expect(screen.getByText('Offer promotions to inactive customers')).toBeInTheDocument();
  });

  it('should show error state', () => {
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.getByText('Prévisions IA non disponibles')).toBeInTheDocument();
    expect(screen.getByText(/GEMINI_API_KEY/)).toBeInTheDocument();
  });

  it('should display confidence badge with correct color', () => {
    (useQuery as any).mockReturnValue({
      data: { ...mockForecastData, confidence: 'MEDIUM' },
      isLoading: false,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.getByText('Confiance moyenne')).toBeInTheDocument();
  });

  it('should format last order date correctly', () => {
    (useQuery as any).mockReturnValue({
      data: mockForecastData,
      isLoading: false,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
  });

  it('should not render churn risks section when empty', () => {
    (useQuery as any).mockReturnValue({
      data: { ...mockForecastData, churnRisks: [] },
      isLoading: false,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.queryByText('Clients à risque')).not.toBeInTheDocument();
  });

  it('should not render recommendations section when empty', () => {
    (useQuery as any).mockReturnValue({
      data: { ...mockForecastData, recommendations: [] },
      isLoading: false,
      isError: false,
    });

    render(<AiForecastPanel businessId="business-1" />);

    expect(screen.queryByText('Recommandations')).not.toBeInTheDocument();
  });
});
