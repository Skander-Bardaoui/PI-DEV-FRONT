import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierRecommendationPanel from './SupplierRecommendationPanel';
import { useQuery } from '@tanstack/react-query';
import { useAIAccess } from '../../hooks/useAIAccess';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('../../hooks/useAIAccess', () => ({
  useAIAccess: vi.fn(),
}));

vi.mock('../../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('SupplierRecommendationPanel', () => {
  const mockOnSelectSupplier = vi.fn();

  const mockRecommendations = [
    {
      supplier_id: 'supplier-1',
      supplier_name: 'Best Supplier',
      score: 95,
      rank: 1,
      avg_price: 100,
      price_competitiveness: -15,
      delivery_reliability: 95,
      quality_score: 90,
      dispute_rate: 2,
      total_orders: 50,
      total_disputes: 1,
      avg_delivery_days: 3,
      last_order_date: '2024-01-01',
      recommendation_strength: 'HIGHLY_RECOMMENDED' as const,
      explanation: 'Excellent supplier with great track record',
      pros: ['Low prices', 'Fast delivery', 'High quality'],
      cons: ['Limited product range'],
    },
    {
      supplier_id: 'supplier-2',
      supplier_name: 'Good Supplier',
      score: 80,
      rank: 2,
      avg_price: 120,
      price_competitiveness: 5,
      delivery_reliability: 85,
      quality_score: 80,
      dispute_rate: 8,
      total_orders: 30,
      total_disputes: 2,
      avg_delivery_days: 5,
      last_order_date: '2024-01-05',
      recommendation_strength: 'RECOMMENDED' as const,
      explanation: 'Reliable supplier with good service',
      pros: ['Good quality', 'Reliable'],
      cons: ['Higher prices', 'Slower delivery'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (useAIAccess as any).mockReturnValue({
      hasAIAccess: true,
      loading: false,
    });

    (useQuery as any).mockReturnValue({
      data: mockRecommendations,
      isLoading: false,
    });
  });

  it('should not render if user has no AI access', () => {
    (useAIAccess as any).mockReturnValue({
      hasAIAccess: false,
      loading: false,
    });

    const { container } = render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render while checking AI access', () => {
    (useAIAccess as any).mockReturnValue({
      hasAIAccess: false,
      loading: true,
    });

    const { container } = render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show loading state', () => {
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText(/L'IA analyse les fournisseurs/)).toBeInTheDocument();
  });

  it('should show loading with product name', () => {
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
        productName="Test Product"
      />
    );

    expect(screen.getByText(/Test Product/)).toBeInTheDocument();
  });

  it('should not render if no recommendations', () => {
    (useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { container } = render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render top recommendation', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText('Best Supplier')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('#1 RECOMMANDÉ')).toBeInTheDocument();
  });

  it('should display recommendation explanation', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText('Excellent supplier with great track record')).toBeInTheDocument();
  });

  it('should display pros and cons', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText(/Low prices/)).toBeInTheDocument();
    expect(screen.getByText(/Fast delivery/)).toBeInTheDocument();
    expect(screen.getByText(/Limited product range/)).toBeInTheDocument();
  });

  it('should handle supplier selection', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    const selectButton = screen.getByText('✨ Choisir ce fournisseur');
    fireEvent.click(selectButton);

    expect(mockOnSelectSupplier).toHaveBeenCalledWith('supplier-1');
  });

  it('should not show select button if supplier already selected', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        selectedSupplierId="supplier-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.queryByText('✨ Choisir ce fournisseur')).not.toBeInTheDocument();
  });

  it('should toggle panel expansion', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    const header = screen.getByText(/Recommandation IA/);
    const toggleButton = header.closest('div')?.querySelector('button');

    if (toggleButton) {
      fireEvent.click(toggleButton);
      // Panel should collapse
      expect(screen.queryByText('Best Supplier')).not.toBeInTheDocument();
    }
  });

  it('should display metrics correctly', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText('3j')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('2.0%')).toBeInTheDocument();
  });

  it('should show comparison when different supplier selected', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        selectedSupplierId="supplier-2"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText(/Comparaison avec votre choix/)).toBeInTheDocument();
    expect(screen.getByText('Good Supplier')).toBeInTheDocument();
  });

  it('should display other suppliers in details', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    const detailsElement = screen.getByText(/Voir les .* autres fournisseurs/);
    fireEvent.click(detailsElement);

    expect(screen.getByText('#2 Good Supplier')).toBeInTheDocument();
  });

  it('should handle clicking on other suppliers', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    const detailsElement = screen.getByText(/Voir les .* autres fournisseurs/);
    fireEvent.click(detailsElement);

    const supplierCard = screen.getByText('#2 Good Supplier').closest('div');
    if (supplierCard) {
      fireEvent.click(supplierCard);
      expect(mockOnSelectSupplier).toHaveBeenCalledWith('supplier-2');
    }
  });

  it('should display correct strength badge', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    const detailsElement = screen.getByText(/Voir les .* autres fournisseurs/);
    fireEvent.click(detailsElement);

    expect(screen.getByText(/Recommandé/)).toBeInTheDocument();
  });

  it('should show product-specific message', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
        productName="Test Product"
      />
    );

    expect(screen.getByText(/Analyse basée sur l'historique pour : Test Product/)).toBeInTheDocument();
  });

  it('should display number of analyzed suppliers', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText('2 fournisseurs analysés')).toBeInTheDocument();
  });

  it('should show price competitiveness indicator', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText(/Très compétitif/)).toBeInTheDocument();
  });

  it('should handle comparison metrics', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        selectedSupplierId="supplier-2"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText(/Score global/)).toBeInTheDocument();
    expect(screen.getByText(/Prix/)).toBeInTheDocument();
    expect(screen.getByText(/Taux de litiges/)).toBeInTheDocument();
  });

  it('should display AI advice in comparison', () => {
    render(
      <SupplierRecommendationPanel
        businessId="business-1"
        selectedSupplierId="supplier-2"
        onSelectSupplier={mockOnSelectSupplier}
      />
    );

    expect(screen.getByText(/Conseil IA/)).toBeInTheDocument();
  });
});
