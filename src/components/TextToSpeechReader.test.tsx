/**
 * Tests for TextToSpeechReader component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextToSpeechReader from './TextToSpeechReader';

// Mock dependencies
vi.mock('../context/AccessibilityContext', () => ({
  useAccessibility: vi.fn(),
}));

vi.mock('../hooks/useTextToSpeech', () => ({
  useTextToSpeech: vi.fn(),
}));

import { useAccessibility } from '../context/AccessibilityContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

describe('TextToSpeechReader', () => {
  const mockSpeak = vi.fn();
  const mockStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTextToSpeech as any).mockReturnValue({
      speak: mockSpeak,
      stop: mockStop,
    });
  });

  it('should not render when textToSpeech is disabled', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: false,
      },
    });

    const { container } = render(<TextToSpeechReader />);
    expect(container.firstChild).toBeNull();
  });

  it('should render indicator when textToSpeech is enabled', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: true,
      },
    });

    render(<TextToSpeechReader />);
    expect(document.body.textContent).toContain('Lecteur vocal actif');
  });

  it('should call useTextToSpeech with correct config', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: true,
      },
    });

    render(<TextToSpeechReader />);

    expect(useTextToSpeech).toHaveBeenCalledWith({
      enabled: true,
      rate: 1,
      pitch: 1,
      volume: 1,
      lang: 'fr-FR',
    });
  });

  it('should have correct styling for indicator', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: true,
      },
    });

    const { container } = render(<TextToSpeechReader />);
    
    const indicator = container.querySelector('[style*="position: fixed"]');
    expect(indicator).toBeInTheDocument();
  });

  it('should display speaker icon', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: true,
      },
    });

    const { container } = render(<TextToSpeechReader />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should be positioned at bottom left', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: true,
      },
    });

    const { container } = render(<TextToSpeechReader />);
    
    const indicator = container.querySelector('[style*="bottom: 20"]');
    expect(indicator).toBeInTheDocument();
  });

  it('should have high z-index', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: true,
      },
    });

    const { container } = render(<TextToSpeechReader />);
    
    const indicator = container.querySelector('[style*="z-index: 9999"]');
    expect(indicator).toBeInTheDocument();
  });

  it('should not be interactive (pointer-events: none)', () => {
    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: true,
      },
    });

    const { container } = render(<TextToSpeechReader />);
    
    const indicator = container.querySelector('[style*="pointer-events: none"]');
    expect(indicator).toBeInTheDocument();
  });

  it('should update when settings change', () => {
    const { rerender } = render(<TextToSpeechReader />);

    (useAccessibility as any).mockReturnValue({
      settings: {
        textToSpeech: false,
      },
    });

    rerender(<TextToSpeechReader />);

    expect(document.body.textContent).not.toContain('Lecteur vocal actif');
  });
});
