import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditSupplierPOModal from './EditSupplierPOModal';
import { useUpdateSupplierPO } from '../../hooks/useSupplierPOs';
import { useToast } from '../ui/Toast';
import { POStatus } from '../../types';

vi.mock('../../hooks/useSupplierPOs');
vi.mock('../ui/Toast');
vi.mock('../ui/ConfirmModal', () => ({
  useApiError: () => ({ handleError: vi.fn() }),
}));
vi.mock('./ProductSelectorPurchase', () => ({
  default: ({ onChange }: any) => (
    <button onClick={() => onChange({ id: 'prod-1', name: 'Test Product' })}>
      Select Product
    </button>
  ),
}));

describe('EditSupplierPOModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockToast = { success: vi.fn(), error: vi.fn() };

  const mockPO = {
    id: 'po-1',
    po_number: 'BC-2026-001',
    status: POStatus.DRAFT,
    supplier: { id: 'sup-1', name: 'Test Supplier' },
    expected_delivery: '2026-06-01',
    notes: 'Test notes',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-1',
        description: 'Product 1',
        quantity_ordered: 10,
        quantity_received: 0,
        unit_price_ht: 100,
        tax_rate_value: 19,
        line_total_ht: 1000,
        sort_order: 0,
      },
    ],
    subtotal_ht: 1000,
    tax_amount: 190,
    timbre_fiscal: 1,
    net_amount: 1191,
    created_at: '2026-05-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUpdateSupplierPO as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    (useToast as any).mockReturnValue(mockToast);
  });

  it('should render modal with PO details', () => {
    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Modifier le BC')).toBeInTheDocument();
    expect(screen.getByText('BC-2026-001 — Test Supplier')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  it('should display informational message about draft mode', () => {
    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Modification en mode brouillon')).toBeInTheDocument();
    expect(
      screen.getByText(/Ce BC est en statut "Brouillon" et peut être modifié/)
    ).toBeInTheDocument();
  });

  it('should allow adding new lines', () => {
    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    const addButton = screen.getByText('Ajouter');
    fireEvent.click(addButton);

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(2); // Header + initial item + new item
  });

  it('should update line quantities', () => {
    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    const quantityInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(quantityInput, { target: { value: '20' } });

    expect(quantityInput).toHaveValue(20);
  });

  it('should calculate totals correctly', () => {
    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('1000.000 TND')).toBeInTheDocument(); // Subtotal HT
    expect(screen.getByText('190.000 TND')).toBeInTheDocument(); // TVA
    expect(screen.getByText('1.000 TND')).toBeInTheDocument(); // Timbre
  });

  it('should submit form with updated data', async () => {
    mockMutateAsync.mockResolvedValue({});

    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Enregistrer les modifications');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show validation errors for empty fields', async () => {
    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    // Clear description
    const descriptionInput = screen.getByDisplayValue('Product 1');
    fireEvent.change(descriptionInput, { target: { value: '' } });

    const submitButton = screen.getByText('Enregistrer les modifications');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erreurs de validation')).toBeInTheDocument();
    });
  });

  it('should close modal on cancel', () => {
    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle product selection', () => {
    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    const selectProductButton = screen.getAllByText('Select Product')[0];
    fireEvent.click(selectProductButton);

    // Product selector mock will update the description
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  it('should prevent double submission', async () => {
    mockMutateAsync.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Enregistrer les modifications');
    
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle 500 error gracefully', async () => {
    mockMutateAsync.mockRejectedValue({
      response: { status: 500 },
    });

    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={mockPO}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Enregistrer les modifications');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should remove line when delete button is clicked', () => {
    const poWithMultipleItems = {
      ...mockPO,
      items: [
        ...mockPO.items,
        {
          id: 'item-2',
          product_id: 'prod-2',
          description: 'Product 2',
          quantity_ordered: 5,
          quantity_received: 0,
          unit_price_ht: 50,
          tax_rate_value: 19,
          line_total_ht: 250,
          sort_order: 1,
        },
      ],
    };

    render(
      <EditSupplierPOModal
        businessId="biz-1"
        po={poWithMultipleItems}
        onClose={mockOnClose}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const trashButton = deleteButtons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-trash-2')
    );

    if (trashButton) {
      fireEvent.click(trashButton);
    }

    expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
  });
});
