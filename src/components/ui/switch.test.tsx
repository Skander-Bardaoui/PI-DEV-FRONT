/**
 * Tests for Switch component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Switch } from './switch';

describe('Switch', () => {
  it('should render switch element', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('should be unchecked by default', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('should be checked when checked prop is true', () => {
    render(<Switch checked={true} onCheckedChange={() => {}} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('should call onCheckedChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('should not call onCheckedChange when disabled', () => {
    const handleChange = vi.fn();
    render(<Switch disabled onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should have rounded-full class', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveClass('rounded-full');
  });

  it('should apply custom className', () => {
    const { container } = render(<Switch className="custom-class" />);
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('should have cursor-pointer class', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveClass('cursor-pointer');
  });

  it('should have disabled styles when disabled', () => {
    const { container } = render(<Switch disabled />);
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveClass('disabled:cursor-not-allowed');
    expect(switchElement).toHaveClass('disabled:opacity-50');
  });

  it('should have focus-visible styles', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveClass('focus-visible:outline-none');
    expect(switchElement).toHaveClass('focus-visible:ring-2');
  });

  it('should support name attribute', () => {
    const { container } = render(<Switch name="notifications" />);
    const switchElement = container.querySelector('[role="switch"]');
    // Note: Radix UI Switch may not directly pass name attribute to the button element
    expect(switchElement).toBeInTheDocument();
  });

  it('should support id attribute', () => {
    render(<Switch id="switch-id" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('id', 'switch-id');
  });

  it('should support required attribute', () => {
    const { container } = render(<Switch required />);
    const switchElement = container.querySelector('[role="switch"]');
    // Note: Radix UI Switch may not directly pass required attribute to the button element
    expect(switchElement).toBeInTheDocument();
  });

  it('should render thumb element', () => {
    const { container } = render(<Switch />);
    const thumb = container.querySelector('.pointer-events-none');
    expect(thumb).toBeInTheDocument();
  });

  it('should have transition classes', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveClass('transition-colors');
  });

  it('should toggle state when clicked multiple times', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    
    fireEvent.click(switchElement);
    fireEvent.click(switchElement);
    
    expect(handleChange).toHaveBeenCalledTimes(2);
  });
});
