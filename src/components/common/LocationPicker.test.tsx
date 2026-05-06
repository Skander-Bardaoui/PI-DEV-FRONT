import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LocationPicker from './LocationPicker';

// Mock dependencies
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, draggable, eventHandlers }: any) => (
    <div
      data-testid="marker"
      data-position={JSON.stringify(position)}
      data-draggable={draggable}
      onClick={() => eventHandlers?.dragend?.({ target: { getLatLng: () => ({ lat: position[0], lng: position[1] }) } })}
    />
  ),
  useMapEvents: ({ click }: any) => {
    return null;
  },
  useMap: () => ({
    setView: vi.fn(),
  }),
}));

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
    DragEndEvent: class {},
  },
}));

global.fetch = vi.fn();

describe('LocationPicker', () => {
  const mockOnChange = vi.fn();
  const defaultValue = {
    address: '123 Test Street',
    latitude: 36.8065,
    longitude: 10.1815,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders location picker with all controls', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/Adresse complète/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recherche de localisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Longitude/i)).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('displays current address value', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const addressInput = screen.getByLabelText(/Adresse complète/i) as HTMLInputElement;
    expect(addressInput.value).toBe('123 Test Street');
  });

  it('displays current coordinates', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const latInput = screen.getByLabelText(/Latitude/i) as HTMLInputElement;
    const lngInput = screen.getByLabelText(/Longitude/i) as HTMLInputElement;
    
    expect(latInput.value).toBe('36.8065');
    expect(lngInput.value).toBe('10.1815');
  });

  it('calls onChange when address is updated', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const addressInput = screen.getByLabelText(/Adresse complète/i);
    fireEvent.change(addressInput, { target: { value: 'New Address' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultValue,
      address: 'New Address',
    });
  });

  it('calls onChange when latitude is updated', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const latInput = screen.getByLabelText(/Latitude/i);
    fireEvent.change(latInput, { target: { value: '37.5' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultValue,
      latitude: 37.5,
    });
  });

  it('calls onChange when longitude is updated', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const lngInput = screen.getByLabelText(/Longitude/i);
    fireEvent.change(lngInput, { target: { value: '11.5' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultValue,
      longitude: 11.5,
    });
  });

  it('disables inputs when disabled prop is true', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} disabled />);
    
    const addressInput = screen.getByLabelText(/Adresse complète/i);
    const searchInput = screen.getByPlaceholderText(/Rechercher une ville/i);
    const latInput = screen.getByLabelText(/Latitude/i);
    const lngInput = screen.getByLabelText(/Longitude/i);
    
    expect(addressInput).toBeDisabled();
    expect(searchInput).toBeDisabled();
    expect(latInput).toBeDisabled();
    expect(lngInput).toBeDisabled();
  });

  it('performs search when typing in search input', async () => {
    const mockSearchResults = [
      {
        place_id: 1,
        display_name: 'Test Location 1',
        lat: '36.8',
        lon: '10.2',
        boundingbox: [],
      },
    ];
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    } as Response);
    
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const searchInput = screen.getByPlaceholderText(/Rechercher une ville/i);
    fireEvent.change(searchInput, { target: { value: 'Test Location' } });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org/search'),
        expect.any(Object)
      );
    }, { timeout: 1000 });
  });

  it('does not search for queries shorter than 3 characters', async () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const searchInput = screen.getByPlaceholderText(/Rechercher une ville/i);
    fireEvent.change(searchInput, { target: { value: 'Te' } });
    
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('renders marker when coordinates are provided', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const marker = screen.getByTestId('marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveAttribute('data-position', JSON.stringify([36.8065, 10.1815]));
  });

  it('marker is draggable when not disabled', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    const marker = screen.getByTestId('marker');
    expect(marker).toHaveAttribute('data-draggable', 'true');
  });

  it('marker is not draggable when disabled', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} disabled />);
    
    const marker = screen.getByTestId('marker');
    expect(marker).toHaveAttribute('data-draggable', 'false');
  });

  it('displays helper text', () => {
    render(<LocationPicker value={defaultValue} onChange={mockOnChange} />);
    
    expect(screen.getByText(/Saisissez l'adresse complète ou utilisez la carte/i)).toBeInTheDocument();
    expect(screen.getByText(/Cliquez sur la carte pour placer un marqueur/i)).toBeInTheDocument();
    expect(screen.getByText(/Sélectionnez votre pays et entrez votre numéro/i)).toBeInTheDocument();
  });
});
