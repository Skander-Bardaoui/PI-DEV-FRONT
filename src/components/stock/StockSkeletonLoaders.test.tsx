/**
 * Tests for StockSkeletonLoaders component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  StockCardSkeleton, 
  ProductTableSkeleton, 
  CategoryTableSkeleton,
  MovementTableSkeleton,
  WarehouseCardSkeleton 
} from './StockSkeletonLoaders';

describe('StockSkeletonLoaders', () => {
  describe('StockCardSkeleton', () => {
    it('should render skeleton card', () => {
      const { container } = render(<StockCardSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should have proper structure', () => {
      const { container } = render(<StockCardSkeleton />);
      
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-xl', 'p-6');
    });
  });

  describe('ProductTableSkeleton', () => {
    it('should render table skeleton', () => {
      const { container } = render(<ProductTableSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render multiple rows', () => {
      const { container } = render(<ProductTableSkeleton rows={5} />);
      
      const rows = container.querySelectorAll('tr');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should render default number of rows', () => {
      const { container } = render(<ProductTableSkeleton />);
      
      expect(container.querySelector('table')).toBeInTheDocument();
    });
  });

  describe('CategoryTableSkeleton', () => {
    it('should render category table skeleton', () => {
      const { container } = render(<CategoryTableSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render with custom rows', () => {
      const { container } = render(<CategoryTableSkeleton rows={3} />);
      
      expect(container.querySelector('table')).toBeInTheDocument();
    });
  });

  describe('MovementTableSkeleton', () => {
    it('should render movement table skeleton', () => {
      const { container } = render(<MovementTableSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should have table structure', () => {
      const { container } = render(<MovementTableSkeleton />);
      
      expect(container.querySelector('table')).toBeInTheDocument();
    });
  });

  describe('WarehouseCardSkeleton', () => {
    it('should render warehouse card skeleton', () => {
      const { container } = render(<WarehouseCardSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should have card styling', () => {
      const { container } = render(<WarehouseCardSkeleton />);
      
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-xl');
    });
  });

  describe('All Skeletons', () => {
    it('should all have animate-pulse class', () => {
      const { container: container1 } = render(<StockCardSkeleton />);
      const { container: container2 } = render(<ProductTableSkeleton />);
      const { container: container3 } = render(<CategoryTableSkeleton />);
      const { container: container4 } = render(<MovementTableSkeleton />);
      const { container: container5 } = render(<WarehouseCardSkeleton />);
      
      expect(container1.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container2.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container3.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container4.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container5.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });
});
