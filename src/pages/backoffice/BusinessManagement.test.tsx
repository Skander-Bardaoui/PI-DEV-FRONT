import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BusinessManagement from './BusinessManagement';
import { useAuth } from '../../hooks/useAuth';
import {
  getMyBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from '../../api/business.api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../api/business.api');
vi.mock('sonner');

const mockUser = {
  id: 'user-1',
  email: 'owner@test.com',
  role: 'BUSINESS_OWNER',
};

const mockBusinesses = [
  {
    id: 'business-1',
    name: 'Business 1',
    logo: 'logo1.png',
    tax_id: '1234567/A/M/000',
    email: 'business1@test.com',
    phone: '+216 12 345 678',
    currency: 'TND',
    tax_rate: 19,
    address: {
      street: '123 Main St',
      city: 'Tunis',
      state: 'Tunis',
      postal_code: '1000',
      country: 'Tunisie',
    },
  },
  {
    id: 'business-2',
    name: 'Business 2',
    tax_id: '7654321/B/M/000',
    email: 'business2@test.com',
    phone: '+216 98 765 432',
    currency: 'EUR',
    tax_rate: 20,
    address: {
      city: 'Sfax',
      country: 'Tunisie',
    },
  },
];

describe('BusinessManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (getMyBusinesses as any).mockResolvedValue(mockBusinesses);
  });

  describe('Rendering', () => {
    it('should render business management page', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Mes Entreprises')).toBeInTheDocument();
        expect(screen.getByText('Gérez vos entreprises')).toBeInTheDocument();
      });
    });

    it('should render new business button', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Nouvelle entreprise')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<BusinessManagement />);
      
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Business List', () => {
    it('should load and display businesses', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(getMyBusinesses).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
        expect(screen.getByText('Business 2')).toBeInTheDocument();
      });
    });

    it('should display business details', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('1234567/A/M/000')).toBeInTheDocument();
        expect(screen.getByText('business1@test.com')).toBeInTheDocument();
        expect(screen.getByText('+216 12 345 678')).toBeInTheDocument();
        expect(screen.getByText('TND')).toBeInTheDocument();
        expect(screen.getByText('19%')).toBeInTheDocument();
      });
    });

    it('should display business address', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
        expect(screen.getByText(/1000 Tunis/)).toBeInTheDocument();
      });
    });

    it('should show empty state when no businesses', async () => {
      (getMyBusinesses as any).mockResolvedValue([]);

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucune entreprise')).toBeInTheDocument();
        expect(screen.getByText(/Commencez par créer votre première entreprise/i)).toBeInTheDocument();
      });
    });

    it('should display business logo or initial', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        const logoCircles = screen.getAllByText('B');
        expect(logoCircles.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Create Business Modal', () => {
    it('should open create modal when clicking new business button', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      const newButton = screen.getByText('Nouvelle entreprise');
      fireEvent.click(newButton);

      await waitFor(() => {
        expect(screen.getByText('Nouvelle entreprise')).toBeInTheDocument();
        expect(screen.getByLabelText(/Nom de l'entreprise/)).toBeInTheDocument();
      });
    });

    it('should close modal when clicking cancel', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Nouvelle entreprise'));

      await waitFor(() => {
        expect(screen.getByText('Annuler')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Annuler'));

      await waitFor(() => {
        expect(screen.queryByLabelText(/Nom de l'entreprise/)).not.toBeInTheDocument();
      });
    });

    it('should close modal when clicking X button', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Nouvelle entreprise'));

      const closeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByLabelText(/Nom de l'entreprise/)).not.toBeInTheDocument();
      });
    });

    it('should create business successfully', async () => {
      (createBusiness as any).mockResolvedValue({ id: 'new-business' });

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Nouvelle entreprise'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Nom de l'entreprise/);
      fireEvent.change(nameInput, { target: { value: 'New Business' } });

      const createButton = screen.getByText('Créer');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(createBusiness).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Business',
            currency: 'TND',
            tax_rate: 19,
          })
        );
        expect(toast.success).toHaveBeenCalledWith('"New Business" créée avec succès');
      });
    });

    it('should show error when name is empty', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Nouvelle entreprise'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/)).toBeInTheDocument();
      });

      const createButton = screen.getByText('Créer');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Le nom de l'entreprise est requis");
      });
    });

    it('should handle create error', async () => {
      (createBusiness as any).mockRejectedValue({
        response: { data: { message: 'Creation failed' } },
      });

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Nouvelle entreprise'));

      const nameInput = screen.getByLabelText(/Nom de l'entreprise/);
      fireEvent.change(nameInput, { target: { value: 'New Business' } });

      const createButton = screen.getByText('Créer');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Creation failed');
      });
    });
  });

  describe('Edit Business Modal', () => {
    it('should open edit modal when clicking edit button', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('Modifier');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Modifier l'entreprise")).toBeInTheDocument();
        const nameInput = screen.getByLabelText(/Nom de l'entreprise/) as HTMLInputElement;
        expect(nameInput.value).toBe('Business 1');
      });
    });

    it('should populate form with business data', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('Modifier');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Nom de l'entreprise/) as HTMLInputElement;
        const taxIdInput = screen.getByLabelText(/Matricule Fiscal/) as HTMLInputElement;
        const emailInput = screen.getByLabelText(/Email/) as HTMLInputElement;
        
        expect(nameInput.value).toBe('Business 1');
        expect(taxIdInput.value).toBe('1234567/A/M/000');
        expect(emailInput.value).toBe('business1@test.com');
      });
    });

    it('should update business successfully', async () => {
      (updateBusiness as any).mockResolvedValue({ id: 'business-1' });

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('Modifier');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Nom de l'entreprise/);
      fireEvent.change(nameInput, { target: { value: 'Updated Business' } });

      const updateButton = screen.getByText('Mettre à jour');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(updateBusiness).toHaveBeenCalledWith(
          'business-1',
          expect.objectContaining({
            name: 'Updated Business',
          })
        );
        expect(toast.success).toHaveBeenCalledWith('"Updated Business" mise à jour avec succès');
      });
    });

    it('should handle update error', async () => {
      (updateBusiness as any).mockRejectedValue({
        response: { data: { message: 'Update failed' } },
      });

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('Modifier');
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByLabelText(/Nom de l'entreprise/);
      fireEvent.change(nameInput, { target: { value: 'Updated Business' } });

      const updateButton = screen.getByText('Mettre à jour');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Update failed');
      });
    });
  });

  describe('Delete Business', () => {
    it('should show delete button for BUSINESS_OWNER', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getAllByTitle('Supprimer').length).toBeGreaterThan(0);
      });
    });

    it('should hide delete button for non-owners', async () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, role: 'BUSINESS_ADMIN' },
      });

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.queryByTitle('Supprimer')).not.toBeInTheDocument();
      });
    });

    it('should delete business successfully', async () => {
      (deleteBusiness as any).mockResolvedValue({});

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Supprimer');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(deleteBusiness).toHaveBeenCalledWith('business-1');
        expect(toast.success).toHaveBeenCalledWith('"Business 1" supprimée avec succès');
      });
    });

    it('should handle delete error', async () => {
      (deleteBusiness as any).mockRejectedValue({
        response: { data: { message: 'Delete failed' } },
      });

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Supprimer');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Delete failed');
      });
    });
  });

  describe('Form Fields', () => {
    it('should handle all form field changes', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Nouvelle entreprise'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Nom de l'entreprise/);
      const taxIdInput = screen.getByLabelText(/Matricule Fiscal/);
      const emailInput = screen.getByLabelText(/Email/);
      const phoneInput = screen.getByLabelText(/Téléphone/);
      const currencySelect = screen.getByLabelText(/Devise/);
      const taxRateInput = screen.getByLabelText(/Taux de TVA/);

      fireEvent.change(nameInput, { target: { value: 'Test Business' } });
      fireEvent.change(taxIdInput, { target: { value: '1234567/A/M/000' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(phoneInput, { target: { value: '+216 12 345 678' } });
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });
      fireEvent.change(taxRateInput, { target: { value: '20' } });

      expect((nameInput as HTMLInputElement).value).toBe('Test Business');
      expect((taxIdInput as HTMLInputElement).value).toBe('1234567/A/M/000');
      expect((emailInput as HTMLInputElement).value).toBe('test@test.com');
      expect((phoneInput as HTMLInputElement).value).toBe('+216 12 345 678');
      expect((currencySelect as HTMLSelectElement).value).toBe('EUR');
      expect((taxRateInput as HTMLInputElement).value).toBe('20');
    });

    it('should handle address fields', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Nouvelle entreprise'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Rue/)).toBeInTheDocument();
      });

      const streetInput = screen.getByLabelText(/Rue/);
      const cityInput = screen.getByLabelText(/Ville/);
      const stateInput = screen.getByLabelText(/Gouvernorat/);
      const postalCodeInput = screen.getByLabelText(/Code postal/);
      const countryInput = screen.getByLabelText(/Pays/);

      fireEvent.change(streetInput, { target: { value: '123 Main St' } });
      fireEvent.change(cityInput, { target: { value: 'Tunis' } });
      fireEvent.change(stateInput, { target: { value: 'Tunis' } });
      fireEvent.change(postalCodeInput, { target: { value: '1000' } });
      fireEvent.change(countryInput, { target: { value: 'Tunisie' } });

      expect((streetInput as HTMLInputElement).value).toBe('123 Main St');
      expect((cityInput as HTMLInputElement).value).toBe('Tunis');
      expect((stateInput as HTMLInputElement).value).toBe('Tunis');
      expect((postalCodeInput as HTMLInputElement).value).toBe('1000');
      expect((countryInput as HTMLInputElement).value).toBe('Tunisie');
    });
  });

  describe('Pagination', () => {
    it('should show pagination when more than 5 businesses', async () => {
      const manyBusinesses = Array.from({ length: 10 }, (_, i) => ({
        ...mockBusinesses[0],
        id: `business-${i}`,
        name: `Business ${i}`,
      }));
      (getMyBusinesses as any).mockResolvedValue(manyBusinesses);

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Page 1 sur 2')).toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      const manyBusinesses = Array.from({ length: 10 }, (_, i) => ({
        ...mockBusinesses[0],
        id: `business-${i}`,
        name: `Business ${i}`,
      }));
      (getMyBusinesses as any).mockResolvedValue(manyBusinesses);

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 0')).toBeInTheDocument();
      });

      const nextButton = screen.getAllByRole('button').find(
        (btn) => btn.querySelector('svg')
      );
      if (nextButton) {
        fireEvent.click(nextButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Page 2 sur 2')).toBeInTheDocument();
      });
    });

    it('should hide pagination when 5 or fewer businesses', async () => {
      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading businesses', async () => {
      (getMyBusinesses as any).mockRejectedValue(new Error('Network error'));

      render(<BusinessManagement />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors du chargement des entreprises');
      });
    });
  });
});
