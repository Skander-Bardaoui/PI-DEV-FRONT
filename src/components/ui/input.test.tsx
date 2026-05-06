/**
 * Tests for Input component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('should render input field', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('should accept user input', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(input).toHaveValue('test value');
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(onChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should have correct type attribute', () => {
    render(<Input type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should render password input', () => {
    render(<Input type="password" />);
    
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Input className="custom-class" />);
    
    const input = container.querySelector('input');
    expect(input?.className).toContain('custom-class');
  });

  it('should have aria-label when provided', () => {
    render(<Input aria-label="Search field" />);
    
    const input = screen.getByLabelText('Search field');
    expect(input).toBeInTheDocument();
  });

  it('should be required when required prop is true', () => {
    render(<Input required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });
});
