import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductTable from './ProductTable';

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Ordinateur Dell',
    description: 'Ordinateur portable haute performance',
    sku: 'DELL-001',
    price: 1500,
    cost: 1200,
    quantity: 10,
    minQuantity: 5,
    isActive: true,
  },
  {
    id: 'prod-2',
    name: 'Souris Logitech',
    description: 'Souris sans fil ergonomique',
    sku: 'LOG-002',
    price: 50,
    cost: 30,
    quantity: 3,
    minQuantity: 10,
    isActive: true,
  },
  {
    id: 'prod-3',
    name: 'Clavier Mécanique',
    description: null,
    sku: 'KEY-003',
    price: 120,
    cost: null,
    quantity: 25,
    minQuantity: 5,
    isActive: false,
  },
];

describe('ProductTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table with headers', () => {
      render(<ProductTable products={mockProducts} />);

      expect(screen.getByText('Produit')).toBeInTheDocument();
      expect(screen.getByText('SKU')).toBeInTheDocument();
      expect(screen.getByText('Prix')).toBeInTheDocument();
      expect(screen.getByText('Quantité')).toBeInTheDocument();
      expect(screen.getByText('Statut')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render all products', () => {
      render(<ProductTable products={mockProducts} />);

      expect(screen.getByText('Ordinateur Dell')).toBeInTheDocument();
      expect(screen.getByText('Souris Logitech')).toBeInTheDocument();
      expect(screen.getByText('Clavier Mécanique')).toBeInTheDocument();
    });

    it('should render product descriptions when available', () => {
      render(<ProductTable products={mockProducts} />);

      expect(screen.getByText('Ordinateur portable haute performance')).toBeInTheDocument();
      expect(screen.getByText('Souris sans fil ergonomique')).toBeInTheDocument();
    });

    it('should render SKUs', () => {
      render(<ProductTable products={mockProducts} />);

      expect(screen.getByText('DELL-001')).toBeInTheDocument();
      expect(screen.getByText('LOG-002')).toBeInTheDocument();
      expect(screen.getByText('KEY-003')).toBeInTheDocument();
    });
  });

  describe('Price Display', () => {
    it('should display formatted prices', () => {
      render(<ProductTable products={mockProducts} />);

      expect(screen.getByText((content, element) => {
        return element?.textContent === '1 500 TND' || element?.textContent === '1500 TND';
      })).toBeInTheDocument();
    });

    it('should display cost when available', () => {
      render(<ProductTable products={mockProducts} />);

      const costElements = screen.getAllByText(/Coût:/i);
      expect(costElements.length).toBeGreaterThan(0);
    });

    it('should not display cost when null', () => {
      render(<ProductTable products={[mockProducts[2]]} />);

      expect(screen.queryByText(/Coût:/i)).not.toBeInTheDocument();
    });
  });

  describe('Quantity Display', () => {
    it('should display quantities', () => {
      render(<ProductTable products={mockProducts} />);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should display minimum quantities', () => {
      render(<ProductTable products={mockProducts} />);

      const minLabels = screen.getAllByText(/Min:/i);
      expect(minLabels.length).toBe(mockProducts.length);
    });

    it('should highlight low stock with red color', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      // Product 2 has quantity (3) <= minQuantity (10), should be red
      const lowStockProduct = container.querySelector('.text-red-600');
      expect(lowStockProduct).toBeInTheDocument();
    });

    it('should show alert icon for low stock', () => {
      render(<ProductTable products={mockProducts} />);

      // Product 2 has low stock, should show AlertCircle icon
      const alertIcons = document.querySelectorAll('.lucide-alert-circle');
      expect(alertIcons.length).toBeGreaterThan(0);
    });

    it('should not highlight normal stock', () => {
      render(<ProductTable products={[mockProducts[0]]} />);

      // Product 1 has quantity (10) > minQuantity (5), should not be red
      const quantityElement = screen.getByText('10');
      expect(quantityElement).not.toHaveClass('text-red-600');
    });
  });

  describe('Status Display', () => {
    it('should display active status with green badge', () => {
      render(<ProductTable products={mockProducts} />);

      const activeStatuses = screen.getAllByText('Actif');
      expect(activeStatuses.length).toBe(2);
      
      activeStatuses.forEach(status => {
        expect(status).toHaveClass('bg-green-100', 'text-green-700');
      });
    });

    it('should display inactive status with gray badge', () => {
      render(<ProductTable products={mockProducts} />);

      const inactiveStatus = screen.getByText('Inactif');
      expect(inactiveStatus).toBeInTheDocument();
      expect(inactiveStatus).toHaveClass('bg-gray-100', 'text-gray-600');
    });
  });

  describe('Action Buttons', () => {
    it('should render edit buttons for each product', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      const editButtons = container.querySelectorAll('.lucide-edit');
      expect(editButtons.length).toBe(mockProducts.length);
    });

    it('should render delete buttons for each product', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      const deleteButtons = container.querySelectorAll('.lucide-trash-2');
      expect(deleteButtons.length).toBe(mockProducts.length);
    });

    it('should have hover styles on action buttons', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      const actionButtons = container.querySelectorAll('button');
      actionButtons.forEach(button => {
        expect(button).toHaveClass('transition-colors');
      });
    });
  });

  describe('Empty State', () => {
    it('should render table structure with empty products array', () => {
      render(<ProductTable products={[]} />);

      expect(screen.getByText('Produit')).toBeInTheDocument();
      expect(screen.getByText('SKU')).toBeInTheDocument();
    });

    it('should not render any product rows when empty', () => {
      const { container } = render(<ProductTable products={[]} />);

      const tbody = container.querySelector('tbody');
      expect(tbody?.children.length).toBe(0);
    });
  });

  describe('Styling', () => {
    it('should have proper table styling', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('should have hover effect on rows', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50', 'transition-colors');
      });
    });

    it('should have rounded corners on container', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      const tableContainer = container.querySelector('.rounded-xl');
      expect(tableContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('should have proper text alignment', () => {
      const { container } = render(<ProductTable products={mockProducts} />);

      const headers = container.querySelectorAll('th');
      expect(headers[0]).toHaveClass('text-left'); // Produit
      expect(headers[2]).toHaveClass('text-right'); // Prix
      expect(headers[3]).toHaveClass('text-center'); // Quantité
    });
  });
});
