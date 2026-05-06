import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierAIInsightsModal from './SupplierAIInsightsModal';
import axiosInstance from '../../api/axiosInstance';

vi.mock('../../api/axiosInstance');

describe('SupplierAIInsightsModal', () => {
  const mockOnClose = vi.fn();

  const mockInsights = {
    supplier_name: 'Test Supplier',
    analysis_date: '2026-05-01T10:00:00Z',
    risk_prediction: {
      risk_level: 'low' as const,
      risk_score: 25,
      risk_factors: ['Good payment history', 'Reliable delivery'],
      predicted_issues: [],
      confidence: 85,
    },
    recommendations: [
      {
        priority: 'high' as const,
        action_type: 'negotiate',
        title: 'Negotiate better prices',
        description: 'Current prices are 10% above market average',
        expected_impact: 'Save 5000 TND annually',
        estimated_savings: 5000,
      },
    ],
    patterns: [
      {
        pattern_type: 'delivery',
        title: 'Consistent delivery times',
        description: 'Average delivery time is 3 days',
        severity: 'info' as const,
        data_points: ['3 days average', '95% on-time'],
      },
    ],
    benchmarks: [
      {
        metric: 'Price Competitiveness',
        supplier_value: 105,
        industry_average: 100,
        top_quartile: 95,
        performance: 'average',
        gap_analysis: '5% above market average',
      },
    ],
    ai_summary: 'This supplier is reliable with good delivery times but prices could be negotiated.',
    analysis_confidence: 85,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render AI insights modal', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Analyse IA du Fournisseur')).toBeInTheDocument();
      expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (axiosInstance.get as any).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Analyse en cours...')).toBeInTheDocument();
  });

  it('should display AI summary', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/This supplier is reliable with good delivery times/)
      ).toBeInTheDocument();
      expect(screen.getByText('Confiance: 85%')).toBeInTheDocument();
    });
  });

  it('should display risk level', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Niveau de Risque')).toBeInTheDocument();
      expect(screen.getByText('Faible')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  it('should display recommendations', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Actions Recommandées')).toBeInTheDocument();
      expect(screen.getByText('Negotiate better prices')).toBeInTheDocument();
      expect(screen.getByText('5000 TND')).toBeInTheDocument();
    });
  });

  it('should display patterns', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tendances Observées')).toBeInTheDocument();
      expect(screen.getByText('Consistent delivery times')).toBeInTheDocument();
      expect(screen.getByText('Average delivery time is 3 days')).toBeInTheDocument();
    });
  });

  it('should display benchmarks', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Comparaison avec le Marché')).toBeInTheDocument();
      expect(screen.getByText('Price Competitiveness')).toBeInTheDocument();
      expect(screen.getByText('105')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    (axiosInstance.get as any).mockRejectedValue({
      response: { data: { message: 'Failed to load insights' } },
    });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load insights')).toBeInTheDocument();
    });
  });

  it('should display risk factors', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Points d\'attention:')).toBeInTheDocument();
      expect(screen.getByText('Good payment history')).toBeInTheDocument();
      expect(screen.getByText('Reliable delivery')).toBeInTheDocument();
    });
  });

  it('should show high risk level correctly', async () => {
    const highRiskInsights = {
      ...mockInsights,
      risk_prediction: {
        ...mockInsights.risk_prediction,
        risk_level: 'high' as const,
        risk_score: 75,
      },
    };

    (axiosInstance.get as any).mockResolvedValue({ data: highRiskInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Élevé')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  it('should display priority badges correctly', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Prioritaire')).toBeInTheDocument();
    });
  });

  it('should show pattern data points', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: mockInsights });

    render(
      <SupplierAIInsightsModal
        businessId="biz-1"
        supplierId="sup-1"
        supplierName="Test Supplier"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('3 days average')).toBeInTheDocument();
      expect(screen.getByText('95% on-time')).toBeInTheDocument();
    });
  });
});
