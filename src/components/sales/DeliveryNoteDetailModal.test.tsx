import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeliveryNoteDetailModal from './DeliveryNoteDetailModal';
import { useMarkDelivered, useCancelDeliveryNote, useDeliveryNote, useCleanDuplicates } from '../../hooks/useDeliveryNotes';
import { useSalesOrder } from '../../hooks/useSalesOrders';
import { useAuth } from '../../hooks/useAuth';
import { DeliveryNoteStatus } from '../../types/delivery-note';

vi.mock('../../hooks/useDeliveryNotes', () => ({
  useMarkDelivered: vi.fn(),
  useCancelDeliveryNote: vi.fn(),
  useDeliveryNote: vi.fn(),
  useCleanDuplicates: vi.fn(),
}));

vi.mock('../../hooks/useSalesOrders', () => ({
  useSalesOrder: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('./DeliveryNoteModal', () => ({
  default: () => <div>Edit Modal</div>,
}));

vi.mock('../ui/ConfirmModal', () => ({
  default: ({ onConfirm }: any) => (
    <button onClick={onConfirm}>Confirm Delete</button>
  ),
}));

vi.mock('../../utils/delivery-note-print', () => ({
  printDeliveryNote: vi.fn(),
}));

vi.mock('../../utils/business-info.utils', () => ({
  getBusinessInfo: vi.fn().mockResolvedValue({
    businessName: 'Test Business',
    businessMF: '1234567',
    businessAddress: 'Test Address',
  }),
}));

describe('DeliveryNoteDetailModal', () => {
  const mockOnClose = vi.fn();
  const mockOnDelete = vi.fn();

  const mockNote = {
    id: 'note-1',
    deliveryNoteNumber: 'BL-2024-001',
    status: DeliveryNoteStatus.PENDING,
    client: {
      id: 'client-1',
      name: 'Test Client',
    },
    deliveryDate: '2024-01-15',
    createdAt: '2024-01-10',
    salesOrderId: 'order-1',
    items: [
      {
        id: 'item-1',
        description: 'Product A',
        quantity: 10,
        deliveredQuantity: 10,
        salesOrderItemId: 'order-item-1',
      },
    ],
  };

  const mockSalesOrder = {
    id: 'order-1',
    orderNumber: 'CMD-2024-001',
    items: [
      {
        id: 'order-item-1',
        description: 'Product A',
        quantity: 10,
        unitPrice: 100,
        taxRate: 19,
        total: 1000,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      user: { id: 'user-1' },
    });

    (useDeliveryNote as any).mockReturnValue({
      data: mockNote,
      isLoading: false,
      refetch: vi.fn(),
    });

    (useSalesOrder as any).mockReturnValue({
      data: mockSalesOrder,
    });

    (useMarkDelivered as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    (useCancelDeliveryNote as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    (useCleanDuplicates as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it('should render modal correctly', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('BL-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Test Client')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display delivery note items', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('10.000')).toBeInTheDocument();
  });

  it('should display sales order items when linked', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Lignes de la commande client')).toBeInTheDocument();
    expect(screen.getByText('CMD-2024-001')).toBeInTheDocument();
  });

  it('should toggle items section', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const toggleButton = screen.getByText(/Articles livrés/);
    fireEvent.click(toggleButton);

    // Items should still be visible (default is expanded)
  });

  it('should show warning for zero quantity items', () => {
    const noteWithZeroQty = {
      ...mockNote,
      items: [
        {
          ...mockNote.items[0],
          deliveredQuantity: 0,
        },
      ],
    };

    (useDeliveryNote as any).mockReturnValue({
      data: noteWithZeroQty,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <DeliveryNoteDetailModal
        note={noteWithZeroQty}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Quantités livrées manquantes/)).toBeInTheDocument();
  });

  it('should show warning for duplicate items', () => {
    const noteWithDuplicates = {
      ...mockNote,
      items: [
        mockNote.items[0],
        { ...mockNote.items[0], id: 'item-2' },
      ],
    };

    (useDeliveryNote as any).mockReturnValue({
      data: noteWithDuplicates,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <DeliveryNoteDetailModal
        note={noteWithDuplicates}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Lignes en double détectées/)).toBeInTheDocument();
  });

  it('should handle mark as delivered', () => {
    const mockMutate = vi.fn();
    (useMarkDelivered as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const markDeliveredButton = screen.getByText('Marquer livré');
    fireEvent.click(markDeliveredButton);

    expect(mockMutate).toHaveBeenCalledWith('note-1', expect.any(Object));
  });

  it('should prevent marking as delivered when quantity is zero', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const noteWithZeroQty = {
      ...mockNote,
      items: [
        {
          ...mockNote.items[0],
          deliveredQuantity: 0,
        },
      ],
    };

    (useDeliveryNote as any).mockReturnValue({
      data: noteWithZeroQty,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <DeliveryNoteDetailModal
        note={noteWithZeroQty}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const markDeliveredButton = screen.getByText('Corriger quantités');
    fireEvent.click(markDeliveredButton);

    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should handle cancel delivery note', () => {
    const mockMutate = vi.fn();
    (useCancelDeliveryNote as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockMutate).toHaveBeenCalledWith('note-1');
  });

  it('should handle delete delivery note', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith('note-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should open edit modal', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const editButton = screen.getByText('Modifier');
    fireEvent.click(editButton);

    expect(screen.getByText('Edit Modal')).toBeInTheDocument();
  });

  it('should calculate delivery totals correctly', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Sous-total HT')).toBeInTheDocument();
    expect(screen.getByText('TVA')).toBeInTheDocument();
    expect(screen.getByText('Timbre fiscal')).toBeInTheDocument();
    expect(screen.getByText('Net TTC')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useDeliveryNote as any).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: vi.fn(),
    });

    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Chargement des détails...')).toBeInTheDocument();
  });

  it('should handle clean duplicates', () => {
    const mockMutate = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    (useCleanDuplicates as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    const noteWithDuplicates = {
      ...mockNote,
      items: [
        mockNote.items[0],
        { ...mockNote.items[0], id: 'item-2' },
      ],
    };

    (useDeliveryNote as any).mockReturnValue({
      data: noteWithDuplicates,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <DeliveryNoteDetailModal
        note={noteWithDuplicates}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const cleanButton = screen.getByText(/Nettoyer les doublons/);
    fireEvent.click(cleanButton);

    expect(mockMutate).toHaveBeenCalledWith('note-1', expect.any(Object));
    confirmSpy.mockRestore();
  });

  it('should not show edit button for delivered notes', () => {
    const deliveredNote = {
      ...mockNote,
      status: DeliveryNoteStatus.DELIVERED,
    };

    (useDeliveryNote as any).mockReturnValue({
      data: deliveredNote,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <DeliveryNoteDetailModal
        note={deliveredNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(
      <DeliveryNoteDetailModal
        note={mockNote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/10\/01\/2024/)).toBeInTheDocument();
  });
});
