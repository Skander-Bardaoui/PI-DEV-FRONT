/**
 * Tests for AccessibilityButton component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccessibilityButton from './AccessibilityButton';

// Mock useAccessibility hook
vi.mock('../context/AccessibilityContext', () => ({
  useAccessibility: vi.fn(),
}));

import { useAccessibility } from '../context/AccessibilityContext';

describe('AccessibilityButton', () => {
  const mockToggleAccessibilityPanel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAccessibility as any).mockReturnValue({
      toggleAccessibilityPanel: mockToggleAccessibilityPanel,
    });
  });

  it('should render button with correct aria-label', () => {
    render(<AccessibilityButton />);
    
    const button = screen.getByRole('button', { name: /ouvrir le panneau d'accessibilité/i });
    expect(button).toBeInTheDocument();
  });

  it('should have correct title attribute', () => {
    render(<AccessibilityButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Accessibilité');
  });

  it('should call toggleAccessibilityPanel when clicked', () => {
    render(<AccessibilityButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggleAccessibilityPanel).toHaveBeenCalledTimes(1);
  });

  it('should render Eye icon', () => {
    const { container } = render(<AccessibilityButton />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have fixed positioning classes', () => {
    const { container } = render(<AccessibilityButton />);
    
    const button = container.querySelector('button');
    expect(button?.className).toContain('fixed');
    expect(button?.className).toContain('bottom-6');
    expect(button?.className).toContain('right-24');
  });
});
