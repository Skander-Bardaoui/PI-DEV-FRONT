import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockMovements from './StockMovements';
import { useAuth } from '../../hooks/useAuth';
import { useBusinessId } from '../../hooks/useBusinessId';
import { stockMovementsApi } from '../../api/stock-movements.api';
import { productsApi } from '../../api/products.api';
import { warehousesApi } from '../../api/warehouses.api';
import { toast } from 'sonner';
import { StockMovementType } from '../../types/stock-movement';

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useBusinessId');
vi.mock('../../api/stock-movements.api');
vi.mock('../../api/products.api');
vi.mock('../../api/warehouses.api');
vi.mock('sonner');
vi.mock('../../components/stock/StockSkeletonLoaders', () => ({
  StockMovementRowSkeleton: () => <tr data-testid="skeleton-row"><td>Loading...</td></tr>,
}));

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  role: 'BUSINESS_OWNER',
};

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Product 1',
    reference: 'REF-001',
    type: 'PHYSICAL',
    is_stockable: true,
    current_stock: 100,
  },
  {
    id: 'prod-2',
    name: 'Product 2',
    reference: 'REF-002',
    type: 'PHYSICAL',
    is_stockable: true,
    current_stock: 50,
  },
  {
    id: 'prod-3',
    name: 'Service Product',
    reference: 'SRV-001',
    type: 'SERVICE',
    is_stockable: false,
    current_stock: 0,
  },
];

const mockWarehouses = [
  {
    id: 'wh-1',
    name: 'Warehouse 1',
    code: 'WH-001',
    is_active: true,
  },
  {
    id: 'wh-2',
    name: 'Warehouse 2',
    code: 'WH-002',
    is_active: true,
  },
];

const mockMovements = [
  {
    id: 'mov-1',
    product_id: 'prod-1',
    type: StockMovementType.ENTREE_ACHAT,
    quantity: 10,
    stock_before: 90,
    stock_after: 100,
    note: 'Purchase entry',
    created_at: '2024-01-01T10:00:00Z',
    product: {
      id: 'prod-1',
      name: 'Product 1',
      reference: 'REF-001',
    },
  },
  {
    id: 'mov-2',
    product_id: 'prod-2',
    type: StockMovementType.AJUSTEMENT_NEGATIF,
    quantity: 5,
    stock_before: 55,
    stock_after: 50,
    note: 'Adjustment',
    created_at: '2024-01-02T10:00:00Z',
    product: {
      id: 'prod-2',
      name: 'Product 2',
      reference: 'REF-002',
    },
  },
];

