import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ValidationErrorDisplay, FieldError, FieldSuccess } from './ValidationErrorDisplay';

describe('ValidationErrorDisplay', () => {
  it('renders nothing when errors array is empty', () => {
    const { container } = render(<ValidationErrorDisplay errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error messages when errors are provided', () => {
    const errors = [
      { field: 'Email', message: 'Email is required' },
      { field: 'Password', message: 'Password must be at least 8 characters' },
    ];
    
    render(<ValidationErrorDisplay errors={errors} />);
    
    expect(screen.getByText('Erreur de validation')).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Password:/)).toBeInTheDocument();
    expect(screen.getByText(/Password must be at least 8 characters/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const errors = [{ field: 'Test', message: 'Test error' }];
    const { container } = render(<ValidationErrorDisplay errors={errors} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays alert icon', () => {
    const errors = [{ field: 'Test', message: 'Test error' }];
    render(<ValidationErrorDisplay errors={errors} />);
    
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

describe('FieldError', () => {
  it('renders nothing when error is undefined', () => {
    const { container } = render(<FieldError />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when error is empty string', () => {
    const { container } = render(<FieldError error="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message when provided', () => {
    render(<FieldError error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FieldError error="Test error" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays error icon', () => {
    render(<FieldError error="Test error" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

describe('FieldSuccess', () => {
  it('renders success message', () => {
    render(<FieldSuccess message="Field is valid" />);
    
    expect(screen.getByText('Field is valid')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FieldSuccess message="Success" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays success icon', () => {
    render(<FieldSuccess message="Success" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
