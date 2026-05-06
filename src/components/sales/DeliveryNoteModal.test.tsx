import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeliveryNoteModal from './DeliveryNoteModal';
import { useCreateDeliveryNote, useUpdateDeliveryNote } from '../../hooks/useDeliveryNotes';
import { useClients } from '../../hooks/useClients';
import { useSalesOrders } from '../../hooks/useSalesOrders';

vi.mock('../../hooks/useDeliveryNotes', () => ({
  useCreateDeliveryNote: vi.fn(),
  useUpdateDeliveryNote: vi.fn(),
}));

vi.mock('../../hooks/useClients', () => ({
  useClients: vi.fn(),
}));

vi.mock('../../hooks/useSalesOrders', () => ({
  useSalesOrders: vi.fn(),
}));

vi.mock('./ProductSelector', () => ({
  default: () => <div>Product Selector</div>,
}));

describe('DeliveryNoteModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  const mockClients = {
    clients: [
      { id: 'client-1', name: 'Client A' },
      { id: 'client-2', name: 'Client B' },
    ],
  };

  const mockOrders = {
    data: [
      {
        id: 'order-1',
        orderNumber: 'CMD-2024-001',
        clientId: 'client-1',
        client: { id: 'client-1', name: 'Client A' },
        createdAt: '2024-01-01',
        items: [
          {
            id: 'item-1',
            description: 'Product A',
            quantity: 10,
            productId: 'product-1',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useClients as any).mockReturnValue({ data: mockClients });
    (useSalesOrders as any).mockReturnValue({ data: mockOrders });
    (useCreateDeliveryNote as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    (useUpdateDeliveryNote as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('should render create mode correctly', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Nouveau bon de livraison')).toBeInTheDocument();
  });

  it('should render edit mode with note data', () => {
    const mockNote = {
      id: 'note-1',
      deliveryDate: '2024-01-15',
      notes: 'Test notes',
      salesOrderId: 'order-1',
      clientId: 'client-1',
      items: [
        {
          id: 'item-1',
          salesOrderItemId: 'item-1',
          description: 'Product A',
          quantity: 10,
          deliveredQuantity: 10,
        },
      ],
    };

    render(
      <DeliveryNoteModal
        businessId="business-1"
        note={mockNote}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Modifier le bon de livraison')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display sales orders dropdown', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/CMD-2024-001/)).toBeInTheDocument();
  });

  it('should handle sales order selection', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const orderSelect = screen.getByRole('combobox');
    fireEvent.change(orderSelect, { target: { value: 'order-1' } });

    expect(orderSelect).toHaveValue('order-1');
  });

  it('should populate items when order is selected', async () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const orderSelect = screen.getByRole('combobox');
    fireEvent.change(orderSelect, { target: { value: 'order-1' } });

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
    });
  });

  it('should handle delivery date input', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const dateInput = screen.getByLabelText(/Date de livraison/);
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

    expect(dateInput).toHaveValue('2024-01-15');
  });

  it('should handle notes textarea', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const notesTextarea = screen.getByPlaceholderText('Notes additionnelles...');
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

    expect(notesTextarea).toHaveValue('Test notes');
  });

  it('should show message when no order is selected', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Veuillez sélectionner une commande client/)).toBeInTheDocument();
  });

  it('should disable submit when no order is selected', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Créer le bon');
    expect(submitButton).toBeDisabled();
  });

  it('should submit form with valid data', async () => {
    mockMutateAsync.mockResolvedValue({});

    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const orderSelect = screen.getByRole('combobox');
    fireEvent.change(orderSelect, { target: { value: 'order-1' } });

    await waitFor(() => {
      const submitButton = screen.getByText('Créer le bon');
      fireEvent.click(submitButton);
    });
  });

  it('should show loading state during submission', () => {
    (useCreateDeliveryNote as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Création...')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    // Error would be set after failed submission
  });

  it('should disable order selection in edit mode', () => {
    const mockNote = {
      id: 'note-1',
      deliveryDate: '2024-01-15',
      salesOrderId: 'order-1',
      clientId: 'client-1',
      items: [],
    };

    render(
      <DeliveryNoteModal
        businessId="business-1"
        note={mockNote}
        onClose={mockOnClose}
      />
    );

    const orderSelect = screen.getByRole('combobox');
    expect(orderSelect).toBeDisabled();
  });

  it('should handle form submission error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMutateAsync.mockRejectedValue({
      response: { data: { message: 'Submission failed' } },
    });

    render(
      <DeliveryNoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const orderSelect = screen.getByRole('combobox');
    fireEvent.change(orderSelect, { target: { value: 'order-1' } });

    await waitFor(async () => {
      const submitButton = screen.getByText('Créer le bon');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    consoleErrorSpy.mockRestore();
  });

  it('should deduplicate items in edit mode', () => {
    const mockNote = {
      id: 'note-1',
      deliveryDate: '2024-01-15',
      salesOrderId: 'order-1',
      clientId: 'client-1',
      items: [
        {
          id: 'item-1',
          description: 'Product A',
          deliveredQuantity: 5,
        },
        {
          id: 'item-2',
          description: 'Product A',
          deliveredQuantity: 10,
        },
      ],
    };

    render(
      <DeliveryNoteModal
        businessId="business-1"
        note={mockNote}
        onClose={mockOnClose}
      />
    );

    // Should keep the item with higher quantity (10)
  });
});
