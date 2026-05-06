import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Archive from './Archive';
import { useAuth } from '../../hooks/useAuth';
import { useBusinessId } from '../../hooks/useBusinessId';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { stockMovementsApi } from '../../api/stock-movements.api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useBusinessId');
vi.mock('../../api/products.api');
vi.mock('../../api/categories.api');
vi.mock('../../api/stock-movements.api');
vi.mock('sonner');

const mockUser = {
  id: 'user-1',
  email: 'owner@test.com',
  role: 'BUSINESS_OWNER',
};

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Product 1',
    reference: 'REF-001',
    sku: 'SKU-001',
    type: 'PHYSICAL',
    sale_price_ht: 100,
    barcode: '123456789',
    category_id: 'cat-1',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Product 2',
    reference: 'REF-002',
    sku: 'SKU-002',
    type: 'SERVICE',
    sale_price_ht: 200,
    created_at: '2024-01-02T10:00:00Z',
  },
];

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Category 1',
    description: 'Test category',
    created_at: '2024-01-01T10:00:00Z',
  },
];

const mockMovements = [
  {
    id: 'mov-1',
    type: 'ENTREE_ACHAT',
    quantity: 10,
    product_id: 'prod-1',
    note: 'Test movement',
    created_at: '2024-01-01T10:00:00Z',
  },
];

