/**
 * Tests for KeyboardShortcutsHelp component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

describe('KeyboardShortcutsHelp', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <KeyboardShortcutsHelp isOpen={false} onClose={mockOnClose} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Raccourcis Clavier')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Fermer l\'aide des raccourcis clavier');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when footer close button is clicked', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const footerCloseButton = screen.getByRole('button', { name: 'Fermer' });
    fireEvent.click(footerCloseButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display navigation shortcuts', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('NAVIGATION')).toBeInTheDocument();
    expect(screen.getByText('Aller au Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Aller aux Achats')).toBeInTheDocument();
    expect(screen.getByText('Aller aux Ventes')).toBeInTheDocument();
    expect(screen.getByText('Aller au Stock')).toBeInTheDocument();
    expect(screen.getByText('Aller à la Trésorerie')).toBeInTheDocument();
  });

  it('should display action shortcuts', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('ACTIONS')).toBeInTheDocument();
    expect(screen.getByText('Activer la recherche')).toBeInTheDocument();
    expect(screen.getByText(/Fermer modal\/panel/)).toBeInTheDocument();
  });

  it('should display keyboard navigation shortcuts', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('NAVIGATION AU CLAVIER')).toBeInTheDocument();
    expect(screen.getByText('Élément suivant')).toBeInTheDocument();
    expect(screen.getByText('Élément précédent')).toBeInTheDocument();
    expect(screen.getByText('Activer/Cliquer')).toBeInTheDocument();
    expect(screen.getByText('Cocher/Décocher')).toBeInTheDocument();
  });

  it('should display keyboard key badges', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const altKeys = screen.getAllByText('Alt');
    expect(altKeys.length).toBeGreaterThan(0);

    const ctrlKeys = screen.getAllByText('Ctrl');
    expect(ctrlKeys.length).toBeGreaterThan(0);

    const tabKeys = screen.getAllByText('Tab');
    expect(tabKeys.length).toBeGreaterThan(0);
  });

  it('should display tip section', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/💡 Astuce:/)).toBeInTheDocument();
    expect(screen.getByText(/Tous les éléments interactifs sont accessibles/)).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-labelledby', 'shortcuts-title');
    expect(modal).toHaveAttribute('aria-describedby', 'shortcuts-description');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('should have description text', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Utilisez ces raccourcis pour naviguer plus rapidement')).toBeInTheDocument();
  });

  it('should display keyboard icon', () => {
    const { container } = render(
      <KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />
    );

    const icon = container.querySelector('.lucide-keyboard');
    expect(icon).toBeInTheDocument();
  });

  it('should have proper list structure with ARIA labels', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const navigationList = screen.getByLabelText('Raccourcis Navigation');
    expect(navigationList).toBeInTheDocument();

    const actionsList = screen.getByLabelText('Raccourcis Actions');
    expect(actionsList).toBeInTheDocument();

    const keyboardNavList = screen.getByLabelText('Raccourcis Navigation au clavier');
    expect(keyboardNavList).toBeInTheDocument();
  });

  it('should display all Alt+number shortcuts', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should display Ctrl+K shortcut', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('should display Escape key', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Échap')).toBeInTheDocument();
  });

  it('should display Shift key', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Shift')).toBeInTheDocument();
  });

  it('should display Enter and Space keys', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Enter')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
  });
});
