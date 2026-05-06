/**
 * Tests for GlobalSearch component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import axiosInstance from '../api/axiosInstance';

// Mock dependencies
vi.mock('../api/axiosInstance');
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import { useAuth } from '../hooks/useAuth';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('GlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { business_id: 'business-123' },
    });
  });

  it('should render search input', () => {
    renderWithRouter(<GlobalSearch />);
    
    const input = screen.getByPlaceholderText('Rechercher...');
    expect(input).toBeInTheDocument();
  });

  it('should show keyboard shortcut hint', () => {
    renderWithRouter(<GlobalSearch />);
    
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('should not search when query is less than 2 characters', async () => {
    renderWithRouter(<GlobalSearch />);
    
    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.change(input, { target: { value: 'a' } });
    
    await waitFor(() => {
      expect(axiosInstance.get).not.toHaveBeenCalled();
    });
  });

  it('should perform search when query is 2+ characters', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: [] });
    
    renderWithRouter(<GlobalSearch />);
    
    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should show loading spinner during search', async () => {
    (axiosInstance.get as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
    );
    
    renderWithRouter(<GlobalSearch />);
    
    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('should display "no results" message when search returns empty', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: [] });
    
    renderWithRouter(<GlobalSearch />);
    
    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should have correct ARIA attributes', () => {
    renderWithRouter(<GlobalSearch />);
    
    const input = screen.getByPlaceholderText('Rechercher...');
    expect(input).toHaveAttribute('aria-label', 'Rechercher dans l\'application');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
});
