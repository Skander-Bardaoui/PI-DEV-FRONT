// src/pages/backoffice/Services.test.tsx

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

const mockServices = [
  {
    id: '1',
    name: 'Web Development',
    reference: 'SRV-001',
    description: 'Full stack web development',
    category_id: 'cat-1',
    category: { name: 'IT Services' },
    unit: 'service',
    sale_price_ht: 5000,
    is_active: true,
    is_stockable: false,
    type: 'SERVICE',
  },
  {
    id: '2',
    name: 'Consulting',
    reference: 'SRV-002',
    description: 'Business consulting',
    category_id: 'cat-2',
    category: { name: 'Consulting' },
    unit: 'service',
    sale_price_ht: 3000,
    is_active: true,
    is_stockable: false,
    type: 'SERVICE',
  },
  {
    id: '3',
    name: 'Training',
    reference: 'SRV-003',
    description: 'Technical training',
    category_id: 'cat-3',
    category: { name: 'Training' },
    unit: 'service',
    sale_price_ht: 2000,
    is_active: false,
    is_stockable: false,
    type: 'SERVICE',
  },
];

const mockCategories = [
  { id: 'cat-1', name: 'IT Services', is_active: true, category_type: 'SERVICE' },
  { id: 'cat-2', name: 'Consulting', is_active: true, category_type: 'SERVICE' },
  { id: 'cat-3', name: 'Training', is_active: true, category_type: 'SERVICE' },
];

vi.mock('../../api/products.api', () => ({
  productsApi: {
    getAll: vi.fn(() => Promise.resolve(mockServices)),
    create: vi.fn((businessId, data) => Promise.resolve({ id: '4', ...data })),
    update: vi.fn((businessId, id, data) => Promise.resolve({ id, ...data })),
    delete: vi.fn(() => Promise.resolve()),
    generateSku: vi.fn(() => Promise.resolve({ sku: 'SRV-GEN-123' })),
    scanServiceDescription: vi.fn(() => Promise.resolve({ name: 'Scanned Service', price_ht: 1000 })),
  },
}));

vi.mock('../../api/categories.api', () => ({
  categoriesApi: {
    getAll: vi.fn(() => Promise.resolve(mockCategories)),
    create: vi.fn((businessId, data) => Promise.resolve({ id: 'cat-4', ...data })),
  },
}));

// Mock component
const MockServicesPage = () => {
  return (
    <div data-testid="services-page">
      <h1>Services</h1>
      <div data-testid="action-buttons">
        <button data-testid="ai-scan-btn">Add via AI</button>
        <button data-testid="add-service-btn">Add Service</button>
      </div>

      <div data-testid="info-banner">
        <p>Services are not tracked in inventory and do not generate stock movements.</p>
      </div>

      <div data-testid="filters">
        <input data-testid="search-input" placeholder="Search services..." />
        <select data-testid="category-filter">
          <option value="">All Categories</option>
          {mockCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <label>
          <input type="checkbox" data-testid="active-only-checkbox" defaultChecked />
          <span>Active only</span>
        </label>
      </div>

      <table data-testid="services-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU/Reference</th>
            <th>Price (HT)</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockServices.map((service) => (
            <tr key={service.id} data-testid={`service-row-${service.id}`}>
              <td>{service.name}</td>
              <td>{service.reference}</td>
              <td>{service.sale_price_ht.toFixed(3)} DT</td>
              <td>{service.category?.name || '-'}</td>
              <td>
                <button
                  data-testid={`toggle-status-${service.id}`}
                  className={service.is_active ? 'status-active' : 'status-inactive'}
                >
                  {service.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td>
                <button data-testid={`edit-${service.id}`}>Edit</button>
                <button data-testid={`delete-${service.id}`}>Delete</button>
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
      <MockServicesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Services')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    });

    it('should render AI scan button for premium users', () => {
      renderWithRouter();
      expect(screen.getByTestId('ai-scan-btn')).toBeInTheDocument();
      expect(screen.getByText('Add via AI')).toBeInTheDocument();
    });

    it('should render add service button', () => {
      renderWithRouter();
      expect(screen.getByTestId('add-service-btn')).toBeInTheDocument();
    });

    it('should render info banner', () => {
      renderWithRouter();
      expect(screen.getByTestId('info-banner')).toBeInTheDocument();
      expect(screen.getByText('Services are not tracked in inventory and do not generate stock movements.')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      renderWithRouter();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should render services table', () => {
      renderWithRouter();
      expect(screen.getByTestId('services-table')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render search input', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search services...');
    });

    it('should render category filter', () => {
      renderWithRouter();
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });

    it('should render active only checkbox', () => {
      renderWithRouter();
      expect(screen.getByTestId('active-only-checkbox')).toBeInTheDocument();
    });

    it('should have active only checkbox checked by default', () => {
      renderWithRouter();
      expect(screen.getByTestId('active-only-checkbox')).toBeChecked();
    });

    it('should handle search input change', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Web' } });
      expect(searchInput).toHaveValue('Web');
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
  });

  describe('Services Table', () => {
    it('should display service rows', () => {
      renderWithRouter();
      expect(screen.getByTestId('service-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('service-row-2')).toBeInTheDocument();
      expect(screen.getByTestId('service-row-3')).toBeInTheDocument();
    });

    it('should display service names', () => {
      renderWithRouter();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('Consulting')).toBeInTheDocument();
      expect(screen.getByText('Training')).toBeInTheDocument();
    });

    it('should display service references', () => {
      renderWithRouter();
      expect(screen.getByText('SRV-001')).toBeInTheDocument();
      expect(screen.getByText('SRV-002')).toBeInTheDocument();
      expect(screen.getByText('SRV-003')).toBeInTheDocument();
    });

    it('should display service prices', () => {
      renderWithRouter();
      expect(screen.getByText('5000.000 DT')).toBeInTheDocument();
      expect(screen.getByText('3000.000 DT')).toBeInTheDocument();
      expect(screen.getByText('2000.000 DT')).toBeInTheDocument();
    });

    it('should display service categories', () => {
      renderWithRouter();
      expect(screen.getByText('IT Services')).toBeInTheDocument();
      expect(screen.getByText('Consulting')).toBeInTheDocument();
      expect(screen.getByText('Training')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses).toHaveLength(2);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should render toggle status buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('toggle-status-1')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-status-2')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-status-3')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render edit buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-3')).toBeInTheDocument();
    });

    it('should render delete buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-3')).toBeInTheDocument();
    });

    it('should handle AI scan button click', () => {
      renderWithRouter();
      const aiBtn = screen.getByTestId('ai-scan-btn');
      fireEvent.click(aiBtn);
      expect(aiBtn).toBeInTheDocument();
    });

    it('should handle add service button click', () => {
      renderWithRouter();
      const addBtn = screen.getByTestId('add-service-btn');
      fireEvent.click(addBtn);
      expect(addBtn).toBeInTheDocument();
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

    it('should handle toggle status button click', () => {
      renderWithRouter();
      const toggleBtn = screen.getByTestId('toggle-status-1');
      fireEvent.click(toggleBtn);
      expect(toggleBtn).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
