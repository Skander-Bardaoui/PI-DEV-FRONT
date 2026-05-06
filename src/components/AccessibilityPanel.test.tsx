/**
 * Tests for AccessibilityPanel component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccessibilityPanel from './AccessibilityPanel';

// Mock dependencies
vi.mock('../context/AccessibilityContext', () => ({
  useAccessibility: vi.fn(),
}));

vi.mock('../hooks/useReadingMode', () => ({
  useReadingMode: vi.fn(),
}));

vi.mock('../hooks/useColorTheme', () => ({
  useColorTheme: vi.fn(),
}));

import { useAccessibility } from '../context/AccessibilityContext';
import { useReadingMode } from '../hooks/useReadingMode';
import { useColorTheme } from '../hooks/useColorTheme';

describe('AccessibilityPanel', () => {
  const mockUpdateSetting = vi.fn();
  const mockResetSettings = vi.fn();
  const mockToggleAccessibilityPanel = vi.fn();
  const mockToggleFingerScroll = vi.fn();
  const mockToggleReadingMode = vi.fn();
  const mockChangeColorTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAccessibility as any).mockReturnValue({
      settings: {
        fontSize: 16,
        contrast: 'normal',
        lineHeight: 1.5,
        letterSpacing: 0,
        cursorSize: 'normal',
        simplifiedMode: false,
        focusMode: false,
        textToSpeech: false,
        dyslexiaFont: false,
        highlightLinks: false,
        reduceAnimations: false,
      },
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
      isAccessibilityPanelOpen: true,
      toggleAccessibilityPanel: mockToggleAccessibilityPanel,
      isFingerScrollActive: false,
      toggleFingerScroll: mockToggleFingerScroll,
    });

    (useReadingMode as any).mockReturnValue({
      isReadingMode: false,
      toggleReadingMode: mockToggleReadingMode,
    });

    (useColorTheme as any).mockReturnValue({
      colorTheme: 'normal',
      changeColorTheme: mockChangeColorTheme,
    });
  });

  it('should not render when panel is closed', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {},
      isAccessibilityPanelOpen: false,
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
      toggleAccessibilityPanel: mockToggleAccessibilityPanel,
      isFingerScrollActive: false,
      toggleFingerScroll: mockToggleFingerScroll,
    });

    const { container } = render(<AccessibilityPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('should render panel when open', () => {
    render(<AccessibilityPanel />);
    expect(screen.getByText('Accessibilité')).toBeInTheDocument();
  });

  it('should close panel when close button is clicked', () => {
    render(<AccessibilityPanel />);
    
    const closeButton = screen.getByLabelText('Fermer le panneau d\'accessibilité');
    fireEvent.click(closeButton);
    
    expect(mockToggleAccessibilityPanel).toHaveBeenCalledTimes(1);
  });

  it('should close panel when backdrop is clicked', () => {
    render(<AccessibilityPanel />);
    
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    fireEvent.click(backdrop!);
    
    expect(mockToggleAccessibilityPanel).toHaveBeenCalledTimes(1);
  });

  it('should increase font size', () => {
    render(<AccessibilityPanel />);
    
    const increaseButton = screen.getByLabelText('Augmenter la taille du texte');
    fireEvent.click(increaseButton);
    
    expect(mockUpdateSetting).toHaveBeenCalledWith('fontSize', 18);
  });

  it('should decrease font size', () => {
    render(<AccessibilityPanel />);
    
    const decreaseButton = screen.getByLabelText('Diminuer la taille du texte');
    fireEvent.click(decreaseButton);
    
    expect(mockUpdateSetting).toHaveBeenCalledWith('fontSize', 14);
  });

  it('should not decrease font size below 12', () => {
    (useAccessibility as any).mockReturnValue({
      settings: { fontSize: 12 },
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
      isAccessibilityPanelOpen: true,
      toggleAccessibilityPanel: mockToggleAccessibilityPanel,
      isFingerScrollActive: false,
      toggleFingerScroll: mockToggleFingerScroll,
    });

    render(<AccessibilityPanel />);
    
    const decreaseButton = screen.getByLabelText('Diminuer la taille du texte');
    fireEvent.click(decreaseButton);
    
    expect(mockUpdateSetting).toHaveBeenCalledWith('fontSize', 12);
  });

  it('should not increase font size above 24', () => {
    (useAccessibility as any).mockReturnValue({
      settings: { fontSize: 24 },
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
      isAccessibilityPanelOpen: true,
      toggleAccessibilityPanel: mockToggleAccessibilityPanel,
      isFingerScrollActive: false,
      toggleFingerScroll: mockToggleFingerScroll,
    });

    render(<AccessibilityPanel />);
    
    const increaseButton = screen.getByLabelText('Augmenter la taille du texte');
    fireEvent.click(increaseButton);
    
    expect(mockUpdateSetting).toHaveBeenCalledWith('fontSize', 24);
  });

  it('should change contrast setting', () => {
    render(<AccessibilityPanel />);
    
    const highContrastButton = screen.getByText('Élevé');
    fireEvent.click(highContrastButton);
    
    expect(mockUpdateSetting).toHaveBeenCalledWith('contrast', 'high');
  });

  it('should change color theme', () => {
    render(<AccessibilityPanel />);
    
    const protanopiaButton = screen.getByText('Protanopie');
    fireEvent.click(protanopiaButton);
    
    expect(mockChangeColorTheme).toHaveBeenCalledWith('protanopia');
  });

  it('should update line height', () => {
    render(<AccessibilityPanel />);
    
    const lineHeightSlider = screen.getByLabelText('Hauteur de ligne');
    fireEvent.change(lineHeightSlider, { target: { value: '2.0' } });
    
    expect(mockUpdateSetting).toHaveBeenCalledWith('lineHeight', 2.0);
  });

  it('should update letter spacing', () => {
    render(<AccessibilityPanel />);
    
    const letterSpacingSlider = screen.getByLabelText('Espacement des lettres');
    fireEvent.change(letterSpacingSlider, { target: { value: '2.5' } });
    
    expect(mockUpdateSetting).toHaveBeenCalledWith('letterSpacing', 2.5);
  });

  it('should change cursor size', () => {
    render(<AccessibilityPanel />);
    
    const largeCursorButton = screen.getByText('Grand');
    fireEvent.click(largeCursorButton);
    
    expect(mockUpdateSetting).toHaveBeenCalledWith('cursorSize', 'large');
  });

  it('should toggle reading mode', () => {
    render(<AccessibilityPanel />);
    
    const readingModeToggle = screen.getByText('Mode Lecture').closest('label');
    const checkbox = readingModeToggle?.querySelector('input[type="checkbox"]');
    fireEvent.click(checkbox!);
    
    expect(mockToggleReadingMode).toHaveBeenCalledTimes(1);
  });

  it('should toggle finger scroll', () => {
    render(<AccessibilityPanel />);
    
    const fingerScrollToggle = screen.getByText('Contrôle par geste').closest('label');
    const checkbox = fingerScrollToggle?.querySelector('input[type="checkbox"]');
    fireEvent.click(checkbox!);
    
    expect(mockToggleFingerScroll).toHaveBeenCalledTimes(1);
  });

  it('should reset all settings', () => {
    render(<AccessibilityPanel />);
    
    const resetButton = screen.getByText('Réinitialiser tous les paramètres');
    fireEvent.click(resetButton);
    
    expect(mockResetSettings).toHaveBeenCalledTimes(1);
  });

  it('should have correct ARIA attributes', () => {
    render(<AccessibilityPanel />);
    
    const panel = screen.getByRole('dialog');
    expect(panel).toHaveAttribute('aria-labelledby', 'accessibility-title');
    expect(panel).toHaveAttribute('aria-modal', 'true');
  });

  it('should display current font size value', () => {
    render(<AccessibilityPanel />);
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  it('should display current line height value', () => {
    render(<AccessibilityPanel />);
    expect(screen.getByText('1.5')).toBeInTheDocument();
  });
});
