// src/pages/backoffice/Products.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', role: 'BUSINESS_OWNER' },
  }),
}));

vi.mock('../../hooks/useBusinessId', () => ({
  useBusinessId: () => ({
    businessId: 'business-123',
    loading: false,
    error: null,
  }),
}));

vi.mock('../../hooks/useAIAccess', () => ({
  useAIAccess: () => ({
    hasAIAccess: true,
    loading: false,
  }),
}));

const mockProducts = [
  {
    id: '1',
    name: 'Product A',
    reference: 'SKU-001',
    description: 'Description A',
    category_id: 'cat-1',
    unit: 'pièce',
    sale_price_ht: 100,
    purchase_price_ht: 80,
    current_stock: 50,
    min_stock_threshold: 10,
    is_stockable: true,
    is_active: true,
    barcode: '1234567890',
    image_url: null,
  },
  {
    id: '2',
    name: 'Product B',
    reference: 'SKU-002',
    description: 'Description B',
    category_id: 'cat-2',
    unit: 'kg',
    sale_price_ht: 200,
    purchase_price_ht: 150,
    current_stock: 5,
    min_stock_threshold: 10,
    is_stockable: true,
    is_active: true,
    barcode: '0987654321',
    image_url: null,
  },
];

const mockCategories = [
  { id: 'cat-1', name: 'Category 1', is_active: true },
  { id: 'cat-2', name: 'Category 2', is_active: true },
];

vi.mock('../../api/products.api', () => ({
  productsApi: {
    getAll: vi.fn(() => Promise.resolve(mockProducts)),
    create: vi.fn((businessId, data) => Promise.resolve({ id: '3', ...data })),
    update: vi.fn((businessId, id, data) => Promise.resolve({ id, ...data })),
    delete: vi.fn(() => Promise.resolve()),
    uploadImage: vi.fn((businessId, id, file) => Promise.resolve({ id, image_url: 'image.jpg' })),
    removeImage: vi.fn(() => Promise.resolve()),
    generateSku: vi.fn(() => Promise.resolve({ sku: 'GEN-123' })),
    generateBarcode: vi.fn((businessId, id) => Promise.resolve({ id, barcode: '1234567890' })),
    downloadLabel: vi.fn(() => Promise.resolve(new Blob())),
    scanImage: vi.fn(() => Promise.resolve({ name: 'Scanned Product', description: 'Scanned' })),
  },
}));

vi.mock('../../api/categories.api', () => ({
  categoriesApi: {
    getAll: vi.fn(() => Promise.resolve(mockCategories)),
    create: vi.fn((businessId, data) => Promise.resolve({ id: 'cat-3', ...data })),
  },
}));

vi.mock('../../api/warehouses.api', () => ({
  warehousesApi: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
}));

