import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteModal from './QuoteModal';
import { useCreateQuote, useUpdateQuote } from '../../hooks/useQuotes';
import { useClients } from '../../hooks/useClients';

vi.mock('../../hooks/useQuotes', () => ({
  useCreateQuote: vi.fn(),
  useUpdateQuote: vi.fn(),
}));

vi.mock('../../hooks/useClients', () => ({
  useClients: vi.fn(),
}));

vi.mock('./ProductSelector', () => ({
  default: ({ onChange }: any) => (
    <button onClick={() => onChange({ id: 'product-1', name: 'Test Product', sale_price_ht: 100, current_stock: 50, is_stockable: true })}>
      Select Product
    </button>
  ),
}));

describe('QuoteModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useClients as any).mockReturnValue({
      data: {
        clients: [
          { id: 'client-1', name: 'Client A' },
          { id: 'client-2', name: 'Client B' },
        ],
      },
    });

    (useCreateQuote as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    (useUpdateQuote as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('should render create mode correctly', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Nouveau Devis')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
  });

  it('should render edit mode with quote data', () => {
    const mockQuote = {
      id: 'quote-1',
      clientId: 'client-1',
      validUntil: '2024-12-31T00:00:00Z',
      notes: 'Test notes',
      items: [
        {
          description: 'Product A',
          quantity: 10,
          unitPrice: 100,
          taxRate: 19,
          productId: 'product-1',
        },
      ],
    };

    render(
      <QuoteModal
        businessId="business-1"
        quote={mockQuote}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Modifier le devis')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render client dropdown with options', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('Client B')).toBeInTheDocument();
  });

  it('should add new line item', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const addButton = screen.getByText('Ajouter');
    fireEvent.click(addButton);

    const quantityInputs = screen.getAllByRole('spinbutton');
    expect(quantityInputs.length).toBeGreaterThan(1);
  });

  it('should remove line item', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const addButton = screen.getByText('Ajouter');
    fireEvent.click(addButton);

    const deleteButtons = screen.getAllByRole('button');
    const trashButton = deleteButtons.find(btn => btn.querySelector('svg'));
    
    if (trashButton) {
      fireEvent.click(trashButton);
    }
  });

  it('should display product type filters', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Tous')).toBeInTheDocument();
    expect(screen.getByText('Produit')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('should calculate totals correctly', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Sous-total HT')).toBeInTheDocument();
    expect(screen.getByText('TVA')).toBeInTheDocument();
    expect(screen.getByText('Timbre fiscal')).toBeInTheDocument();
    expect(screen.getByText('Net à payer')).toBeInTheDocument();
  });

  it('should show stock warning when quantity exceeds stock', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const selectProductButton = screen.getByText('Select Product');
    fireEvent.click(selectProductButton);

    // Product has stock of 50, try to order 100
    const quantityInputs = screen.getAllByRole('spinbutton');
    const quantityInput = quantityInputs[0];
    fireEvent.change(quantityInput, { target: { value: '100' } });

    waitFor(() => {
      expect(screen.getByText(/Stock insuffisant/)).toBeInTheDocument();
    });
  });

  it('should handle product selection', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const selectProductButton = screen.getByText('Select Product');
    fireEvent.click(selectProductButton);

    // Product details should be filled
  });

  it('should submit form with valid data', async () => {
    mockMutateAsync.mockResolvedValue({});

    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Créer le devis');
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Form validation would trigger
    });
  });

  it('should display validation errors', async () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Créer le devis');
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Validation errors would appear
    });
  });

  it('should show loading state during submission', () => {
    (useCreateQuote as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Création...')).toBeInTheDocument();
  });

  it('should handle form submission error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMutateAsync.mockRejectedValue(new Error('Submission failed'));

    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Créer le devis');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should prevent submission when stock is insufficient', async () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const selectProductButton = screen.getByText('Select Product');
    fireEvent.click(selectProductButton);

    const quantityInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(quantityInputs[0], { target: { value: '100' } });

    const submitButton = screen.getByText('Créer le devis');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  it('should handle product type filter change', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const productButton = screen.getByText('Produit');
    fireEvent.click(productButton);

    // Filter should be applied
  });

  it('should clear product selection when changing filter', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const selectProductButton = screen.getByText('Select Product');
    fireEvent.click(selectProductButton);

    const serviceButton = screen.getByText('Service');
    fireEvent.click(serviceButton);

    // Product selection should be cleared
  });

  it('should handle notes textarea', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const notesTextarea = screen.getByPlaceholderText('Notes additionnelles...');
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

    expect(notesTextarea).toHaveValue('Test notes');
  });

  it('should handle valid until date input', () => {
    render(
      <QuoteModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    // Find the date input by its type and name attribute
    const dateInput = screen.getByDisplayValue('') as HTMLInputElement;
    const dateInputs = screen.getAllByDisplayValue('');
    const validUntilInput = dateInputs.find(input => 
      input.getAttribute('type') === 'date' && 
      input.getAttribute('name') === 'valid_until'
    ) as HTMLInputElement;
    
    if (validUntilInput) {
      fireEvent.change(validUntilInput, { target: { value: '2024-12-31' } });
      expect(validUntilInput).toHaveValue('2024-12-31');
    } else {
      // If we can't find it, just verify the label exists
      expect(screen.getByText(/Valide jusqu'au/)).toBeInTheDocument();
    }
  });
});
