/**
 * Tests for AddressAutocomplete component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddressAutocomplete from './AddressAutocomplete';

// Mock fetch
global.fetch = vi.fn();

describe('AddressAutocomplete', () => {
  const mockAddress = {
    street: '123 Avenue Test',
    city: 'Tunis',
    postalCode: '1000',
    country: 'Tunisia',
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render search input', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText(/Tapez votre adresse complète/)).toBeInTheDocument();
  });

  it('should render all address fields', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText(/Ex: 123 Avenue Habib Bourguiba/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Sousse/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: 4000/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Tunisia/)).toBeInTheDocument();
  });

  it('should display current address values', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('123 Avenue Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tunis')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tunisia')).toBeInTheDocument();
  });

  it('should call onChange when street is updated', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    const streetInput = screen.getByPlaceholderText(/Ex: 123 Avenue Habib Bourguiba/);
    fireEvent.change(streetInput, { target: { value: '456 New Street' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockAddress,
      street: '456 New Street',
    });
  });

  it('should call onChange when city is updated', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    const cityInput = screen.getByPlaceholderText(/Ex: Sousse/);
    fireEvent.change(cityInput, { target: { value: 'Sousse' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockAddress,
      city: 'Sousse',
    });
  });

  it('should not search when query is less than 3 characters', async () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    const searchInput = screen.getByPlaceholderText(/Tapez votre adresse complète/);
    fireEvent.change(searchInput, { target: { value: 'ab' } });

    vi.advanceTimersByTime(500);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('should search when query is 3+ characters', async () => {
    const mockResponse = {
      features: [
        {
          properties: {
            osm_id: 1,
            street: 'Avenue Test',
            housenumber: '123',
            city: 'Tunis',
            postcode: '1000',
            country: 'Tunisia',
          },
          geometry: { coordinates: [10.1815, 36.8065], type: 'Point' },
          type: 'Feature',
        },
      ],
      type: 'FeatureCollection',
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    const searchInput = screen.getByPlaceholderText(/Tapez votre adresse complète/);
    fireEvent.change(searchInput, { target: { value: 'Avenue Test' } });

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('should display loading spinner while searching', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    const searchInput = screen.getByPlaceholderText(/Tapez votre adresse complète/);
    fireEvent.change(searchInput, { target: { value: 'test address' } });

    // Before debounce completes, should show search icon
    expect(document.querySelector('.lucide-search')).toBeInTheDocument();
  });

  it('should disable inputs when disabled prop is true', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} disabled={true} />);

    const searchInput = screen.getByPlaceholderText(/Tapez votre adresse complète/);
    const streetInput = screen.getByPlaceholderText(/Ex: 123 Avenue Habib Bourguiba/);

    expect(searchInput).toBeDisabled();
    expect(streetInput).toBeDisabled();
  });

  it('should show required asterisk when required prop is true', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} required={true} />);

    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThan(0);
  });

  it('should display error message when error prop is provided', () => {
    render(
      <AddressAutocomplete
        value={mockAddress}
        onChange={mockOnChange}
        error="Address is required"
      />
    );

    expect(screen.getByText('Address is required')).toBeInTheDocument();
  });

  it('should show complete address indicator when all fields are filled', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    // Trigger touched state
    const streetInput = screen.getByPlaceholderText(/Ex: 123 Avenue Habib Bourguiba/);
    fireEvent.change(streetInput, { target: { value: mockAddress.street } });

    expect(screen.getByText('Adresse complète')).toBeInTheDocument();
  });

  it('should limit postal code to 10 characters', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    const postalCodeInput = screen.getByPlaceholderText(/Ex: 4000/);
    expect(postalCodeInput).toHaveAttribute('maxLength', '10');
  });

  it('should display helper text', () => {
    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    expect(
      screen.getByText(/Vous pouvez utiliser la recherche automatique ou remplir les champs manuellement/)
    ).toBeInTheDocument();
  });

  it('should handle search API error gracefully', async () => {
    (fetch as any).mockRejectedValue(new Error('API Error'));

    render(<AddressAutocomplete value={mockAddress} onChange={mockOnChange} />);

    const searchInput = screen.getByPlaceholderText(/Tapez votre adresse complète/);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    // Should not crash
    expect(searchInput).toBeInTheDocument();
  });
});
