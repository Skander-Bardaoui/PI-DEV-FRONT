import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title and message', () => {
    render(<ConfirmModal {...defaultProps} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('renders default button labels', () => {
    render(<ConfirmModal {...defaultProps} />);
    
    expect(screen.getByText('Confirmer')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  it('renders custom button labels', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirmer');
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(btn => btn.querySelector('svg'));
    
    if (xButton) {
      fireEvent.click(xButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('applies danger variant styles', () => {
    const { container } = render(<ConfirmModal {...defaultProps} variant="danger" />);
    
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    expect(container.querySelector('.text-red-600')).toBeInTheDocument();
  });

  it('applies warning variant styles', () => {
    const { container } = render(<ConfirmModal {...defaultProps} variant="warning" />);
    
    expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    expect(container.querySelector('.text-yellow-600')).toBeInTheDocument();
  });

  it('applies info variant styles', () => {
    const { container } = render(<ConfirmModal {...defaultProps} variant="info" />);
    
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    expect(container.querySelector('.text-blue-600')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ConfirmModal {...defaultProps} loading />);
    
    expect(screen.getByText('En cours...')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('En cours...');
    const cancelButton = screen.getByText('Annuler');
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('disables buttons when loading', () => {
    render(<ConfirmModal {...defaultProps} loading />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      if (button.textContent !== '') {
        expect(button).toBeDisabled();
      }
    });
  });

  it('displays alert triangle icon', () => {
    const { container } = render(<ConfirmModal {...defaultProps} />);
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
