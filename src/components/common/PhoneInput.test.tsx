import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PhoneInput from './PhoneInput';

// Mock dependencies
vi.mock('react-phone-number-input', () => ({
  default: ({ value, onChange, onBlur, disabled, placeholder }: any) => (
    <input
      data-testid="phone-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('libphonenumber-js', () => ({
  parsePhoneNumber: (value: string) => {
    if (value === '+21612345678') {
      return {
        countryCallingCode: '216',
        nationalNumber: '12345678',
        country: 'TN',
      };
    }
    return null;
  },
  isValidPhoneNumber: (value: string) => {
    return value === '+21612345678';
  },
}));

describe('PhoneInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders phone input with label', () => {
    render(<PhoneInput value="" onChange={mockOnChange} />);
    
    expect(screen.getByText('Numéro de téléphone')).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<PhoneInput value="" onChange={mockOnChange} label="Custom Label" />);
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<PhoneInput value="" onChange={mockOnChange} required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays current phone value', () => {
    render(<PhoneInput value="+21612345678" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('phone-input') as HTMLInputElement;
    expect(input.value).toBe('+21612345678');
  });

  it('calls onChange when value changes', () => {
    render(<PhoneInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('phone-input');
    fireEvent.change(input, { target: { value: '+21612345678' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('+21612345678');
  });

  it('disables input when disabled prop is true', () => {
    render(<PhoneInput value="" onChange={mockOnChange} disabled />);
    
    const input = screen.getByTestId('phone-input');
    expect(input).toBeDisabled();
  });

  it('displays custom placeholder', () => {
    render(<PhoneInput value="" onChange={mockOnChange} placeholder="Enter phone" />);
    
    const input = screen.getByTestId('phone-input');
    expect(input).toHaveAttribute('placeholder', 'Enter phone');
  });

  it('shows error message when provided', () => {
    render(<PhoneInput value="" onChange={mockOnChange} error="Invalid phone number" />);
    
    expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
  });

  it('shows validation error for invalid phone after blur', () => {
    render(<PhoneInput value="+123" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('phone-input');
    fireEvent.blur(input);
    
    expect(screen.getByText(/Numéro de téléphone invalide/i)).toBeInTheDocument();
  });

  it('shows success state for valid phone', () => {
    render(<PhoneInput value="+21612345678" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('phone-input');
    fireEvent.blur(input);
    
    expect(screen.getByText(/Format international:/i)).toBeInTheDocument();
  });

  it('displays helper text when no value', () => {
    render(<PhoneInput value="" onChange={mockOnChange} />);
    
    expect(screen.getByText(/Sélectionnez votre pays et entrez votre numéro/i)).toBeInTheDocument();
  });

  it('does not show error for empty value when not required', () => {
    render(<PhoneInput value="" onChange={mockOnChange} required={false} />);
    
    const input = screen.getByTestId('phone-input');
    fireEvent.blur(input);
    
    expect(screen.queryByText(/invalide/i)).not.toBeInTheDocument();
  });
});
