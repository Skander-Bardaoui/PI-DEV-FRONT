import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierModal from './SupplierModal';
import { useCreateSupplier, useUpdateSupplier } from '../../hooks/useSuppliers';
import { useTranslation } from 'react-i18next';

vi.mock('../../hooks/useSuppliers', () => ({
  useCreateSupplier: vi.fn(),
  useUpdateSupplier: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('SupplierModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockT = (key: string, options?: any) => options?.defaultValue || key;

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useTranslation as any).mockReturnValue({
      t: mockT,
    });

    (useCreateSupplier as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    (useUpdateSupplier as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('should render create mode correctly', () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('suppliers.new')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Société Exemple SARL')).toBeInTheDocument();
  });

  it('should render edit mode with supplier data', () => {
    const mockSupplier = {
      id: 'supplier-1',
      name: 'Test Supplier',
      matricule_fiscal: '1234567/A/B/C/000',
      email: 'test@supplier.tn',
      phone: '+216 71 000 000',
      rib: '07 123 0123456789 12',
      bank_name: 'STB',
      payment_terms: 30,
      category: 'IT',
      notes: 'Test notes',
      address: {
        street: '123 Test St',
        city: 'Tunis',
        postal_code: '1000',
        country: 'Tunisie',
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      business_id: 'business-1',
      is_active: true,
    };

    render(
      <SupplierModal
        businessId="business-1"
        supplier={mockSupplier}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByDisplayValue('Test Supplier')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567/A/B/C/000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@supplier.tn')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when cancel button is clicked', () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle form input changes', () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const nameInput = screen.getByPlaceholderText('Société Exemple SARL');
    fireEvent.change(nameInput, { target: { value: 'New Supplier' } });

    expect(nameInput).toHaveValue('New Supplier');
  });

  it('should submit form with valid data in create mode', async () => {
    mockMutateAsync.mockResolvedValue({});

    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('Société Exemple SARL'), {
      target: { value: 'New Supplier' },
    });
    fireEvent.change(screen.getByPlaceholderText('1234567/A/B/C/000'), {
      target: { value: '1234567/A/B/C/000' },
    });
    fireEvent.change(screen.getByPlaceholderText('contact@fournisseur.tn'), {
      target: { value: 'test@supplier.tn' },
    });
    fireEvent.change(screen.getByPlaceholderText('+216 71 000 000'), {
      target: { value: '+216 71 000 000' },
    });
    fireEvent.change(screen.getByPlaceholderText('07 123 0123456789 12'), {
      target: { value: '07 123 0123456789 12' },
    });
    fireEvent.change(screen.getByPlaceholderText('STB, BNA, BIAT...'), {
      target: { value: 'STB' },
    });

    const categoryInput = screen.getByPlaceholderText(/Matières premières/);
    fireEvent.change(categoryInput, { target: { value: 'IT' } });

    // Fill address fields
    const streetInput = screen.getByPlaceholderText(/Rue/);
    fireEvent.change(streetInput, { target: { value: '123 Test St' } });

    const cityInput = screen.getByPlaceholderText(/Ville/);
    fireEvent.change(cityInput, { target: { value: 'Tunis' } });

    const postalInput = screen.getByPlaceholderText(/Code postal/);
    fireEvent.change(postalInput, { target: { value: '1000' } });

    const countryInput = screen.getByPlaceholderText(/Pays/);
    fireEvent.change(countryInput, { target: { value: 'Tunisie' } });

    const submitButton = screen.getByText('common.create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('should display validation errors for empty required fields', async () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('common.create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erreurs de validation')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    (useCreateSupplier as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Enregistrement/)).toBeInTheDocument();
  });

  it('should handle address fields correctly', () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const streetInput = screen.getByPlaceholderText(/Rue/);
    const cityInput = screen.getByPlaceholderText(/Ville/);
    const postalInput = screen.getByPlaceholderText(/Code postal/);
    const countryInput = screen.getByPlaceholderText(/Pays/);

    fireEvent.change(streetInput, { target: { value: '123 Test St' } });
    fireEvent.change(cityInput, { target: { value: 'Tunis' } });
    fireEvent.change(postalInput, { target: { value: '1000' } });
    fireEvent.change(countryInput, { target: { value: 'Tunisie' } });

    expect(streetInput).toHaveValue('123 Test St');
    expect(cityInput).toHaveValue('Tunis');
    expect(postalInput).toHaveValue('1000');
    expect(countryInput).toHaveValue('Tunisie');
  });

  it('should handle payment terms input', () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const paymentTermsInput = screen.getByDisplayValue('30');
    fireEvent.change(paymentTermsInput, { target: { value: '60' } });

    expect(paymentTermsInput).toHaveValue(60);
  });

  it('should handle notes textarea', () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const notesTextarea = screen.getByPlaceholderText(/Informations complémentaires/);
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

    expect(notesTextarea).toHaveValue('Test notes');
  });

  it('should handle form submission error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMutateAsync.mockRejectedValue(new Error('Submission failed'));

    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('Société Exemple SARL'), {
      target: { value: 'New Supplier' },
    });

    const submitButton = screen.getByText('common.create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should display error icon for invalid fields', async () => {
    render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('common.create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorIcons = screen.getAllByRole('img', { hidden: true });
      expect(errorIcons.length).toBeGreaterThan(0);
    });
  });

  it('should update form when supplier prop changes', () => {
    const { rerender } = render(
      <SupplierModal
        businessId="business-1"
        supplier={null}
        onClose={mockOnClose}
      />
    );

    const updatedSupplier = {
      id: 'supplier-2',
      name: 'Updated Supplier',
      matricule_fiscal: '9876543/X/Y/Z/000',
      email: 'updated@supplier.tn',
      phone: '+216 71 999 999',
      rib: '07 999 9999999999 99',
      bank_name: 'BIAT',
      payment_terms: 45,
      category: 'Services',
      notes: 'Updated notes',
      address: {
        street: '456 New St',
        city: 'Sfax',
        postal_code: '3000',
        country: 'Tunisie',
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
      business_id: 'business-1',
      is_active: true,
    };

    rerender(
      <SupplierModal
        businessId="business-1"
        supplier={updatedSupplier}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByDisplayValue('Updated Supplier')).toBeInTheDocument();
  });
});
