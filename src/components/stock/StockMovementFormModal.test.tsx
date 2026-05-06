import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StockMovementFormModal } from './StockMovementFormModal';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../hooks/useFormValidation', () => ({
  useFormValidation: vi.fn(() => ({
    errors: {},
    validationErrors: [],
    validate: vi.fn(() => true),
    validateField: vi.fn(),
    clearErrors: vi.fn(),
  })),
}));

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Ordinateur Dell',
    reference: 'DELL-001',
    sku: 'DELL-001',
    type: 'PHYSICAL' as const,
    is_stockable: true,
    is_active: true,
    current_stock: 10,
    quantity: 10,
    unit: 'unité',
  },
  {
    id: 'prod-2',
    name: 'Service Maintenance',
    reference: 'SRV-001',
    sku: 'SRV-001',
    type: 'SERVICE' as const,
    is_stockable: false,
    is_active: true,
    current_stock: 0,
    quantity: 0,
    unit: 'heure',
  },
];

const mockWarehouses = [
  { id: 'wh-1', name: 'Entrepôt Principal', code: 'WH-001', is_active: true },
  { id: 'wh-2', name: 'Entrepôt Secondaire', code: 'WH-002', is_active: true },
  { id: 'wh-3', name: 'Entrepôt Inactif', code: 'WH-003', is_active: false },
];

