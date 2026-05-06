/**
 * Tests for Treasury SkeletonLoaders component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  AccountCardSkeleton,
  TransactionTableSkeleton,
  CashFlowChartSkeleton,
  TreasuryStatsSkeleton,
} from './SkeletonLoaders';

describe('Treasury SkeletonLoaders', () => {
  describe('AccountCardSkeleton', () => {
    it('should render skeleton card', () => {
      const { container } = render(<AccountCardSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should have proper card structure', () => {
      const { container } = render(<AccountCardSkeleton />);
      
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-xl');
    });
  });

  describe('TransactionTableSkeleton', () => {
    it('should render table skeleton', () => {
      const { container } = render(<TransactionTableSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render with custom rows', () => {
      const { container } = render(<TransactionTableSkeleton rows={5} />);
      
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should render default rows', () => {
      const { container } = render(<TransactionTableSkeleton />);
      
      const rows = container.querySelectorAll('tr');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('CashFlowChartSkeleton', () => {
    it('should render chart skeleton', () => {
      const { container } = render(<CashFlowChartSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should have chart container styling', () => {
      const { container } = render(<CashFlowChartSkeleton />);
      
      const chart = container.firstChild;
      expect(chart).toHaveClass('bg-white', 'rounded-xl');
    });
  });

  describe('TreasuryStatsSkeleton', () => {
    it('should render stats skeleton', () => {
      const { container } = render(<TreasuryStatsSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render multiple stat cards', () => {
      const { container } = render(<TreasuryStatsSkeleton />);
      
      const cards = container.querySelectorAll('.bg-white');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('All Skeletons', () => {
    it('should all have animate-pulse animation', () => {
      const { container: c1 } = render(<AccountCardSkeleton />);
      const { container: c2 } = render(<TransactionTableSkeleton />);
      const { container: c3 } = render(<CashFlowChartSkeleton />);
      const { container: c4 } = render(<TreasuryStatsSkeleton />);
      
      expect(c1.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(c2.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(c3.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(c4.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should all have white background', () => {
      const { container: c1 } = render(<AccountCardSkeleton />);
      const { container: c2 } = render(<TransactionTableSkeleton />);
      const { container: c3 } = render(<CashFlowChartSkeleton />);
      const { container: c4 } = render(<TreasuryStatsSkeleton />);
      
      expect(c1.querySelector('.bg-white')).toBeInTheDocument();
      expect(c2.querySelector('.bg-white')).toBeInTheDocument();
      expect(c3.querySelector('.bg-white')).toBeInTheDocument();
      expect(c4.querySelector('.bg-white')).toBeInTheDocument();
    });
  });
});
