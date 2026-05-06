/**
 * Tests for LanguageSwitcher component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

import { useTranslation } from 'react-i18next';

describe('LanguageSwitcher', () => {
  const mockChangeLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTranslation as any).mockReturnValue({
      i18n: {
        language: 'fr',
        changeLanguage: mockChangeLanguage,
      },
    });
  });

  describe('navbar variant', () => {
    it('should render compact button with flag', () => {
      render(<LanguageSwitcher variant="navbar" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toContain('🇫🇷');
    });

    it('should toggle language when clicked', () => {
      render(<LanguageSwitcher variant="navbar" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });

    it('should show FR text when language is French', () => {
      render(<LanguageSwitcher variant="navbar" />);
      
      expect(screen.getByText('FR')).toBeInTheDocument();
    });

    it('should show EN text when language is English', () => {
      (useTranslation as any).mockReturnValue({
        i18n: {
          language: 'en',
          changeLanguage: mockChangeLanguage,
        },
      });
      
      render(<LanguageSwitcher variant="navbar" />);
      
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('🇬🇧')).toBeInTheDocument();
    });
  });

  describe('page variant', () => {
    it('should render two buttons side by side', () => {
      render(<LanguageSwitcher variant="page" />);
      
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should highlight current language', () => {
      const { container } = render(<LanguageSwitcher variant="page" />);
      
      const frButton = screen.getByText('Français').closest('button');
      expect(frButton?.className).toContain('bg-white');
      expect(frButton?.className).toContain('text-indigo-600');
    });

    it('should switch language when button clicked', () => {
      render(<LanguageSwitcher variant="page" />);
      
      const enButton = screen.getByText('English');
      fireEvent.click(enButton);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });

    it('should not call changeLanguage when clicking current language', () => {
      render(<LanguageSwitcher variant="page" />);
      
      const frButton = screen.getByText('Français');
      fireEvent.click(frButton);
      
      expect(mockChangeLanguage).not.toHaveBeenCalled();
    });
  });

  describe('minimal variant', () => {
    it('should render FR | EN text', () => {
      render(<LanguageSwitcher variant="minimal" />);
      
      expect(screen.getByText('FR')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('|')).toBeInTheDocument();
    });

    it('should highlight current language', () => {
      const { container } = render(<LanguageSwitcher variant="minimal" />);
      
      const frButton = screen.getByText('FR');
      expect(frButton.className).toContain('text-indigo-600');
    });

    it('should switch language when clicked', () => {
      render(<LanguageSwitcher variant="minimal" />);
      
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });
});
