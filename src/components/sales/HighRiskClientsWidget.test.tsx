import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HighRiskClientsWidget } from './HighRiskClientsWidget';
import { useHighRiskClients } from '../../hooks/useSalesML';

vi.mock('../../hooks/useSalesML', () => ({
  useHighRiskClients: vi.fn(),
}));

describe('HighRiskClientsWidget', () => {
  const mockClients = [
    {
      client_id: 'client-1',
      churn_risk_score: 0.85,
      risk_level: 'high',
      days_since_last_purchase: 45,
      average_purchase_interval: 30,
      purchase_frequency_per_month: 2.5,
      recommendation: 'Contact immediately to prevent churn',
    },
    {
      client_id: 'client-2',
      churn_risk_score: 0.65,
      risk_level: 'medium',
      days_since_last_purchase: 30,
      average_purchase_interval: 25,
      purchase_frequency_per_month: 3.0,
      recommendation: 'Send promotional offer',
    },
    {
      client_id: 'client-3',
      churn_risk_score: 0.45,
      risk_level: 'low',
      days_since_last_purchase: 15,
      average_purchase_interval: 20,
      purchase_frequency_per_month: 4.0,
      recommendation: 'Monitor activity',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should render clients correctly', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('Clients à Risque (IA)')).toBeInTheDocument();
    expect(screen.getByText(/client-1/)).toBeInTheDocument();
    expect(screen.getByText(/client-2/)).toBeInTheDocument();
  });

  it('should display risk levels correctly', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('Risque élevé')).toBeInTheDocument();
    expect(screen.getByText('Risque moyen')).toBeInTheDocument();
    expect(screen.getByText('Risque faible')).toBeInTheDocument();
  });

  it('should display churn risk scores', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('Score: 85%')).toBeInTheDocument();
    expect(screen.getByText('Score: 65%')).toBeInTheDocument();
  });

  it('should display days since last purchase', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText(/45 jours d'inactivité/)).toBeInTheDocument();
    expect(screen.getByText(/30 jours d'inactivité/)).toBeInTheDocument();
  });

  it('should display recommendations', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('Contact immediately to prevent churn')).toBeInTheDocument();
    expect(screen.getByText('Send promotional offer')).toBeInTheDocument();
  });

  it('should display purchase metrics', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText(/Intervalle moyen: 30 jours/)).toBeInTheDocument();
    expect(screen.getByText(/Fréquence: 2\.5\/mois/)).toBeInTheDocument();
  });

  it('should show count badges for high and medium risk', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('1 urgent')).toBeInTheDocument();
    expect(screen.getByText('1 moyen')).toBeInTheDocument();
  });

  it('should show message when no clients at risk', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('Aucun client à risque détecté')).toBeInTheDocument();
    expect(screen.getByText('Tous vos clients sont actifs')).toBeInTheDocument();
  });

  it('should show error state', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('ML service unavailable'),
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('Analyse de churn non disponible')).toBeInTheDocument();
    expect(screen.getByText(/Service ML indisponible/)).toBeInTheDocument();
  });

  it('should limit display to 10 clients', () => {
    const manyClients = Array.from({ length: 15 }, (_, i) => ({
      ...mockClients[0],
      client_id: `client-${i}`,
    }));

    (useHighRiskClients as any).mockReturnValue({
      data: manyClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('Affichage de 10 clients sur 15')).toBeInTheDocument();
  });

  it('should not show limit message when 10 or fewer clients', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.queryByText(/Affichage de/)).not.toBeInTheDocument();
  });

  it('should handle null data gracefully', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    expect(screen.getByText('Aucun client à risque détecté')).toBeInTheDocument();
  });

  it('should display client IDs truncated', () => {
    (useHighRiskClients as any).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
    });

    render(<HighRiskClientsWidget businessId="business-1" />);

    // Client IDs should be truncated to first 8 characters
    expect(screen.getByText(/Client client-1/)).toBeInTheDocument();
  });
});
