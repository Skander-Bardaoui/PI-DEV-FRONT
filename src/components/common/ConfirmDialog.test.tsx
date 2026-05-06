/**
 * Tests for ConfirmDialog component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    );

    const backdrop = screen.getByRole('dialog').parentElement;
    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when dialog content is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    );

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should display custom confirm text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        confirmText="Delete"
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should display custom cancel text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        cancelText="Go Back"
      />
    );

    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('should display danger variant icon', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        variant="danger"
      />
    );

    expect(container.querySelector('.lucide-x-circle')).toBeInTheDocument();
  });

  it('should display warning variant icon', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        variant="warning"
      />
    );

    expect(container.querySelector('.lucide-alert-triangle')).toBeInTheDocument();
  });

  it('should display info variant icon', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        variant="info"
      />
    );

    expect(container.querySelector('.lucide-info')).toBeInTheDocument();
  });

  it('should display success variant icon', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        variant="success"
      />
    );

    expect(container.querySelector('.lucide-check-circle')).toBeInTheDocument();
  });

  it('should disable buttons when isLoading is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        isLoading={true}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Confirm');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  it('should show loading spinner when isLoading is true', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        isLoading={true}
      />
    );

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
  });

  it('should apply danger variant styling', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        variant="danger"
      />
    );

    const header = container.querySelector('.bg-red-50');
    expect(header).toBeInTheDocument();
  });

  it('should apply warning variant styling', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        variant="warning"
      />
    );

    const header = container.querySelector('.bg-orange-50');
    expect(header).toBeInTheDocument();
  });

  it('should apply info variant styling', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        variant="info"
      />
    );

    const header = container.querySelector('.bg-blue-50');
    expect(header).toBeInTheDocument();
  });

  it('should apply success variant styling', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        variant="success"
      />
    );

    const header = container.querySelector('.bg-green-50');
    expect(header).toBeInTheDocument();
  });
});
