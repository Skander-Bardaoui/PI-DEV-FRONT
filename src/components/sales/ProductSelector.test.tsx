import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductSelector from './ProductSelector';

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Product 1',
    type: 'PHYSICAL',
    sale_price_ht: 100,
    is_stockable: true,
    current_stock: 50,
  },
  {
    id: 'prod-2',
    name: 'Product 2',
    type: 'SERVICE',
    sale_price_ht: 200,
    is_stockable: false,
    current_stock: 0,
  },
  {
    id: 'prod-3',
    name: 'Product 3',
    type: 'PHYSICAL',
    sale_price_ht: 150,
    is_stockable: true,
    current_stock: 0,
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
    SERVICE: 'SERVICE',
    DIGITAL: 'DIGITAL',
  },
}));

describe('ProductSelector', () => {
  const mockOnChange = vi.fn();
  const mockOnStockInfo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render select with placeholder', async () => {
    render(<ProductSelector onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Sélectionner un produit/service')).toBeInTheDocument();
    });
  });

  it('should load and display products', async () => {
    render(<ProductSelector onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
      expect(screen.getByText(/Product 2/)).toBeInTheDocument();
    });
  });

  it('should call onChange with selected product', async () => {
    render(<ProductSelector onChange={mockOnChange} />);

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

  it('should call onStockInfo when product is selected', async () => {
    render(
      <ProductSelector onChange={mockOnChange} onStockInfo={mockOnStockInfo} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'prod-1' } });

    expect(mockOnStockInfo).toHaveBeenCalledWith(50, true);
  });

  it('should disable out of stock products', async () => {
    render(<ProductSelector onChange={mockOnChange} />);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const outOfStockOption = options.find(opt => 
        opt.textContent?.includes('Product 3')
      );
      expect(outOfStockOption).toBeDisabled();
    });
  });

  it('should display stock information', async () => {
    render(<ProductSelector onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/Stock: 50/)).toBeInTheDocument();
    });
  });

  it('should display product type when showType is true', async () => {
    render(<ProductSelector onChange={mockOnChange} showType={true} />);

    await waitFor(() => {
      expect(screen.getByText(/📦 Produit/)).toBeInTheDocument();
      expect(screen.getByText(/🔧 Service/)).toBeInTheDocument();
    });
  });

  it('should filter by product type', async () => {
    const { productsApi } = require('../../api/products.api');
    
    render(
      <ProductSelector
        onChange={mockOnChange}
        filterByType={'PHYSICAL' as any}
      />
    );

    await waitFor(() => {
      expect(productsApi.getAll).toHaveBeenCalledWith(
        'business-123',
        expect.objectContaining({ type: 'PHYSICAL' })
      );
    });
  });

  it('should call onChange with null when clearing selection', async () => {
    render(<ProductSelector value="prod-1" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ProductSelector onChange={mockOnChange} disabled={true} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<ProductSelector onChange={mockOnChange} className="custom-class" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('should use businessId from props', async () => {
    const { productsApi } = require('../../api/products.api');
    
    render(
      <ProductSelector businessId="custom-business" onChange={mockOnChange} />
    );

    await waitFor(() => {
      expect(productsApi.getAll).toHaveBeenCalledWith('custom-business', expect.any(Object));
    });
  });

  it('should handle loading state', () => {
    const { productsApi } = require('../../api/products.api');
    productsApi.getAll.mockImplementation(() => new Promise(() => {}));

    render(<ProductSelector onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should display out of stock label', async () => {
    render(<ProductSelector onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText(/RUPTURE DE STOCK/)).toBeInTheDocument();
    });
  });
});
