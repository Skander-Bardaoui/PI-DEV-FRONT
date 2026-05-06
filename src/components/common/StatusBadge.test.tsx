/**
 * Tests for StatusBadge component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('should render with status text', () => {
    render(<StatusBadge status="active" />);
    
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should apply success variant styles', () => {
    const { container } = render(<StatusBadge status="active" variant="success" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-green');
  });

  it('should apply warning variant styles', () => {
    const { container } = render(<StatusBadge status="pending" variant="warning" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-yellow');
  });

  it('should apply error variant styles', () => {
    const { container } = render(<StatusBadge status="failed" variant="error" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-red');
  });

  it('should apply default variant styles', () => {
    const { container } = render(<StatusBadge status="unknown" variant="default" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-gray');
  });

  it('should render with custom className', () => {
    const { container } = render(<StatusBadge status="test" className="custom-class" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('custom-class');
  });
});