describe('StockMovementFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <StockMovementFormModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      expect(screen.getByText('Nouveau Mouvement de Stock')).toBeInTheDocument();
    });

    it('should render all movement type buttons', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      expect(screen.getByText('Entrée Achat')).toBeInTheDocument();
      expect(screen.getByText('Sortie Vente')).toBeInTheDocument();
      expect(screen.getByText('Ajustement +')).toBeInTheDocument();
      expect(screen.getByText('Ajustement -')).toBeInTheDocument();
    });
  });

  describe('Movement Type Selection', () => {
    it('should select ENTREE_ACHAT by default', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const entreeButton = screen.getByText('Entrée Achat').closest('button');
      expect(entreeButton).toHaveClass('border-blue-600');
    });

    it('should change movement type when button is clicked', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const sortieButton = screen.getByText('Sortie Vente').closest('button');
      if (sortieButton) {
        fireEvent.click(sortieButton);
        expect(sortieButton).toHaveClass('border-red-600');
      }
    });

    it('should update icon when movement type changes', () => {
      const { container } = render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const ajustementButton = screen.getByText('Ajustement +').closest('button');
      if (ajustementButton) {
        fireEvent.click(ajustementButton);
      }

      // Check that icon changed in header
      const headerIcon = container.querySelector('.bg-green-100');
      expect(headerIcon).toBeInTheDocument();
    });
  });

  describe('Product Selection', () => {
    it('should render product dropdown', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      expect(screen.getByRole('combobox', { name: /Produit/i })).toBeInTheDocument();
    });

    it('should only show physical and stockable products', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const productSelect = screen.getByRole('combobox', { name: /Produit/i });
      const options = productSelect.querySelectorAll('option');
      
      // Should have "Sélectionner un produit" + 1 physical product (not the service)
      expect(options.length).toBe(2);
    });

    it('should display product info card when product is selected', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const productSelect = screen.getByRole('combobox', { name: /Produit/i });
      fireEvent.change(productSelect, { target: { value: 'prod-1' } });

      expect(screen.getByText(/Stock actuel:/i)).toBeInTheDocument();
      expect(screen.getByText(/Seuil minimal:/i)).toBeInTheDocument();
    });

    it('should show current stock in product info', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const productSelect = screen.getByRole('combobox', { name: /Produit/i });
      fireEvent.change(productSelect, { target: { value: 'prod-1' } });

      expect(screen.getByText((content, element) => {
        return element?.textContent?.includes('10 unité') || false;
      })).toBeInTheDocument();
    });
  });

  describe('Form Inputs', () => {
    it('should handle quantity input', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const quantityInput = screen.getByLabelText(/Quantité/i);
      fireEvent.change(quantityInput, { target: { value: '50' } });
      expect(quantityInput).toHaveValue(50);
    });

    it('should handle warehouse selection', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const warehouseSelect = screen.getByRole('combobox', { name: /Entrepôt/i });
      fireEvent.change(warehouseSelect, { target: { value: 'wh-1' } });
      expect(warehouseSelect).toHaveValue('wh-1');
    });

    it('should only show active warehouses', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const warehouseSelect = screen.getByRole('combobox', { name: /Entrepôt/i });
      const options = warehouseSelect.querySelectorAll('option');
      
      // Should have "Aucun entrepôt" + 2 active warehouses (not the inactive one)
      expect(options.length).toBe(3);
    });

    it('should handle note textarea', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const noteTextarea = screen.getByPlaceholderText(/Raison du mouvement/i);
      fireEvent.change(noteTextarea, { target: { value: 'Test note' } });
      expect(noteTextarea).toHaveValue('Test note');
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data on valid submission', async () => {
      const mockValidate = vi.fn(() => true);
      const { useFormValidation } = await import('../../hooks/useFormValidation');
      vi.mocked(useFormValidation).mockReturnValue({
        errors: {},
        validationErrors: [],
        validate: mockValidate,
        validateField: vi.fn(),
        clearErrors: vi.fn(),
      });

      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const productSelect = screen.getByRole('combobox', { name: /Produit/i });
      fireEvent.change(productSelect, { target: { value: 'prod-1' } });

      const quantityInput = screen.getByLabelText(/Quantité/i);
      fireEvent.change(quantityInput, { target: { value: '10' } });

      const submitButton = screen.getByText('Créer le mouvement');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockValidate).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should not submit if validation fails', async () => {
      const mockValidate = vi.fn(() => false);
      const { useFormValidation } = await import('../../hooks/useFormValidation');
      vi.mocked(useFormValidation).mockReturnValue({
        errors: { product_id: 'Le produit est requis' },
        validationErrors: [{ field: 'product_id', message: 'Le produit est requis' }],
        validate: mockValidate,
        validateField: vi.fn(),
        clearErrors: vi.fn(),
      });

      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const submitButton = screen.getByText('Créer le mouvement');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockValidate).toHaveBeenCalled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      const mockValidate = vi.fn(() => true);
      const { useFormValidation } = await import('../../hooks/useFormValidation');
      vi.mocked(useFormValidation).mockReturnValue({
        errors: {},
        validationErrors: [],
        validate: mockValidate,
        validateField: vi.fn(),
        clearErrors: vi.fn(),
      });

      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const submitButton = screen.getByText('Créer le mouvement');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Création...')).toBeInTheDocument();
      });
    });

    it('should handle submission errors', async () => {
      const mockValidate = vi.fn(() => true);
      const { useFormValidation } = await import('../../hooks/useFormValidation');
      vi.mocked(useFormValidation).mockReturnValue({
        errors: {},
        validationErrors: [],
        validate: mockValidate,
        validateField: vi.fn(),
        clearErrors: vi.fn(),
      });

      const error = new Error('Erreur de création');
      mockOnSubmit.mockRejectedValue(error);

      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const submitButton = screen.getByText('Créer le mouvement');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const closeButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const backdrop = container.querySelector('.bg-black.bg-opacity-50');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Form Reset', () => {
    it('should reset form when modal is closed and reopened', () => {
      const { rerender } = render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const productSelect = screen.getByRole('combobox', { name: /Produit/i });
      fireEvent.change(productSelect, { target: { value: 'prod-1' } });

      // Close modal
      rerender(
        <StockMovementFormModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      // Reopen modal
      rerender(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      const resetProductSelect = screen.getByRole('combobox', { name: /Produit/i });
      expect(resetProductSelect).toHaveValue('');
    });
  });

  describe('Validation Display', () => {
    it('should display validation errors', () => {
      const { useFormValidation } = require('../../hooks/useFormValidation');
      vi.mocked(useFormValidation).mockReturnValue({
        errors: { quantity: 'La quantité est requise' },
        validationErrors: [{ field: 'quantity', message: 'La quantité est requise' }],
        validate: vi.fn(() => false),
        validateField: vi.fn(),
        clearErrors: vi.fn(),
      });

      render(
        <StockMovementFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          products={mockProducts}
          warehouses={mockWarehouses}
        />
      );

      expect(screen.getByText('La quantité est requise')).toBeInTheDocument();
    });
  });
});
