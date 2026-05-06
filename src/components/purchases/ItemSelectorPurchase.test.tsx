import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemSelectorPurchase from './ItemSelectorPurchase';

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Product 1',
    purchase_price_ht: 100,
    sale_price_ht: 150,
    description: 'Test product 1',
    is_stockable: true,
    current_stock: 50,
  },
  {
    id: 'prod-2',
    name: 'Product 2',
    purchase_price_ht: 200,
    sale_price_ht: 250,
    description: 'Test product 2',
    is_stockable: false,
    current_stock: 0,
  },
];

const mockServices = [
  {
    id: 'serv-1',
    name: 'Service 1',
    purchase_price_ht: 0,
    sale_price_ht: 300,
    description: 'Test service 1',
  },
];

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { business_id: 'business-123' },
  })),
}));

vi.mock('../../api/products.api', () => ({
  productsApi: {
    getAll: vi.fn((businessId, params) => {
      if (params.type === 'PHYSICAL') {
        return Promise.resolve(mockProducts);
      }
      return Promise.resolve(mockServices);
    }),
  },
}));

vi.mock('../../types/product', () => ({
  ProductType: {
    PHYSICAL: 'PHYSICAL',
    SERVICE: 'SERVICE',
  },
}));

describe('ItemSelectorPurchase', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render select with placeholder for products', async () => {
    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sélectionner un produit')).toBeInTheDocument();
    });
  });

  it('should render select with placeholder for services', async () => {
    render(
      <ItemSelectorPurchase
        itemType="SERVICE"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sélectionner un service')).toBeInTheDocument();
    });
  });

  it('should load and display products', async () => {
    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
      expect(screen.getByText(/Product 2/)).toBeInTheDocument();
    });
  });

  it('should load and display services', async () => {
    render(
      <ItemSelectorPurchase
        itemType="SERVICE"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Service 1/)).toBeInTheDocument();
    });
  });

  it('should call onChange with selected item', async () => {
    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'prod-1' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      id: 'prod-1',
      name: 'Product 1',
      type: 'PRODUCT',
      price_ht: 100,
      description: 'Test product 1',
      duration_note: undefined,
    });
  });

  it('should call onChange with null when clearing selection', async () => {
    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        value="prod-1"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should display stock information for stockable products', async () => {
    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Stock: 50/)).toBeInTheDocument();
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('should set value when value prop is provided', async () => {
    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        value="prod-1"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('prod-1');
    });
  });

  it('should handle loading state', () => {
    const { productsApi } = require('../../api/products.api');
    productsApi.getAll.mockImplementation(() => new Promise(() => {}));

    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should handle API error gracefully', async () => {
    const { productsApi } = require('../../api/products.api');
    productsApi.getAll.mockRejectedValue(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ItemSelectorPurchase
        itemType="PRODUCT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
