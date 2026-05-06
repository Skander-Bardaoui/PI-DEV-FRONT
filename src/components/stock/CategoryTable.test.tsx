/**
 * Tests for CategoryTable component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryTable from './CategoryTable';

describe('CategoryTable', () => {
  const mockCategories = [
    {
      id: '1',
      name: 'Electronics',
      description: 'Electronic devices',
      category_type: 'PRODUCT' as const,
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Furniture',
      description: 'Office furniture',
      category_type: 'PRODUCT' as const,
      is_active: false,
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
    },
    {
      id: '3',
      name: 'Consulting',
      description: null,
      category_type: 'SERVICE' as const,
      is_active: true,
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
    },
  ];

  it('should render table with categories', () => {
    render(<CategoryTable categories={mockCategories} />);
    
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Furniture')).toBeInTheDocument();
    expect(screen.getByText('Consulting')).toBeInTheDocument();
  });

  it('should display table headers', () => {
    render(<CategoryTable categories={mockCategories} />);
    
    expect(screen.getByText(/catégorie/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/statut/i)).toBeInTheDocument();
    expect(screen.getByText(/date de création/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();
  });

  it('should display category descriptions', () => {
    render(<CategoryTable categories={mockCategories} />);
    
    expect(screen.getByText('Electronic devices')).toBeInTheDocument();
    expect(screen.getByText('Office furniture')).toBeInTheDocument();
  });

  it('should display dash for empty description', () => {
    render(<CategoryTable categories={mockCategories} />);
    
    const rows = screen.getAllByText('—');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should display active status badge', () => {
    render(<CategoryTable categories={mockCategories} />);
    
    const activebadges = screen.getAllByText('Active');
    expect(activebadges.length).toBe(2);
    expect(activebadges[0]).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('should display inactive status badge', () => {
    render(<CategoryTable categories={mockCategories} />);
    
    const inactiveBadge = screen.getByText('Inactive');
    expect(inactiveBadge).toBeInTheDocument();
    expect(inactiveBadge).toHaveClass('bg-gray-100', 'text-gray-600');
  });

  it('should display formatted dates', () => {
    render(<CategoryTable categories={mockCategories} />);
    
    // Check for date format (French locale)
    expect(screen.getByText(/15\/01\/2024|15-01-2024/)).toBeInTheDocument();
  });

  it('should render edit buttons for each category', () => {
    const { container } = render(<CategoryTable categories={mockCategories} />);
    
    const editButtons = container.querySelectorAll('.lucide-edit, .lucide-pencil');
    expect(editButtons.length).toBe(mockCategories.length);
  });

  it('should render delete buttons for each category', () => {
    const { container } = render(<CategoryTable categories={mockCategories} />);
    
    const deleteButtons = container.querySelectorAll('.lucide-trash-2, .lucide-trash');
    expect(deleteButtons.length).toBe(mockCategories.length);
  });

  it('should render category icons', () => {
    const { container } = render(<CategoryTable categories={mockCategories} />);
    
    const icons = container.querySelectorAll('.lucide-tag');
    expect(icons.length).toBe(mockCategories.length);
  });

  it('should apply hover effect on rows', () => {
    const { container } = render(<CategoryTable categories={mockCategories} />);
    
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
      expect(row).toHaveClass('hover:bg-gray-50');
    });
  });

  it('should render empty table when no categories', () => {
    render(<CategoryTable categories={[]} />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should have proper table structure', () => {
    const { container } = render(<CategoryTable categories={mockCategories} />);
    
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
  });

  it('should have rounded container', () => {
    const { container } = render(<CategoryTable categories={mockCategories} />);
    
    const tableContainer = container.firstChild;
    expect(tableContainer).toHaveClass('bg-white', 'rounded-xl', 'border');
  });

  it('should display all category names', () => {
    render(<CategoryTable categories={mockCategories} />);
    
    mockCategories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });
});