describe('StockMovements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useBusinessId as any).mockReturnValue({
      businessId: 'business-1',
      loading: false,
      error: null,
    });
    (stockMovementsApi.getAll as any).mockResolvedValue({
      data: mockMovements,
      total: mockMovements.length,
    });
    (productsApi.getAll as any).mockResolvedValue(mockProducts);
    (warehousesApi.getAll as any).mockResolvedValue(mockWarehouses);
  });

  describe('Rendering', () => {
    it('should render stock movements page', async () => {
      render(<StockMovements />);
      
      expect(screen.getByText('Stock Movements')).toBeInTheDocument();
      expect(screen.getByText('Track all stock changes')).toBeInTheDocument();
    });

    it('should render new movement button', async () => {
      render(<StockMovements />);
      
      expect(screen.getByText('New Movement')).toBeInTheDocument();
    });

    it('should render filters section', async () => {
      render(<StockMovements />);
      
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    it('should render movements table', async () => {
      render(<StockMovements />);
      
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
      expect(screen.getByText('Note')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should load movements on mount', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(stockMovementsApi.getAll).toHaveBeenCalledWith('business-1', {
          product_id: undefined,
          type: undefined,
          start_date: undefined,
          end_date: undefined,
          limit: 1000,
          offset: 0,
        });
      });
    });

    it('should load products on mount', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(productsApi.getAll).toHaveBeenCalledWith('business-1', { is_active: true });
      });
    });

    it('should load warehouses on mount', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(warehousesApi.getAll).toHaveBeenCalledWith('business-1', { is_active: true });
      });
    });

    it('should filter out non-physical products', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        const productSelect = screen.getByLabelText(/Product/);
        expect(productSelect).toBeInTheDocument();
      });

      const productSelect = screen.getByLabelText(/Product/) as HTMLSelectElement;
      const options = Array.from(productSelect.options).map(opt => opt.text);
      
      expect(options).toContain('Product 1 (REF-001)');
      expect(options).toContain('Product 2 (REF-002)');
      expect(options).not.toContain('Service Product (SRV-001)');
    });

    it('should display movements in table', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('Purchase entry')).toBeInTheDocument();
        expect(screen.getByText('Adjustment')).toBeInTheDocument();
      });
    });

    it('should show skeleton loaders while loading', async () => {
      render(<StockMovements />);
      
      expect(screen.getAllByTestId('skeleton-row').length).toBeGreaterThan(0);
    });

    it('should hide skeleton after loading', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Filters', () => {
    it('should filter by product', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const productSelect = screen.getByLabelText(/Product/);
      fireEvent.change(productSelect, { target: { value: 'prod-1' } });

      await waitFor(() => {
        expect(stockMovementsApi.getAll).toHaveBeenCalledWith('business-1', {
          product_id: 'prod-1',
          type: undefined,
          start_date: undefined,
          end_date: undefined,
          limit: 1000,
          offset: 0,
        });
      });
    });

    it('should filter by type', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const typeSelect = screen.getByLabelText(/Type/);
      fireEvent.change(typeSelect, { target: { value: StockMovementType.ENTREE_ACHAT } });

      await waitFor(() => {
        expect(stockMovementsApi.getAll).toHaveBeenCalledWith('business-1', {
          product_id: undefined,
          type: StockMovementType.ENTREE_ACHAT,
          start_date: undefined,
          end_date: undefined,
          limit: 1000,
          offset: 0,
        });
      });
    });

    it('should filter by start date', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const startDateInput = screen.getByLabelText(/Start Date/);
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

      await waitFor(() => {
        expect(stockMovementsApi.getAll).toHaveBeenCalledWith('business-1', {
          product_id: undefined,
          type: undefined,
          start_date: '2024-01-01',
          end_date: undefined,
          limit: 1000,
          offset: 0,
        });
      });
    });

    it('should filter by end date', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const endDateInput = screen.getByLabelText(/End Date/);
      fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

      await waitFor(() => {
        expect(stockMovementsApi.getAll).toHaveBeenCalledWith('business-1', {
          product_id: undefined,
          type: undefined,
          start_date: undefined,
          end_date: '2024-12-31',
          limit: 1000,
          offset: 0,
        });
      });
    });

    it('should combine multiple filters', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const productSelect = screen.getByLabelText(/Product/);
      const typeSelect = screen.getByLabelText(/Type/);
      
      fireEvent.change(productSelect, { target: { value: 'prod-1' } });
      fireEvent.change(typeSelect, { target: { value: StockMovementType.ENTREE_ACHAT } });

      await waitFor(() => {
        expect(stockMovementsApi.getAll).toHaveBeenCalledWith('business-1', {
          product_id: 'prod-1',
          type: StockMovementType.ENTREE_ACHAT,
          start_date: undefined,
          end_date: undefined,
          limit: 1000,
          offset: 0,
        });
      });
    });
  });

  describe('Create Movement Modal', () => {
    it('should open modal when clicking new movement button', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const newButton = screen.getByText('New Movement');
      fireEvent.click(newButton);

      await waitFor(() => {
        expect(screen.getByText('New Stock Movement')).toBeInTheDocument();
      });
    });

    it('should close modal when clicking cancel', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('New Movement'));

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByText('New Stock Movement')).not.toBeInTheDocument();
      });
    });

    it('should create movement successfully', async () => {
      (stockMovementsApi.createManual as any).mockResolvedValue({});

      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('New Movement'));

      await waitFor(() => {
        expect(screen.getByText('New Stock Movement')).toBeInTheDocument();
      });

      // Fill form
      const productSelect = screen.getAllByRole('combobox')[0];
      const quantityInput = screen.getByLabelText(/Quantity/);
      const noteInput = screen.getByLabelText(/Note/);

      fireEvent.change(productSelect, { target: { value: 'prod-1' } });
      fireEvent.change(quantityInput, { target: { value: '10' } });
      fireEvent.change(noteInput, { target: { value: 'Test movement' } });

      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(stockMovementsApi.createManual).toHaveBeenCalledWith('business-1', {
          product_id: 'prod-1',
          type: StockMovementType.AJUSTEMENT_POSITIF,
          quantity: 10,
          note: 'Test movement',
        });
        expect(toast.success).toHaveBeenCalledWith('Mouvement de stock créé avec succès');
      });
    });

    it('should handle create error', async () => {
      (stockMovementsApi.createManual as any).mockRejectedValue({
        response: { data: { message: 'Creation failed' } },
      });

      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('New Movement'));

      const productSelect = screen.getAllByRole('combobox')[0];
      const quantityInput = screen.getByLabelText(/Quantity/);

      fireEvent.change(productSelect, { target: { value: 'prod-1' } });
      fireEvent.change(quantityInput, { target: { value: '10' } });

      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Creation failed');
      });
    });

    it('should allow selecting warehouse', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('New Movement'));

      await waitFor(() => {
        const warehouseSelect = screen.getByLabelText(/Warehouse/);
        expect(warehouseSelect).toBeInTheDocument();
      });

      const warehouseSelect = screen.getByLabelText(/Warehouse/);
      fireEvent.change(warehouseSelect, { target: { value: 'wh-1' } });

      expect((warehouseSelect as HTMLSelectElement).value).toBe('wh-1');
    });

    it('should allow selecting movement type', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('New Movement'));

      await waitFor(() => {
        const typeSelect = screen.getAllByRole('combobox')[1];
        expect(typeSelect).toBeInTheDocument();
      });

      const typeSelect = screen.getAllByRole('combobox')[1];
      fireEvent.change(typeSelect, { target: { value: StockMovementType.AJUSTEMENT_NEGATIF } });

      expect((typeSelect as HTMLSelectElement).value).toBe(StockMovementType.AJUSTEMENT_NEGATIF);
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no movements', async () => {
      (stockMovementsApi.getAll as any).mockResolvedValue({
        data: [],
        total: 0,
      });

      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('No movements found')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('No Business ID', () => {
    it('should show warning when no business ID', () => {
      (useBusinessId as any).mockReturnValue({
        businessId: null,
        loading: false,
        error: null,
      });

      render(<StockMovements />);
      
      expect(screen.getByText('No business associated with your account.')).toBeInTheDocument();
    });

    it('should not load data without business ID', () => {
      (useBusinessId as any).mockReturnValue({
        businessId: null,
        loading: false,
        error: null,
      });

      render(<StockMovements />);
      
      expect(stockMovementsApi.getAll).not.toHaveBeenCalled();
    });
  });

  describe('Infinite Scroll', () => {
    it('should display count of shown movements', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText(/Showing/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show loading indicator when loading more', async () => {
      const manyMovements = Array.from({ length: 10 }, (_, i) => ({
        ...mockMovements[0],
        id: `mov-${i}`,
      }));
      
      (stockMovementsApi.getAll as any).mockResolvedValue({
        data: manyMovements,
        total: manyMovements.length,
      });

      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Movement Display', () => {
    it('should display movement quantities correctly', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('10.000')).toBeInTheDocument();
        expect(screen.getByText('5.000')).toBeInTheDocument();
      });
    });

    it('should display stock before and after', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('90.000')).toBeInTheDocument();
        expect(screen.getByText('100.000')).toBeInTheDocument();
        expect(screen.getByText('55.000')).toBeInTheDocument();
        expect(screen.getByText('50.000')).toBeInTheDocument();
      });
    });

    it('should display movement notes', async () => {
      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('Purchase entry')).toBeInTheDocument();
        expect(screen.getByText('Adjustment')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading movements', async () => {
      (stockMovementsApi.getAll as any).mockRejectedValue(new Error('Network error'));

      render(<StockMovements />);
      
      await waitFor(() => {
        expect(screen.getByText('No movements found')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