describe('Archive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useBusinessId as any).mockReturnValue({
      businessId: 'business-1',
      loading: false,
      error: null,
    });
    (productsApi.getArchived as any).mockResolvedValue(mockProducts);
    (categoriesApi.getArchived as any).mockResolvedValue(mockCategories);
    (stockMovementsApi.getArchived as any).mockResolvedValue(mockMovements);
  });

  describe('Rendering', () => {
    it('should render archive page with header', async () => {
      render(<Archive />);
      
      expect(screen.getByText('Archive')).toBeInTheDocument();
      expect(screen.getByText(/View and restore soft-deleted items/i)).toBeInTheDocument();
    });

    it('should render warning banner', async () => {
      render(<Archive />);
      
      expect(screen.getByText('Archived Items')).toBeInTheDocument();
      expect(screen.getByText(/These items have been soft-deleted/i)).toBeInTheDocument();
    });

    it('should render tabs for products, categories, and movements', async () => {
      render(<Archive />);
      
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Stock Movements')).toBeInTheDocument();
    });

    it('should render search bar', async () => {
      render(<Archive />);
      
      expect(screen.getByPlaceholderText('Search archived items...')).toBeInTheDocument();
    });
  });

  describe('Access Control', () => {
    it('should show access denied for non-admin users', () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, role: 'BUSINESS_MEMBER' },
      });

      render(<Archive />);
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/Only Business Owners and Admins can access the archive/i)).toBeInTheDocument();
    });

    it('should allow access for BUSINESS_OWNER', async () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, role: 'BUSINESS_OWNER' },
      });

      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      });
    });

    it('should allow access for BUSINESS_ADMIN', async () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, role: 'BUSINESS_ADMIN' },
      });

      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      });
    });

    it('should show error toast for unauthorized access', () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, role: 'BUSINESS_MEMBER' },
      });

      render(<Archive />);
      
      expect(toast.error).toHaveBeenCalledWith('You do not have permission to access the archive');
    });
  });

  describe('Products Tab', () => {
    it('should load and display archived products', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        expect(productsApi.getArchived).toHaveBeenCalledWith('business-1');
      });

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
      });
    });

    it('should display product details', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.getByText('REF-001')).toBeInTheDocument();
        expect(screen.getByText(/100\.00 DH/)).toBeInTheDocument();
        expect(screen.getByText('123456789')).toBeInTheDocument();
      });
    });

    it('should show empty state when no products', async () => {
      (productsApi.getArchived as any).mockResolvedValue([]);

      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.getByText('No Archived Products')).toBeInTheDocument();
        expect(screen.getByText(/There are no archived products at the moment/i)).toBeInTheDocument();
      });
    });

    it('should restore product successfully', async () => {
      (productsApi.restore as any).mockResolvedValue({});

      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const restoreButtons = screen.getAllByText('Restore');
      fireEvent.click(restoreButtons[0]);

      await waitFor(() => {
        expect(productsApi.restore).toHaveBeenCalledWith('business-1', 'prod-1');
        expect(toast.success).toHaveBeenCalledWith('Product restored successfully');
      });
    });

    it('should handle restore error', async () => {
      (productsApi.restore as any).mockRejectedValue({
        response: { data: { message: 'Restore failed' } },
      });

      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const restoreButtons = screen.getAllByText('Restore');
      fireEvent.click(restoreButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Restore failed');
      });
    });
  });

  describe('Categories Tab', () => {
    it('should switch to categories tab', async () => {
      render(<Archive />);
      
      const categoriesTab = screen.getByText('Categories');
      fireEvent.click(categoriesTab);

      await waitFor(() => {
        expect(categoriesApi.getArchived).toHaveBeenCalledWith('business-1');
      });
    });

    it('should display archived categories', async () => {
      render(<Archive />);
      
      fireEvent.click(screen.getByText('Categories'));

      await waitFor(() => {
        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Test category')).toBeInTheDocument();
      });
    });

    it('should show empty state for categories', async () => {
      (categoriesApi.getArchived as any).mockResolvedValue([]);

      render(<Archive />);
      
      fireEvent.click(screen.getByText('Categories'));

      await waitFor(() => {
        expect(screen.getByText('No Archived Categories')).toBeInTheDocument();
      });
    });

    it('should restore category successfully', async () => {
      (categoriesApi.restore as any).mockResolvedValue({});

      render(<Archive />);
      
      fireEvent.click(screen.getByText('Categories'));

      await waitFor(() => {
        expect(screen.getByText('Category 1')).toBeInTheDocument();
      });

      const restoreButton = screen.getByText('Restore');
      fireEvent.click(restoreButton);

      await waitFor(() => {
        expect(categoriesApi.restore).toHaveBeenCalledWith('business-1', 'cat-1');
        expect(toast.success).toHaveBeenCalledWith('Category restored successfully');
      });
    });
  });

  describe('Stock Movements Tab', () => {
    it('should switch to movements tab', async () => {
      render(<Archive />);
      
      const movementsTab = screen.getByText('Stock Movements');
      fireEvent.click(movementsTab);

      await waitFor(() => {
        expect(stockMovementsApi.getArchived).toHaveBeenCalledWith('business-1');
      });
    });

    it('should display archived movements', async () => {
      render(<Archive />);
      
      fireEvent.click(screen.getByText('Stock Movements'));

      await waitFor(() => {
        expect(screen.getByText(/ENTREE_ACHAT - 10 units/)).toBeInTheDocument();
        expect(screen.getByText('Test movement')).toBeInTheDocument();
      });
    });

    it('should show empty state for movements', async () => {
      (stockMovementsApi.getArchived as any).mockResolvedValue([]);

      render(<Archive />);
      
      fireEvent.click(screen.getByText('Stock Movements'));

      await waitFor(() => {
        expect(screen.getByText('No Archived Stock Movements')).toBeInTheDocument();
      });
    });

    it('should restore movement successfully', async () => {
      (stockMovementsApi.restore as any).mockResolvedValue({});

      render(<Archive />);
      
      fireEvent.click(screen.getByText('Stock Movements'));

      await waitFor(() => {
        expect(screen.getByText(/ENTREE_ACHAT - 10 units/)).toBeInTheDocument();
      });

      const restoreButton = screen.getByText('Restore');
      fireEvent.click(restoreButton);

      await waitFor(() => {
        expect(stockMovementsApi.restore).toHaveBeenCalledWith('business-1', 'mov-1');
        expect(toast.success).toHaveBeenCalledWith('Stock movement restored successfully');
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter products by name', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search archived items...');
      fireEvent.change(searchInput, { target: { value: 'Product 1' } });

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
      });
    });

    it('should filter products by reference', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search archived items...');
      fireEvent.change(searchInput, { target: { value: 'REF-001' } });

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
      });
    });

    it('should filter products by SKU', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search archived items...');
      fireEvent.change(searchInput, { target: { value: 'SKU-001' } });

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search archived items...');
      fireEvent.change(searchInput, { target: { value: 'product 1' } });

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state', async () => {
      (productsApi.getArchived as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockProducts), 100))
      );

      render(<Archive />);
      
      expect(screen.getByText('Loading archived items...')).toBeInTheDocument();
    });

    it('should hide loading state after data loads', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading archived items...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading products', async () => {
      (productsApi.getArchived as any).mockRejectedValue({
        response: { data: { message: 'Failed to load' } },
      });

      render(<Archive />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load');
      });
    });

    it('should handle generic error', async () => {
      (productsApi.getArchived as any).mockRejectedValue(new Error('Network error'));

      render(<Archive />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load archived items');
      });
    });
  });

  describe('Tab Counts', () => {
    it('should display correct count for products tab', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        const productsTab = screen.getByText('Products').closest('button');
        expect(productsTab).toHaveTextContent('2');
      });
    });

    it('should display correct count for categories tab', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        const categoriesTab = screen.getByText('Categories').closest('button');
        expect(categoriesTab).toHaveTextContent('1');
      });
    });

    it('should display correct count for movements tab', async () => {
      render(<Archive />);
      
      await waitFor(() => {
        const movementsTab = screen.getByText('Stock Movements').closest('button');
        expect(movementsTab).toHaveTextContent('1');
      });
    });
  });

  describe('No Business ID', () => {
    it('should not load data without business ID', () => {
      (useBusinessId as any).mockReturnValue({
        businessId: null,
        loading: false,
        error: null,
      });

      render(<Archive />);
      
      expect(productsApi.getArchived).not.toHaveBeenCalled();
    });
  });
});
