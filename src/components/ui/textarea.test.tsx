/**
 * Tests for Textarea component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('should render textarea element', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('should accept placeholder', () => {
    render(<Textarea placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('should accept value', () => {
    render(<Textarea value="Test value" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Test value')).toBeInTheDocument();
  });

  it('should call onChange when text is entered', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('should have min-h-[80px] class', () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('min-h-[80px]');
  });

  it('should have rounded corners', () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('rounded-md');
  });

  it('should have border', () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('border');
  });

  it('should apply custom className', () => {
    const { container } = render(<Textarea className="custom-class" />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('should support rows attribute', () => {
    render(<Textarea rows={5} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('should support maxLength attribute', () => {
    render(<Textarea maxLength={100} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('should support required attribute', () => {
    render(<Textarea required />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeRequired();
  });

  it('should support readOnly attribute', () => {
    render(<Textarea readOnly />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('readOnly');
  });

  it('should support name attribute', () => {
    render(<Textarea name="description" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('name', 'description');
  });

  it('should support id attribute', () => {
    render(<Textarea id="textarea-id" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('id', 'textarea-id');
  });

  it('should have disabled styles when disabled', () => {
    const { container } = render(<Textarea disabled />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('disabled:cursor-not-allowed');
    expect(textarea).toHaveClass('disabled:opacity-50');
  });

  it('should have focus styles', () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('focus-visible:outline-none');
    expect(textarea).toHaveClass('focus-visible:ring-2');
  });
});
