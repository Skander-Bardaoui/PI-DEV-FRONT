import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeliveryNoteFromSalesOrderModal from './DeliveryNoteFromSalesOrderModal';
import { useCreateDeliveryNoteFromSalesOrder } from '../../hooks/useDeliveryNotes';
import { useToast } from '../ui/Toast';

vi.mock('../../hooks/useDeliveryNotes', () => ({
  useCreateDeliveryNoteFromSalesOrder: vi.fn(),
}));

vi.mock('../ui/Toast', () => ({
  useToast: vi.fn(),
}));

describe('DeliveryNoteFromSalesOrderModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const mockSalesOrder = {
    id: 'order-1',
    orderNumber: 'CMD-2024-001',
    clientId: 'client-1',
    client: {
      id: 'client-1',
      name: 'Test Client',
    },
    items: [
      {
        id: 'item-1',
        description: 'Product A',
        quantity: 10,
        unitPrice: 100,
        productId: 'product-1',
      },
      {
        id: 'item-2',
        description: 'Product B',
        quantity: 5,
        unitPrice: 200,
        productId: 'product-2',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useToast as any).mockReturnValue(mockToast);
    (useCreateDeliveryNoteFromSalesOrder as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('should render modal correctly', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Nouveau Bon de Livraison')).toBeInTheDocument();
    expect(screen.getByText(/CMD-2024-001/)).toBeInTheDocument();
    expect(screen.getByText(/Test Client/)).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display sales order items', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
  });

  it('should pre-fill quantities with ordered amounts', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const quantityInputs = screen.getAllByRole('spinbutton');
    expect(quantityInputs[0]).toHaveValue(10);
    expect(quantityInputs[1]).toHaveValue(5);
  });

  it('should handle fill all button', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const fillAllButton = screen.getByText('Tout livrer');
    fireEvent.click(fillAllButton);

    const quantityInputs = screen.getAllByRole('spinbutton');
    expect(quantityInputs[0]).toHaveValue(10);
    expect(quantityInputs[1]).toHaveValue(5);
  });

  it('should calculate total value correctly', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    // Total: (10 * 100) + (5 * 200) = 2000
    expect(screen.getByText(/2000\.00 TND/)).toBeInTheDocument();
  });

  it('should handle quantity input change', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const quantityInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(quantityInputs[0], { target: { value: '5' } });

    expect(quantityInputs[0]).toHaveValue(5);
  });

  it('should show warning when quantity exceeds ordered', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const quantityInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(quantityInputs[0], { target: { value: '15' } });

    waitFor(() => {
      expect(screen.getByText(/Max : 10\.000/)).toBeInTheDocument();
    });
  });

  it('should handle delivery date input', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const dateInput = screen.getByLabelText(/Date de livraison/);
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

    expect(dateInput).toHaveValue('2024-01-15');
  });

  it('should handle notes textarea', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const notesTextarea = screen.getByPlaceholderText(/Livraison conforme/);
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

    expect(notesTextarea).toHaveValue('Test notes');
  });

  it('should submit form with valid data', async () => {
    mockMutateAsync.mockResolvedValue({});

    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Valider la livraison');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show error when no quantities are entered', async () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    // Set all quantities to 0
    const quantityInputs = screen.getAllByRole('spinbutton');
    quantityInputs.forEach(input => {
      fireEvent.change(input, { target: { value: '0' } });
    });

    const submitButton = screen.getByText('Valider la livraison');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Validation',
        'Saisissez au moins une quantité livrée supérieure à 0'
      );
    });
  });

  it('should show loading state during submission', () => {
    (useCreateDeliveryNoteFromSalesOrder as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
  });

  it('should disable submit when no items have quantity', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const quantityInputs = screen.getAllByRole('spinbutton');
    quantityInputs.forEach(input => {
      fireEvent.change(input, { target: { value: '0' } });
    });

    const submitButton = screen.getByText('Valider la livraison');
    expect(submitButton).toBeDisabled();
  });

  it('should show message when all items are delivered', () => {
    const fullyDeliveredOrder = {
      ...mockSalesOrder,
      items: [],
    };

    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={fullyDeliveredOrder}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Toutes les lignes ont été entièrement livrées/)).toBeInTheDocument();
  });

  it('should handle form submission error', async () => {
    mockMutateAsync.mockRejectedValue({
      response: { data: { message: 'Submission failed' } },
    });

    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Valider la livraison');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erreur', 'Submission failed');
    });
  });

  it('should display unit prices correctly', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('100.00 TND')).toBeInTheDocument();
    expect(screen.getByText('200.00 TND')).toBeInTheDocument();
  });

  it('should update line value when quantity changes', () => {
    render(
      <DeliveryNoteFromSalesOrderModal
        businessId="business-1"
        salesOrder={mockSalesOrder}
        onClose={mockOnClose}
      />
    );

    const quantityInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(quantityInputs[0], { target: { value: '5' } });

    // Line value should be 5 * 100 = 500
    waitFor(() => {
      expect(screen.getByText('500.00 TND')).toBeInTheDocument();
    });
  });
});
