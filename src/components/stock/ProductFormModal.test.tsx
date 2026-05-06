import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductFormModal } from './ProductFormModal';

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

const mockCategories = [
  { id: 'cat-1', name: 'Électronique', category_type: 'PRODUCT' },
  { id: 'cat-2', name: 'Mobilier', category_type: 'PRODUCT' },
];

const mockWarehouses = [
  { id: 'wh-1', name: 'Entrepôt Principal', code: 'WH-001', is_active: true },
  { id: 'wh-2', name: 'Entrepôt Secondaire', code: 'WH-002', is_active: true },
];

const mockProduct = {
  id: 'prod-1',
  name: 'Ordinateur Dell',
  reference: 'DELL-001',
  sku: 'DELL-001',
  description: 'Ordinateur portable',
  sale_price_ht: 1500,
  price: 1500,
  purchase_price_ht: 1200,
  cost: 1200,
  current_stock: 10,
  quantity: 10,
  min_stock_threshold: 5,
  minQuantity: 5,
  category_id: 'cat-1',
  warehouse_id: 'wh-1',
  unit: 'unité',
  barcode: '123456789',
  is_stockable: true,
  track_inventory: true,
  type: 'PHYSICAL' as const,
  is_active: true,
  isActive: true,
};

describe('ProductFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ProductFormModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render create mode correctly', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      expect(screen.getByText('Nouveau Produit')).toBeInTheDocument();
      expect(screen.getByText('Créer le produit')).toBeInTheDocument();
    });

    it('should render edit mode correctly', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          product={mockProduct}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="edit"
        />
      );

      expect(screen.getByText('Modifier le Produit')).toBeInTheDocument();
      expect(screen.getByText('Mettre à jour')).toBeInTheDocument();
    });

    it('should populate form fields in edit mode', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          product={mockProduct}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="edit"
        />
      );

      expect(screen.getByDisplayValue('Ordinateur Dell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('DELL-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should handle name input change', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText(/Ordinateur portable Dell/i);
      fireEvent.change(nameInput, { target: { value: 'Nouveau Produit' } });
      expect(nameInput).toHaveValue('Nouveau Produit');
    });

    it('should convert reference to uppercase', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const refInput = screen.getByPlaceholderText(/DELL-XPS15-2024/i);
      fireEvent.change(refInput, { target: { value: 'prod-001' } });
      expect(refInput).toHaveValue('PROD-001');
    });

    it('should handle product type selection', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const typeSelect = screen.getByRole('combobox', { name: /Type de produit/i });
      fireEvent.change(typeSelect, { target: { value: 'SERVICE' } });
      expect(typeSelect).toHaveValue('SERVICE');
    });

    it('should handle price inputs', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const salePriceInput = screen.getByLabelText(/Prix de vente HT/i);
      fireEvent.change(salePriceInput, { target: { value: '2000' } });
      expect(salePriceInput).toHaveValue(2000);
    });

    it('should handle category selection', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const categorySelect = screen.getByRole('combobox', { name: /Catégorie/i });
      fireEvent.change(categorySelect, { target: { value: 'cat-1' } });
      expect(categorySelect).toHaveValue('cat-1');
    });

    it('should handle warehouse selection', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const warehouseSelect = screen.getByRole('combobox', { name: /Entrepôt/i });
      fireEvent.change(warehouseSelect, { target: { value: 'wh-1' } });
      expect(warehouseSelect).toHaveValue('wh-1');
    });

    it('should handle checkbox toggles', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const stockableCheckbox = screen.getByRole('checkbox', { name: /Gérer le stock/i });
      const activeCheckbox = screen.getByRole('checkbox', { name: /Actif/i });

      expect(stockableCheckbox).toBeChecked();
      expect(activeCheckbox).toBeChecked();

      fireEvent.click(stockableCheckbox);
      expect(stockableCheckbox).not.toBeChecked();
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
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText(/Ordinateur portable Dell/i);
      fireEvent.change(nameInput, { target: { value: 'Test Product' } });

      const submitButton = screen.getByText('Créer le produit');
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
        errors: { name: 'Le nom est requis' },
        validationErrors: [{ field: 'name', message: 'Le nom est requis' }],
        validate: mockValidate,
        validateField: vi.fn(),
        clearErrors: vi.fn(),
      });

      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const submitButton = screen.getByText('Créer le produit');
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
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const submitButton = screen.getByText('Créer le produit');
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
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const submitButton = screen.getByText('Créer le produit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
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
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const backdrop = container.querySelector('.bg-black.bg-opacity-50');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Validation Display', () => {
    it('should display validation errors', () => {
      const { useFormValidation } = require('../../hooks/useFormValidation');
      vi.mocked(useFormValidation).mockReturnValue({
        errors: { name: 'Le nom est requis' },
        validationErrors: [{ field: 'name', message: 'Le nom est requis' }],
        validate: vi.fn(() => false),
        validateField: vi.fn(),
        clearErrors: vi.fn(),
      });

      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
    });
  });

  describe('Categories and Warehouses Filtering', () => {
    it('should only show PRODUCT type categories', () => {
      const categoriesWithMixed = [
        ...mockCategories,
        { id: 'cat-3', name: 'Service Category', category_type: 'SERVICE' },
      ];

      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={categoriesWithMixed}
          warehouses={mockWarehouses}
          mode="create"
        />
      );

      const categorySelect = screen.getByRole('combobox', { name: /Catégorie/i });
      const options = categorySelect.querySelectorAll('option');
      
      // Should have "Aucune catégorie" + 2 PRODUCT categories (not the SERVICE one)
      expect(options.length).toBe(3);
    });

    it('should only show active warehouses', () => {
      const warehousesWithInactive = [
        ...mockWarehouses,
        { id: 'wh-3', name: 'Entrepôt Inactif', code: 'WH-003', is_active: false },
      ];

      render(
        <ProductFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          warehouses={warehousesWithInactive}
          mode="create"
        />
      );

      const warehouseSelect = screen.getByRole('combobox', { name: /Entrepôt/i });
      const options = warehouseSelect.querySelectorAll('option');
      
      // Should have "Aucun entrepôt" + 2 active warehouses (not the inactive one)
      expect(options.length).toBe(3);
    });
  });
});
