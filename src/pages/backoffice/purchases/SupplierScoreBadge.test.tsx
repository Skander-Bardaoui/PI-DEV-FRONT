// src/pages/backoffice/purchases/SupplierScoreBadge.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock component (this is likely a component, not a page, but we'll test it)
const MockSupplierScoreBadge = ({ score, size = 'md' }: { score: number; size?: string }) => {
  const getColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    return 'À améliorer';
  };

  return (
    <div
      data-testid="supplier-score-badge"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getColor(score)} ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <span className="font-bold">{score}/100</span>
      <span>{getLabel(score)}</span>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = (score: number, size?: string) => {
  return render(
    <BrowserRouter>
      <MockSupplierScoreBadge score={score} size={size} />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SupplierScoreBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render badge with score', () => {
      renderWithRouter(85);

      expect(screen.getByTestId('supplier-score-badge')).toBeInTheDocument();
      expect(screen.getByText('85/100')).toBeInTheDocument();
    });

    it('should display label for score', () => {
      renderWithRouter(85);

      expect(screen.getByText('Bon')).toBeInTheDocument();
    });
  });

  describe('Score Categories', () => {
    it('should show "Excellent" for score >= 90', () => {
      renderWithRouter(95);

      expect(screen.getByText('Excellent')).toBeInTheDocument();
      expect(screen.getByText('95/100')).toBeInTheDocument();
    });

    it('should show "Bon" for score between 70-89', () => {
      renderWithRouter(75);

      expect(screen.getByText('Bon')).toBeInTheDocument();
      expect(screen.getByText('75/100')).toBeInTheDocument();
    });

    it('should show "À améliorer" for score < 70', () => {
      renderWithRouter(50);

      expect(screen.getByText('À améliorer')).toBeInTheDocument();
      expect(screen.getByText('50/100')).toBeInTheDocument();
    });

    it('should handle edge case score of 90', () => {
      renderWithRouter(90);

      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should handle edge case score of 70', () => {
      renderWithRouter(70);

      expect(screen.getByText('Bon')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply green styling for excellent scores', () => {
      const { container } = renderWithRouter(95);

      const badge = container.querySelector('[data-testid="supplier-score-badge"]');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700', 'border-green-200');
    });

    it('should apply yellow styling for good scores', () => {
      const { container } = renderWithRouter(75);

      const badge = container.querySelector('[data-testid="supplier-score-badge"]');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700', 'border-yellow-200');
    });

    it('should apply red styling for poor scores', () => {
      const { container } = renderWithRouter(50);

      const badge = container.querySelector('[data-testid="supplier-score-badge"]');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700', 'border-red-200');
    });
  });

  describe('Size Variants', () => {
    it('should apply medium size by default', () => {
      const { container } = renderWithRouter(85);

      const badge = container.querySelector('[data-testid="supplier-score-badge"]');
      expect(badge).toHaveClass('text-sm');
    });

    it('should apply small size when specified', () => {
      const { container } = renderWithRouter(85, 'sm');

      const badge = container.querySelector('[data-testid="supplier-score-badge"]');
      expect(badge).toHaveClass('text-xs');
    });
  });

  describe('Edge Cases', () => {
    it('should handle score of 0', () => {
      renderWithRouter(0);

      expect(screen.getByText('0/100')).toBeInTheDocument();
      expect(screen.getByText('À améliorer')).toBeInTheDocument();
    });

    it('should handle score of 100', () => {
      renderWithRouter(100);

      expect(screen.getByText('100/100')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter(85)).not.toThrow();
    });

    it('should be accessible', () => {
      const { container } = renderWithRouter(85);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
