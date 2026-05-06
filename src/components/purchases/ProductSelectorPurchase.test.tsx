import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductSelectorPurchase from './ProductSelectorPurchase';

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Product 1',
    type: 'PHYSICAL',
    purchase_price_ht: 100,
    is_stockable: true,
    current_stock: 50,
  },
  {
    id: 'prod-2',
    name: 'Product 2',
    type: 'DIGITAL',
    purchase_price_ht: 200,
    is_stockable: false,
    current_stock: 0,
  },
  {
    id: 'serv-1',
    name: 'Service 1',
    type: 'SERVICE',
    purchase_price_ht: 0,
    sale_price_ht: 300,
  },
];

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { business_id: 'business-123' },
  })),
}));

vi.mock('../../api/products.api', () => ({
  productsApi: {
    getAll: vi.fn(() => Promise.resolve(mockProducts)),
  },
}));

vi.mock('../../types/product', () => ({
  ProductType: {
    PHYSICAL: 'PHYSICAL',
    DIGITAL: 'DIGITAL',
    SERVICE: 'SERVICE',
  },
}));

describe('ProductSelectorPurchase', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render select with placeholder', async () => {
    render(<ProductSelectorPurchase onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Sélectionner un produit')).toBeInTheDocument();
    });
  });

  it('should load and display products', async () => {
    render(<ProductSelectorPurchase onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
      expect(screen.getByText(/Product 2/)).toBeInTheDocument();
    });
  });

  it('should filter out services', async () => {
    render(<ProductSelectorPurchase onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.queryByText(/Service 1/)).not.toBeInTheDocument();
    });
  });

  it('should call onChange with selected product', async () => {
    render(<ProductSelectorPurchase onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'prod-1' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'prod-1',
        name: 'Product 1',
      })
    );
  });

  it('should call onChange with null when clearing selection', async () => {
    render(<ProductSelectorPurchase value="prod-1" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should display stock information for stockable products', async () => {
    render(<ProductSelectorPurchase onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/Stock: 50/)).toBeInTheDocument();
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ProductSelectorPurchase onChange={mockOnChange} disabled={true} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<ProductSelectorPurchase onChange={mockOnChange} className="custom-class" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('should set value when value prop is provided', async () => {
    render(<ProductSelectorPurchase value="prod-1" onChange={mockOnChange} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('prod-1');
    });
  });

  it('should use businessId from props', async () => {
    const { productsApi } = require('../../api/products.api');
    
    render(<ProductSelectorPurchase businessId="custom-business" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(productsApi.getAll).toHaveBeenCalledWith('custom-business', expect.any(Object));
    });
  });

  it('should handle loading state', () => {
    const { productsApi } = require('../../api/products.api');
    productsApi.getAll.mockImplementation(() => new Promise(() => {}));

    render(<ProductSelectorPurchase onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should handle API error gracefully', async () => {
    const { productsApi } = require('../../api/products.api');
    productsApi.getAll.mockRejectedValue(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ProductSelectorPurchase onChange={mockOnChange} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should display price in correct format', async () => {
    render(<ProductSelectorPurchase onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/100\.000 DT/)).toBeInTheDocument();
      expect(screen.getByText(/200\.000 DT/)).toBeInTheDocument();
    });
  });
});
