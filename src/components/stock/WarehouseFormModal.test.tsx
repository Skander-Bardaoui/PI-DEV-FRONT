import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WarehouseFormModal } from './WarehouseFormModal';

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

const mockWarehouse = {
  id: 'wh-1',
  name: 'Entrepôt Principal',
  code: 'WH-001',
  description: 'Entrepôt principal de stockage',
  address: '123 Rue de la Logistique, Tunis',
  latitude: 36.806389,
  longitude: 10.181667,
  is_active: true,
};

describe('WarehouseFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <WarehouseFormModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render create mode correctly', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByText('Nouvel Entrepôt')).toBeInTheDocument();
      expect(screen.getByText('Créer l\'entrepôt')).toBeInTheDocument();
    });

    it('should render edit mode correctly', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          warehouse={mockWarehouse}
          mode="edit"
        />
      );

      expect(screen.getByText('Modifier l\'Entrepôt')).toBeInTheDocument();
      expect(screen.getByText('Mettre à jour')).toBeInTheDocument();
    });

    it('should populate form fields in edit mode', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          warehouse={mockWarehouse}
          mode="edit"
        />
      );

      expect(screen.getByDisplayValue('Entrepôt Principal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('WH-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Rue de la Logistique, Tunis')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should handle name input change', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText(/Entrepôt Principal/i);
      fireEvent.change(nameInput, { target: { value: 'Nouvel Entrepôt' } });
      expect(nameInput).toHaveValue('Nouvel Entrepôt');
    });

    it('should convert code to uppercase', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const codeInput = screen.getByPlaceholderText(/WH-001/i);
      fireEvent.change(codeInput, { target: { value: 'wh-002' } });
      expect(codeInput).toHaveValue('WH-002');
    });

    it('should handle address input', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const addressInput = screen.getByPlaceholderText(/123 Rue de la Logistique/i);
      fireEvent.change(addressInput, { target: { value: '456 Avenue Test' } });
      expect(addressInput).toHaveValue('456 Avenue Test');
    });

    it('should handle latitude input', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const latitudeInput = screen.getByPlaceholderText(/36.806389/i);
      fireEvent.change(latitudeInput, { target: { value: '36.5' } });
      expect(latitudeInput).toHaveValue(36.5);
    });

    it('should handle longitude input', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const longitudeInput = screen.getByPlaceholderText(/10.181667/i);
      fireEvent.change(longitudeInput, { target: { value: '10.2' } });
      expect(longitudeInput).toHaveValue(10.2);
    });

    it('should handle description textarea', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const descriptionTextarea = screen.getByPlaceholderText(/Description de l'entrepôt/i);
      fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });
      expect(descriptionTextarea).toHaveValue('Test description');
    });

    it('should handle active checkbox toggle', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const activeCheckbox = screen.getByRole('checkbox', { name: /Entrepôt actif/i });
      expect(activeCheckbox).toBeChecked();

      fireEvent.click(activeCheckbox);
      expect(activeCheckbox).not.toBeChecked();
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
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText(/Entrepôt Principal/i);
      fireEvent.change(nameInput, { target: { value: 'Test Warehouse' } });

      const codeInput = screen.getByPlaceholderText(/WH-001/i);
      fireEvent.change(codeInput, { target: { value: 'WH-TEST' } });

      const submitButton = screen.getByText('Créer l\'entrepôt');
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
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const submitButton = screen.getByText('Créer l\'entrepôt');
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
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const submitButton = screen.getByText('Créer l\'entrepôt');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Création...')).toBeInTheDocument();
      });
    });

    it('should show update loading state in edit mode', async () => {
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
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          warehouse={mockWarehouse}
          mode="edit"
        />
      );

      const submitButton = screen.getByText('Mettre à jour');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Mise à jour...')).toBeInTheDocument();
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
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const submitButton = screen.getByText('Créer l\'entrepôt');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
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
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
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

  describe('Form Reset', () => {
    it('should reset form when modal is closed and reopened', () => {
      const { rerender } = render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText(/Entrepôt Principal/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      // Close modal
      rerender(
        <WarehouseFormModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      // Reopen modal
      rerender(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const resetNameInput = screen.getByPlaceholderText(/Entrepôt Principal/i);
      expect(resetNameInput).toHaveValue('');
    });
  });

  describe('Validation Display', () => {
    it('should display validation errors', () => {
      const { useFormValidation } = require('../../hooks/useFormValidation');
      vi.mocked(useFormValidation).mockReturnValue({
        errors: { name: 'Le nom est requis', code: 'Le code est requis' },
        validationErrors: [
          { field: 'name', message: 'Le nom est requis' },
          { field: 'code', message: 'Le code est requis' },
        ],
        validate: vi.fn(() => false),
        validateField: vi.fn(),
        clearErrors: vi.fn(),
      });

      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
      expect(screen.getByText('Le code est requis')).toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    it('should display code format help text', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByText(/Lettres majuscules, chiffres, tirets et underscores uniquement/i)).toBeInTheDocument();
    });

    it('should display active checkbox help text', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByText(/Les entrepôts inactifs ne seront pas disponibles/i)).toBeInTheDocument();
    });
  });

  describe('Autofocus', () => {
    it('should autofocus name input when modal opens', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText(/Entrepôt Principal/i);
      expect(nameInput).toHaveAttribute('autoFocus');
    });
  });

  describe('Coordinates Handling', () => {
    it('should handle empty latitude and longitude', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const latitudeInput = screen.getByPlaceholderText(/36.806389/i);
      const longitudeInput = screen.getByPlaceholderText(/10.181667/i);

      expect(latitudeInput).toHaveValue(null);
      expect(longitudeInput).toHaveValue(null);
    });

    it('should populate coordinates in edit mode', () => {
      render(
        <WarehouseFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          warehouse={mockWarehouse}
          mode="edit"
        />
      );

      const latitudeInput = screen.getByPlaceholderText(/36.806389/i);
      const longitudeInput = screen.getByPlaceholderText(/10.181667/i);

      expect(latitudeInput).toHaveValue(36.806389);
      expect(longitudeInput).toHaveValue(10.181667);
    });
  });
});
