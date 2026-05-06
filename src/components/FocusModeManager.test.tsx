/**
 * Tests for FocusModeManager component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FocusModeManager from './FocusModeManager';

// Mock hooks
vi.mock('../context/AccessibilityContext', () => ({
  useAccessibility: vi.fn(),
}));

vi.mock('../hooks/useFocusMode', () => ({
  useFocusMode: vi.fn(),
}));

import { useAccessibility } from '../context/AccessibilityContext';
import { useFocusMode } from '../hooks/useFocusMode';

describe('FocusModeManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when focus mode is disabled', () => {
    (useAccessibility as any).mockReturnValue({
      settings: { focusMode: false, textToSpeech: false },
    });

    const { container } = render(<FocusModeManager />);
    expect(container.firstChild).toBeNull();
  });

  it('should render indicator when focus mode is enabled', () => {
    (useAccessibility as any).mockReturnValue({
      settings: { focusMode: true, textToSpeech: false },
    });

    render(<FocusModeManager />);
    expect(screen.getByText('Mode Focus actif')).toBeInTheDocument();
  });

  it('should call useFocusMode with correct config', () => {
    (useAccessibility as any).mockReturnValue({
      settings: { focusMode: true, textToSpeech: false },
    });

    render(<FocusModeManager />);
    
    expect(useFocusMode).toHaveBeenCalledWith({
      enabled: true,
      overlayOpacity: 0.85,
      highlightPadding: 20,
      fontSizeIncrease: 2,
    });
  });

  it('should adjust margin when text-to-speech is active', () => {
    (useAccessibility as any).mockReturnValue({
      settings: { focusMode: true, textToSpeech: true },
    });

    const { container } = render(<FocusModeManager />);
    const indicator = container.firstChild as HTMLElement;
    
    expect(indicator.style.marginBottom).toBe('50px');
  });

  it('should have no margin when text-to-speech is inactive', () => {
    (useAccessibility as any).mockReturnValue({
      settings: { focusMode: true, textToSpeech: false },
    });

    const { container } = render(<FocusModeManager />);
    const indicator = container.firstChild as HTMLElement;
    
    expect(indicator.style.marginBottom).toBe('0px');
  });
});