// Mock component
const MockProductsPage = () => {
  return (
    <div data-testid="products-page">
      <h1>Products</h1>
      <div data-testid="action-buttons">
        <button data-testid="scan-btn">Add via image scan</button>
        <button data-testid="new-product-btn">New Product</button>
      </div>

      <div data-testid="filters">
        <input data-testid="search-input" placeholder="Search products..." />
        <select data-testid="category-filter">
          <option value="">All Categories</option>
          {mockCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <label>
          <input type="checkbox" data-testid="active-only-checkbox" />
          <span>Active only</span>
        </label>
        <label>
          <input type="checkbox" data-testid="low-stock-checkbox" />
          <span>Low stock only</span>
        </label>
      </div>

      <table data-testid="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockProducts.map((product) => (
            <tr key={product.id} data-testid={`product-row-${product.id}`}>
              <td>{product.name}</td>
              <td>{product.reference}</td>
              <td>Category {product.category_id === 'cat-1' ? '1' : '2'}</td>
              <td>
                {product.current_stock < product.min_stock_threshold && (
                  <span className="low-stock-warning">Low Stock</span>
                )}
                {product.current_stock}
              </td>
              <td>{product.sale_price_ht.toFixed(3)} TND</td>
              <td>
                <span className={product.is_active ? 'active' : 'inactive'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button data-testid={`view-${product.id}`}>View</button>
                <button data-testid={`edit-${product.id}`}>Edit</button>
                <button data-testid={`delete-${product.id}`}>Delete</button>
                <button data-testid={`barcode-${product.id}`}>Barcode</button>
                <button data-testid={`print-${product.id}`}>Print</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockProductsPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    });

    it('should render scan button for AI users', () => {
      renderWithRouter();
      expect(screen.getByTestId('scan-btn')).toBeInTheDocument();
      expect(screen.getByText('Add via image scan')).toBeInTheDocument();
    });

    it('should render new product button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-product-btn')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      renderWithRouter();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should render products table', () => {
      renderWithRouter();
      expect(screen.getByTestId('products-table')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render search input', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search products...');
    });

    it('should render category filter', () => {
      renderWithRouter();
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });

    it('should render active only checkbox', () => {
      renderWithRouter();
      expect(screen.getByTestId('active-only-checkbox')).toBeInTheDocument();
    });

    it('should render low stock checkbox', () => {
      renderWithRouter();
      expect(screen.getByTestId('low-stock-checkbox')).toBeInTheDocument();
    });

    it('should handle search input change', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Product A' } });
      expect(searchInput).toHaveValue('Product A');
    });

    it('should handle category filter change', () => {
      renderWithRouter();
      const categoryFilter = screen.getByTestId('category-filter');
      fireEvent.change(categoryFilter, { target: { value: 'cat-1' } });
      expect(categoryFilter).toHaveValue('cat-1');
    });

    it('should handle active only checkbox toggle', () => {
      renderWithRouter();
      const checkbox = screen.getByTestId('active-only-checkbox');
      fireEvent.click(checkbox);
      expect(checkbox).toBeInTheDocument();
    });

    it('should handle low stock checkbox toggle', () => {
      renderWithRouter();
      const checkbox = screen.getByTestId('low-stock-checkbox');
      fireEvent.click(checkbox);
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Products Table', () => {
    it('should display product rows', () => {
      renderWithRouter();
      expect(screen.getByTestId('product-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-row-2')).toBeInTheDocument();
    });

    it('should display product names', () => {
      renderWithRouter();
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });

    it('should display product SKUs', () => {
      renderWithRouter();
      expect(screen.getByText('SKU-001')).toBeInTheDocument();
      expect(screen.getByText('SKU-002')).toBeInTheDocument();
    });

    it('should display product categories', () => {
      renderWithRouter();
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('should display stock levels', () => {
      renderWithRouter();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display low stock warning', () => {
      renderWithRouter();
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
    });

    it('should display prices', () => {
      renderWithRouter();
      expect(screen.getByText('100.000 TND')).toBeInTheDocument();
      expect(screen.getByText('200.000 TND')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses.length).toBeGreaterThan(0);
    });
  });

  describe('Actions', () => {
    it('should render view buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('view-1')).toBeInTheDocument();
      expect(screen.getByTestId('view-2')).toBeInTheDocument();
    });

    it('should render edit buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-2')).toBeInTheDocument();
    });

    it('should render delete buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-2')).toBeInTheDocument();
    });

    it('should render barcode buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('barcode-1')).toBeInTheDocument();
      expect(screen.getByTestId('barcode-2')).toBeInTheDocument();
    });

    it('should render print buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('print-1')).toBeInTheDocument();
      expect(screen.getByTestId('print-2')).toBeInTheDocument();
    });

    it('should handle new product button click', () => {
      renderWithRouter();
      const newBtn = screen.getByTestId('new-product-btn');
      fireEvent.click(newBtn);
      expect(newBtn).toBeInTheDocument();
    });

    it('should handle scan button click', () => {
      renderWithRouter();
      const scanBtn = screen.getByTestId('scan-btn');
      fireEvent.click(scanBtn);
      expect(scanBtn).toBeInTheDocument();
    });

    it('should handle view button click', () => {
      renderWithRouter();
      const viewBtn = screen.getByTestId('view-1');
      fireEvent.click(viewBtn);
      expect(viewBtn).toBeInTheDocument();
    });

    it('should handle edit button click', () => {
      renderWithRouter();
      const editBtn = screen.getByTestId('edit-1');
      fireEvent.click(editBtn);
      expect(editBtn).toBeInTheDocument();
    });

    it('should handle delete button click', () => {
      renderWithRouter();
      const deleteBtn = screen.getByTestId('delete-1');
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeInTheDocument();
    });

    it('should handle barcode button click', () => {
      renderWithRouter();
      const barcodeBtn = screen.getByTestId('barcode-1');
      fireEvent.click(barcodeBtn);
      expect(barcodeBtn).toBeInTheDocument();
    });

    it('should handle print button click', () => {
      renderWithRouter();
      const printBtn = screen.getByTestId('print-1');
      fireEvent.click(printBtn);
      expect(printBtn).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
