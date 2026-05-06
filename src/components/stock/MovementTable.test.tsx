/**
 * Tests for MovementTable component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MovementTable from './MovementTable';

describe('MovementTable', () => {
  const mockMovements = [
    {
      id: '1',
      product_id: 'prod-1',
      product_name: 'Laptop',
      warehouse_id: 'wh-1',
      warehouse_name: 'Main Warehouse',
      movement_type: 'IN' as const,
      quantity: 10,
      reference: 'REF-001',
      notes: 'Initial stock',
      created_at: '2024-01-15T10:00:00Z',
      created_by: 'user-1',
    },
    {
      id: '2',
      product_id: 'prod-2',
      product_name: 'Mouse',
      warehouse_id: 'wh-1',
      warehouse_name: 'Main Warehouse',
      movement_type: 'OUT' as const,
      quantity: 5,
      reference: 'REF-002',
      notes: 'Sale',
      created_at: '2024-01-20T10:00:00Z',
      created_by: 'user-2',
    },
    {
      id: '3',
      product_id: 'prod-3',
      product_name: 'Keyboard',
      warehouse_id: 'wh-2',
      warehouse_name: 'Secondary Warehouse',
      movement_type: 'ADJUSTMENT' as const,
      quantity: -2,
      reference: 'REF-003',
      notes: null,
      created_at: '2024-02-01T10:00:00Z',
      created_by: 'user-1',
    },
  ];

  it('should render table with movements', () => {
    render(<MovementTable movements={mockMovements} />);
    
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.getByText('Keyboard')).toBeInTheDocument();
  });

  it('should display table headers', () => {
    render(<MovementTable movements={mockMovements} />);
    
    expect(screen.getByText(/produit|product/i)).toBeInTheDocument();
    expect(screen.getByText(/entrepôt|warehouse/i)).toBeInTheDocument();
    expect(screen.getByText(/type/i)).toBeInTheDocument();
    expect(screen.getByText(/quantité|quantity/i)).toBeInTheDocument();
    expect(screen.getByText(/référence|reference/i)).toBeInTheDocument();
  });

  it('should display movement types', () => {
    render(<MovementTable movements={mockMovements} />);
    
    expect(screen.getByText(/entrée|in/i)).toBeInTheDocument();
    expect(screen.getByText(/sortie|out/i)).toBeInTheDocument();
    expect(screen.getByText(/ajustement|adjustment/i)).toBeInTheDocument();
  });

  it('should display IN movement with green badge', () => {
    const { container } = render(<MovementTable movements={mockMovements} />);
    
    const inBadge = screen.getByText(/entrée|in/i);
    expect(inBadge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('should display OUT movement with red badge', () => {
    const { container } = render(<MovementTable movements={mockMovements} />);
    
    const outBadge = screen.getByText(/sortie|out/i);
    expect(outBadge).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('should display ADJUSTMENT movement with yellow badge', () => {
    const { container } = render(<MovementTable movements={mockMovements} />);
    
    const adjustmentBadge = screen.getByText(/ajustement|adjustment/i);
    expect(adjustmentBadge).toHaveClass('bg-yellow-100', 'text-yellow-700');
  });

  it('should display quantities', () => {
    render(<MovementTable movements={mockMovements} />);
    
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('-2')).toBeInTheDocument();
  });

  it('should display positive quantity in green', () => {
    const { container } = render(<MovementTable movements={mockMovements} />);
    
    const positiveQty = screen.getByText('+10');
    expect(positiveQty).toHaveClass('text-green-600');
  });

  it('should display negative quantity in red', () => {
    const { container } = render(<MovementTable movements={mockMovements} />);
    
    const negativeQty = screen.getByText('-5');
    expect(negativeQty).toHaveClass('text-red-600');
  });

  it('should display warehouse names', () => {
    render(<MovementTable movements={mockMovements} />);
    
    expect(screen.getAllByText('Main Warehouse').length).toBe(2);
    expect(screen.getByText('Secondary Warehouse')).toBeInTheDocument();
  });

  it('should display references', () => {
    render(<MovementTable movements={mockMovements} />);
    
    expect(screen.getByText('REF-001')).toBeInTheDocument();
    expect(screen.getByText('REF-002')).toBeInTheDocument();
    expect(screen.getByText('REF-003')).toBeInTheDocument();
  });

  it('should display notes when available', () => {
    render(<MovementTable movements={mockMovements} />);
    
    expect(screen.getByText('Initial stock')).toBeInTheDocument();
    expect(screen.getByText('Sale')).toBeInTheDocument();
  });

  it('should display dash for empty notes', () => {
    render(<MovementTable movements={mockMovements} />);
    
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('should display formatted dates', () => {
    render(<MovementTable movements={mockMovements} />);
    
    // Check for date format
    expect(screen.getByText(/15\/01\/2024|15-01-2024/)).toBeInTheDocument();
  });

  it('should render empty table when no movements', () => {
    render(<MovementTable movements={[]} />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should have proper table structure', () => {
    const { container } = render(<MovementTable movements={mockMovements} />);
    
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
  });

  it('should apply hover effect on rows', () => {
    const { container } = render(<MovementTable movements={mockMovements} />);
    
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
      expect(row).toHaveClass('hover:bg-gray-50');
    });
  });

  it('should have rounded container', () => {
    const { container } = render(<MovementTable movements={mockMovements} />);
    
    const tableContainer = container.firstChild;
    expect(tableContainer).toHaveClass('bg-white', 'rounded-xl');
  });
});
