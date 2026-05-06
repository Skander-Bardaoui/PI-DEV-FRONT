/**
 * Tests for Label component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Label } from './label';

describe('Label', () => {
  it('should render children', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should have text-sm class', () => {
    const { container } = render(<Label>Label</Label>);
    const label = container.firstChild;
    expect(label).toHaveClass('text-sm');
  });

  it('should have font-medium class', () => {
    const { container } = render(<Label>Label</Label>);
    const label = container.firstChild;
    expect(label).toHaveClass('font-medium');
  });

  it('should apply custom className', () => {
    const { container } = render(<Label className="custom-class">Label</Label>);
    const label = container.firstChild;
    expect(label).toHaveClass('custom-class');
  });

  it('should support htmlFor attribute', () => {
    render(<Label htmlFor="input-id">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('should have peer-disabled styles', () => {
    const { container } = render(<Label>Label</Label>);
    const label = container.firstChild;
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
    expect(label).toHaveClass('peer-disabled:opacity-70');
  });

  it('should render with custom id', () => {
    render(<Label id="custom-id">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('id', 'custom-id');
  });

  it('should support onClick handler', () => {
    const handleClick = vi.fn();
    render(<Label onClick={handleClick}>Label</Label>);
    
    const label = screen.getByText('Label');
    fireEvent.click(label);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
