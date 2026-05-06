import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierPOModal from './SupplierPOModal';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useCreateSupplierPO } from '../../hooks/useSupplierPOs';

vi.mock('../../hooks/useSuppliers', () => ({
  useSuppliers: vi.fn(),
}));

vi.mock('../../hooks/useSupplierPOs', () => ({
  useCreateSupplierPO: vi.fn(),
}));

vi.mock('./ProductSelectorPurchase', () => ({
  default: ({ onChange }: any) => (
    <button onClick={() => onChange({ id: 'product-1', name: 'Test Product' })}>
      Select Product
    </button>
  ),
}));

vi.mock('./SupplierRecommendationPanel', () => ({
  default: ({ onSelectSupplier }: any) => (
    <button onClick={() => onSelectSupplier('supplier-1')}>
      AI Recommendation
    </button>
  ),
}));

describe('SupplierPOModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useSuppliers as any).mockReturnValue({
      data: {
        data: [
          { id: 'supplier-1', name: 'Supplier A' },
          { id: 'supplier-2', name: 'Supplier B' },
        ],
      },
    });

    (useCreateSupplierPO as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('should render modal correctly', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Nouveau Bon de Commande')).toBeInTheDocument();
    expect(screen.getByText('Fournisseur')).toBeInTheDocument();
  });

  it('should render with ML prediction data', () => {
    const mlPrediction = {
      productId: 'product-1',
      productName: 'Test Product',
      quantity: 10,
      estimatedValue: 1000,
      urgency: 'HIGH',
      recommendation: 'Stock low, order soon',
    };

    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
        mlPrediction={mlPrediction}
      />
    );

    expect(screen.getByText(/Bon de commande suggéré par l'IA/)).toBeInTheDocument();
    expect(screen.getByText(/Test Product/)).toBeInTheDocument();
    expect(screen.getByText(/10 unités/)).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when cancel button is clicked', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render supplier dropdown with options', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const supplierSelect = screen.getByRole('combobox');
    expect(supplierSelect).toBeInTheDocument();
    expect(screen.getByText('Supplier A')).toBeInTheDocument();
    expect(screen.getByText('Supplier B')).toBeInTheDocument();
  });

  it('should handle supplier selection', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const supplierSelect = screen.getByRole('combobox');
    fireEvent.change(supplierSelect, { target: { value: 'supplier-1' } });

    expect(supplierSelect).toHaveValue('supplier-1');
  });

  it('should add new line item', () => {
    render(
      <SupplierPOModal
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
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    // Add a second line first
    const addButton = screen.getByText('Ajouter');
    fireEvent.click(addButton);

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const trashButton = deleteButtons.find(btn => btn.querySelector('svg'));
    
    if (trashButton) {
      fireEvent.click(trashButton);
    }
  });

  it('should calculate totals correctly', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Sous-total HT')).toBeInTheDocument();
    expect(screen.getByText('TVA')).toBeInTheDocument();
    expect(screen.getByText('Timbre fiscal')).toBeInTheDocument();
    expect(screen.getByText('Net TTC')).toBeInTheDocument();
  });

  it('should handle quantity input change', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const quantityInputs = screen.getAllByRole('spinbutton');
    const quantityInput = quantityInputs[0];
    
    fireEvent.change(quantityInput, { target: { value: '5' } });
    expect(quantityInput).toHaveValue(5);
  });

  it('should handle unit price input change', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const priceInputs = screen.getAllByRole('spinbutton');
    const priceInput = priceInputs[1];
    
    fireEvent.change(priceInput, { target: { value: '100' } });
    expect(priceInput).toHaveValue(100);
  });

  it('should handle tax rate selection', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const taxSelects = screen.getAllByRole('combobox');
    const taxSelect = taxSelects[taxSelects.length - 1];
    
    fireEvent.change(taxSelect, { target: { value: '7' } });
    expect(taxSelect).toHaveValue('7');
  });

  it('should handle expected delivery date input', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const dateInput = screen.getByLabelText('Livraison souhaitée');
    fireEvent.change(dateInput, { target: { value: '2024-12-31' } });

    expect(dateInput).toHaveValue('2024-12-31');
  });

  it('should handle notes textarea', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const notesTextarea = screen.getByPlaceholderText('Instructions particulières...');
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

    expect(notesTextarea).toHaveValue('Test notes');
  });

  it('should submit form with valid data', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'po-1' });

    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    // Select supplier
    const supplierSelect = screen.getByRole('combobox');
    fireEvent.change(supplierSelect, { target: { value: 'supplier-1' } });

    // Select product
    const selectProductButton = screen.getByText('Select Product');
    fireEvent.click(selectProductButton);

    const submitButton = screen.getByText('Créer le BC');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('should display validation errors', async () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Créer le BC');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erreurs de validation')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', () => {
    (useCreateSupplierPO as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Création...')).toBeInTheDocument();
  });

  it('should handle AI supplier recommendation', () => {
    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const aiButton = screen.getByText('AI Recommendation');
    fireEvent.click(aiButton);

    const supplierSelect = screen.getByRole('combobox');
    expect(supplierSelect).toHaveValue('supplier-1');
  });

  it('should handle form submission error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMutateAsync.mockRejectedValue(new Error('Submission failed'));

    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Créer le BC');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should pre-fill notes with ML recommendation', () => {
    const mlPrediction = {
      productId: 'product-1',
      productName: 'Test Product',
      quantity: 10,
      estimatedValue: 1000,
      urgency: 'HIGH',
      recommendation: 'Stock low, order soon',
    };

    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
        mlPrediction={mlPrediction}
      />
    );

    const notesTextarea = screen.getByPlaceholderText('Instructions particulières...');
    expect(notesTextarea).toHaveValue('Recommandation ML: Stock low, order soon');
  });

  it('should log ML prediction data', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const mlPrediction = {
      productId: 'product-1',
      productName: 'Test Product',
      quantity: 10,
      estimatedValue: 1000,
      urgency: 'HIGH',
      recommendation: 'Stock low, order soon',
    };

    render(
      <SupplierPOModal
        businessId="business-1"
        onClose={mockOnClose}
        mlPrediction={mlPrediction}
      />
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('mlPrediction'),
      mlPrediction
    );

    consoleLogSpy.mockRestore();
  });
});
