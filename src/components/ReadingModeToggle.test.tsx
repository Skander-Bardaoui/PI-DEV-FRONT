/**
 * Tests for ReadingModeToggle component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadingModeToggle from './ReadingModeToggle';

// Mock useReadingMode hook
vi.mock('../hooks/useReadingMode', () => ({
  useReadingMode: vi.fn(),
}));

import { useReadingMode } from '../hooks/useReadingMode';

describe('ReadingModeToggle', () => {
  const mockToggleReadingMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render "Mode lecture" when reading mode is off', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    expect(screen.getByText('Mode lecture')).toBeInTheDocument();
  });

  it('should render "Quitter la lecture" when reading mode is on', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: true,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    expect(screen.getByText('Quitter la lecture')).toBeInTheDocument();
  });

  it('should call toggleReadingMode when clicked', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleReadingMode).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label when reading mode is off', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Activer le mode lecture');
  });

  it('should have correct aria-label when reading mode is on', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: true,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Désactiver le mode lecture');
  });

  it('should have aria-pressed attribute', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should have aria-pressed="true" when reading mode is on', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: true,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should have correct title when reading mode is off', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Activer le mode lecture');
  });

  it('should have correct title when reading mode is on', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: true,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Quitter le mode lecture');
  });

  it('should have reading-mode-toggle class', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    render(<ReadingModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('reading-mode-toggle');
  });

  it('should render BookOpen icon when reading mode is off', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    const { container } = render(<ReadingModeToggle />);

    const icon = container.querySelector('.lucide-book-open');
    expect(icon).toBeInTheDocument();
  });

  it('should render X icon when reading mode is on', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: true,
      toggleReadingMode: mockToggleReadingMode,
    });

    const { container } = render(<ReadingModeToggle />);

    const icon = container.querySelector('.lucide-x');
    expect(icon).toBeInTheDocument();
  });

  it('should have aria-hidden on icons', () => {
    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    const { container } = render(<ReadingModeToggle />);

    const icon = container.querySelector('.reading-mode-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
