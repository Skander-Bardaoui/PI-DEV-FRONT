/**
 * Tests for FingerScrollControl component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FingerScrollControl from './FingerScrollControl';

// Mock window.Hands and window.Camera
beforeEach(() => {
  (window as any).Hands = vi.fn();
  (window as any).Camera = vi.fn();
});

describe('FingerScrollControl', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isActive is false', () => {
    const { container } = render(
      <FingerScrollControl isActive={false} onClose={mockOnClose} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isActive is true', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    expect(screen.getByText('Contrôle par geste')).toBeInTheDocument();
  });

  it('should display initialization status', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Initialisation/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    const closeButtons = screen.getAllByLabelText('Désactiver');
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should minimize when minimize button is clicked', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    const minimizeButton = screen.getByLabelText('Réduire');
    fireEvent.click(minimizeButton);

    // After minimizing, the full panel should not be visible
    expect(screen.queryByText('Instructions:')).not.toBeInTheDocument();
  });

  it('should maximize when maximize button is clicked in minimized state', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    // First minimize
    const minimizeButton = screen.getByLabelText('Réduire');
    fireEvent.click(minimizeButton);

    // Then maximize
    const maximizeButton = screen.getByLabelText('Agrandir');
    fireEvent.click(maximizeButton);

    // Full panel should be visible again
    expect(screen.getByText('Instructions:')).toBeInTheDocument();
  });

  it('should display instructions', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Index/)).toBeInTheDocument();
    expect(screen.getByText(/Haut\/Bas/)).toBeInTheDocument();
    expect(screen.getByText(/Pince/)).toBeInTheDocument();
  });

  it('should display active indicator', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    expect(screen.getByText('DÉTECTION ACTIVE')).toBeInTheDocument();
  });

  it('should display tip about minimizing', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Astuce/)).toBeInTheDocument();
    expect(screen.getByText(/Réduire/)).toBeInTheDocument();
  });

  it('should have video elements', () => {
    const { container } = render(
      <FingerScrollControl isActive={true} onClose={mockOnClose} />
    );

    const videos = container.querySelectorAll('video');
    expect(videos.length).toBeGreaterThan(0);
  });

  it('should have canvas element for hand tracking', () => {
    const { container } = render(
      <FingerScrollControl isActive={true} onClose={mockOnClose} />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Chargement/)).toBeInTheDocument();
  });

  it('should show active badge in minimized state', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    // Minimize first
    const minimizeButton = screen.getByLabelText('Réduire');
    fireEvent.click(minimizeButton);

    expect(screen.getByText('ACTIF')).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    render(<FingerScrollControl isActive={true} onClose={mockOnClose} />);

    expect(screen.getByLabelText('Réduire')).toBeInTheDocument();
    expect(screen.getByLabelText('Désactiver')).toBeInTheDocument();
  });
});
