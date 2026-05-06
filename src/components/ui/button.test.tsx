/**
 * Tests for Button component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should apply default variant styles', () => {
    const { container } = render(<Button>Click me</Button>);
    
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-primary');
  });

  it('should apply destructive variant styles', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-destructive');
  });

  it('should apply outline variant styles', () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    
    const button = container.querySelector('button');
    expect(button?.className).toContain('border');
  });

  it('should apply ghost variant styles', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    
    const button = container.querySelector('button');
    expect(button?.className).toContain('hover:bg-accent');
  });

  it('should apply small size styles', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    
    const button = container.querySelector('button');
    expect(button?.className).toContain('h-9');
  });

  it('should apply large size styles', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    
    const button = container.querySelector('button');
    expect(button?.className).toContain('h-11');
  });

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});
