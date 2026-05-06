import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecurringInvoiceBulkActions from './RecurringInvoiceBulkActions';

describe('RecurringInvoiceBulkActions', () => {
  const mockOnActivate = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when selectedCount is 0', () => {
      const { container } = render(
        <RecurringInvoiceBulkActions
          selectedCount={0}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when selectedCount is greater than 0', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={3}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      expect(screen.getByText('3 sélectionnées')).toBeInTheDocument();
    });

    it('should show singular text for 1 item', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={1}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      expect(screen.getByText('1 sélectionnée')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={2}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      expect(screen.getByText('Activer')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onActivate when activate button is clicked', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={2}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByText('Activer'));
      expect(mockOnActivate).toHaveBeenCalled();
    });

    it('should call onPause when pause button is clicked', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={2}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByText('Pause'));
      expect(mockOnPause).toHaveBeenCalled();
    });

    it('should show delete confirmation when delete button is clicked', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={2}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByText('Supprimer'));
      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
    });

    it('should call onClear when clear button is clicked', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={2}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      const clearButton = screen.getByTitle('Annuler la sélection');
      fireEvent.click(clearButton);
      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  describe('Delete Confirmation', () => {
    it('should show confirmation dialog with correct count', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={3}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByText('Supprimer'));
      expect(screen.getByText(/3 factures récurrentes/i)).toBeInTheDocument();
    });

    it('should call onDelete when confirmed', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={2}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByText('Supprimer'));
      const confirmButton = screen.getAllByText('Supprimer')[1];
      fireEvent.click(confirmButton);
      expect(mockOnDelete).toHaveBeenCalled();
    });

    it('should close dialog when cancel is clicked', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={2}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
        />
      );
      fireEvent.click(screen.getByText('Supprimer'));
      fireEvent.click(screen.getByText('Annuler'));
      expect(screen.queryByText('Confirmer la suppression')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when loading', () => {
      render(
        <RecurringInvoiceBulkActions
          selectedCount={2}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onDelete={mockOnDelete}
          onClear={mockOnClear}
          isLoading={true}
        />
      );
      expect(screen.getByText('Activer')).toBeDisabled();
      expect(screen.getByText('Pause')).toBeDisabled();
      expect(screen.getByText('Supprimer')).toBeDisabled();
    });
  });
});
