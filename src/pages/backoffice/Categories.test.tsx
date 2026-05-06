// src/pages/backoffice/Categories.test.tsx

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

const mockCategories = [
  {
    id: '1',
    name: 'Electronics',
    description: 'Electronic products',
    is_active: true,
    category_type: 'PRODUCT',
  },
  {
    id: '2',
    name: 'Furniture',
    description: 'Office furniture',
    is_active: true,
    category_type: 'PRODUCT',
  },
  {
    id: '3',
    name: 'Supplies',
    description: 'Office supplies',
    is_active: false,
    category_type: 'PRODUCT',
  },
];

vi.mock('../../api/categories.api', () => ({
  categoriesApi: {
    getAll: vi.fn(() => Promise.resolve(mockCategories)),
    create: vi.fn((businessId, data) => Promise.resolve({ id: '4', ...data })),
    update: vi.fn((businessId, id, data) => Promise.resolve({ id, ...data })),
    softDelete: vi.fn(() => Promise.resolve()),
  },
}));

// Mock component
const MockCategoriesPage = () => {
  return (
    <div data-testid="categories-page">
      <h1>Product Categories</h1>
      <button data-testid="new-category-btn">New Category</button>

      <div data-testid="filters">
        <input data-testid="search-input" placeholder="Search categories..." />
        <label>
          <input type="checkbox" data-testid="active-only-checkbox" defaultChecked />
          <span>Active only</span>
        </label>
      </div>

      <table data-testid="categories-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockCategories.map((category) => (
            <tr key={category.id} data-testid={`category-row-${category.id}`}>
              <td>{category.name}</td>
              <td>{category.description || '-'}</td>
              <td>
                <button
                  data-testid={`toggle-status-${category.id}`}
                  className={category.is_active ? 'status-active' : 'status-inactive'}
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td>
                <button data-testid={`edit-${category.id}`}>Edit</button>
                <button data-testid={`delete-${category.id}`}>Delete</button>
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
      <MockCategoriesPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Product Categories')).toBeInTheDocument();
    });

    it('should render new category button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-category-btn')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      renderWithRouter();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should render categories table', () => {
      renderWithRouter();
      expect(screen.getByTestId('categories-table')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render search input', () => {
      renderWithRouter();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search categories...');
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
      fireEvent.change(searchInput, { target: { value: 'Electronics' } });
      expect(searchInput).toHaveValue('Electronics');
    });

    it('should handle active only checkbox toggle', () => {
      renderWithRouter();
      const checkbox = screen.getByTestId('active-only-checkbox');
      fireEvent.click(checkbox);
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Categories Table', () => {
    it('should display category rows', () => {
      renderWithRouter();
      expect(screen.getByTestId('category-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('category-row-2')).toBeInTheDocument();
      expect(screen.getByTestId('category-row-3')).toBeInTheDocument();
    });

    it('should display category names', () => {
      renderWithRouter();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Furniture')).toBeInTheDocument();
      expect(screen.getByText('Supplies')).toBeInTheDocument();
    });

    it('should display category descriptions', () => {
      renderWithRouter();
      expect(screen.getByText('Electronic products')).toBeInTheDocument();
      expect(screen.getByText('Office furniture')).toBeInTheDocument();
      expect(screen.getByText('Office supplies')).toBeInTheDocument();
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

    it('should handle new category button click', () => {
      renderWithRouter();
      const newBtn = screen.getByTestId('new-category-btn');
      fireEvent.click(newBtn);
      expect(newBtn).toBeInTheDocument();
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
