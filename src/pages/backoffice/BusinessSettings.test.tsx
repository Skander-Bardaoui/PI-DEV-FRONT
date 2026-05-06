import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BusinessSettings from './BusinessSettings';
import {
  getMyBusinesses,
  updateBusiness,
  getBusinessSettings,
  updateBusinessSettings,
} from '../../api/business.api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../api/business.api');
vi.mock('sonner');

const mockBusinesses = [
  {
    id: 'business-1',
    name: 'Business 1',
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

const mockSettings = {
  invoice_prefix: 'INV-',
  payment_terms: 30,
};

describe('BusinessSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getMyBusinesses as any).mockResolvedValue(mockBusinesses);
    (getBusinessSettings as any).mockResolvedValue(mockSettings);
    (updateBusiness as any).mockResolvedValue({});
    (updateBusinessSettings as any).mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('should render business settings page', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText("Paramètres de l'entreprise")).toBeInTheDocument();
        expect(screen.getByText('Gérez les informations de votre entreprise')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<BusinessSettings />);
      
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('should render all form sections', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Informations générales')).toBeInTheDocument();
        expect(screen.getByText('Adresse')).toBeInTheDocument();
        expect(screen.getByText('Paramètres de facturation')).toBeInTheDocument();
      });
    });
  });

  describe('Business Loading', () => {
    it('should load businesses on mount', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(getMyBusinesses).toHaveBeenCalled();
      });
    });

    it('should load business settings', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(getBusinessSettings).toHaveBeenCalledWith('business-1');
      });
    });

    it('should populate form with business data', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Nom de l'entreprise/) as HTMLInputElement;
        expect(nameInput.value).toBe('Business 1');
      });
    });

    it('should show empty state when no businesses', async () => {
      (getMyBusinesses as any).mockResolvedValue([]);

      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucune entreprise trouvée')).toBeInTheDocument();
        expect(screen.getByText(/Vous devez d'abord créer une entreprise/i)).toBeInTheDocument();
      });
    });
  });

  describe('Business Selector', () => {
    it('should show business selector when multiple businesses', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Sélectionner une entreprise')).toBeInTheDocument();
      });
    });

    it('should hide business selector when single business', async () => {
      (getMyBusinesses as any).mockResolvedValue([mockBusinesses[0]]);

      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.queryByText('Sélectionner une entreprise')).not.toBeInTheDocument();
      });
    });

    it('should switch business when selecting different one', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Sélectionner une entreprise')).toBeInTheDocument();
      });

      const selector = screen.getByLabelText(/Sélectionner une entreprise/);
      fireEvent.change(selector, { target: { value: 'business-2' } });

      await waitFor(() => {
        expect(getBusinessSettings).toHaveBeenCalledWith('business-2');
      });
    });
  });

  describe('Form Fields', () => {
    it('should handle business name change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Nom de l'entreprise/);
      fireEvent.change(nameInput, { target: { value: 'Updated Business' } });

      expect((nameInput as HTMLInputElement).value).toBe('Updated Business');
    });

    it('should handle tax ID change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Matricule Fiscal/)).toBeInTheDocument();
      });

      const taxIdInput = screen.getByLabelText(/Matricule Fiscal/);
      fireEvent.change(taxIdInput, { target: { value: '9999999/Z/M/000' } });

      expect((taxIdInput as HTMLInputElement).value).toBe('9999999/Z/M/000');
    });

    it('should handle currency change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Devise/)).toBeInTheDocument();
      });

      const currencySelect = screen.getByLabelText(/Devise/);
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });

      expect((currencySelect as HTMLSelectElement).value).toBe('EUR');
    });

    it('should handle email change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email/);
      fireEvent.change(emailInput, { target: { value: 'new@test.com' } });

      expect((emailInput as HTMLInputElement).value).toBe('new@test.com');
    });

    it('should handle phone change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Téléphone/)).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/Téléphone/);
      fireEvent.change(phoneInput, { target: { value: '+216 99 999 999' } });

      expect((phoneInput as HTMLInputElement).value).toBe('+216 99 999 999');
    });

    it('should handle tax rate change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Taux de TVA/)).toBeInTheDocument();
      });

      const taxRateInput = screen.getByLabelText(/Taux de TVA/);
      fireEvent.change(taxRateInput, { target: { value: '20' } });

      expect((taxRateInput as HTMLInputElement).value).toBe('20');
    });
  });

  describe('Address Fields', () => {
    it('should handle street change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Rue/)).toBeInTheDocument();
      });

      const streetInput = screen.getByLabelText(/Rue/);
      fireEvent.change(streetInput, { target: { value: '456 New St' } });

      expect((streetInput as HTMLInputElement).value).toBe('456 New St');
    });

    it('should handle city change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Ville/)).toBeInTheDocument();
      });

      const cityInput = screen.getByLabelText(/Ville/);
      fireEvent.change(cityInput, { target: { value: 'Sousse' } });

      expect((cityInput as HTMLInputElement).value).toBe('Sousse');
    });

    it('should handle state change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Gouvernorat/)).toBeInTheDocument();
      });

      const stateInput = screen.getByLabelText(/Gouvernorat/);
      fireEvent.change(stateInput, { target: { value: 'Sousse' } });

      expect((stateInput as HTMLInputElement).value).toBe('Sousse');
    });

    it('should handle postal code change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Code postal/)).toBeInTheDocument();
      });

      const postalCodeInput = screen.getByLabelText(/Code postal/);
      fireEvent.change(postalCodeInput, { target: { value: '2000' } });

      expect((postalCodeInput as HTMLInputElement).value).toBe('2000');
    });

    it('should handle country change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Pays/)).toBeInTheDocument();
      });

      const countryInput = screen.getByLabelText(/Pays/);
      fireEvent.change(countryInput, { target: { value: 'France' } });

      expect((countryInput as HTMLInputElement).value).toBe('France');
    });
  });

  describe('Invoice Settings', () => {
    it('should handle invoice prefix change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Préfixe des factures/)).toBeInTheDocument();
      });

      const prefixInput = screen.getByLabelText(/Préfixe des factures/);
      fireEvent.change(prefixInput, { target: { value: 'FACT-' } });

      expect((prefixInput as HTMLInputElement).value).toBe('FACT-');
    });

    it('should handle payment terms change', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Délai de paiement/)).toBeInTheDocument();
      });

      const termsInput = screen.getByLabelText(/Délai de paiement/);
      fireEvent.change(termsInput, { target: { value: '60' } });

      expect((termsInput as HTMLInputElement).value).toBe('60');
    });
  });

  describe('Save Functionality', () => {
    it('should save business settings successfully', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Nom de l'entreprise/);
      fireEvent.change(nameInput, { target: { value: 'Updated Business' } });

      const saveButton = screen.getByText('Enregistrer les modifications');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(updateBusiness).toHaveBeenCalledWith(
          'business-1',
          expect.objectContaining({
            name: 'Updated Business',
          })
        );
        expect(updateBusinessSettings).toHaveBeenCalledWith(
          'business-1',
          expect.objectContaining({
            invoice_prefix: 'INV-',
            payment_terms: 30,
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Paramètres enregistrés avec succès');
      });
    });

    it('should show error when name is empty', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Nom de l'entreprise/);
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByText('Enregistrer les modifications');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Le nom de l'entreprise est requis");
      });
    });

    it('should validate tax ID format', async () => {
      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Matricule Fiscal/)).toBeInTheDocument();
      });

      const taxIdInput = screen.getByLabelText(/Matricule Fiscal/);
      fireEvent.change(taxIdInput, { target: { value: 'invalid-format' } });

      const saveButton = screen.getByText('Enregistrer les modifications');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Format du matricule fiscal invalide (ex: 1234567/A/M/000)');
      });
    });

    it('should handle save error', async () => {
      (updateBusiness as any).mockRejectedValue({
        response: { data: { message: 'Save failed' } },
      });

      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Enregistrer les modifications');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Save failed');
      });
    });

    it('should show loading state while saving', async () => {
      (updateBusiness as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Enregistrer les modifications');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading businesses', async () => {
      (getMyBusinesses as any).mockRejectedValue(new Error('Network error'));

      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors du chargement des entreprises');
      });
    });

    it('should handle missing settings gracefully', async () => {
      (getBusinessSettings as any).mockRejectedValue(new Error('Not found'));

      render(<BusinessSettings />);
      
      await waitFor(() => {
        const prefixInput = screen.getByLabelText(/Préfixe des factures/) as HTMLInputElement;
        expect(prefixInput.value).toBe('INV-');
      });
    });
  });

  describe('No Business Selected', () => {
    it('should show error when saving without business', async () => {
      (getMyBusinesses as any).mockResolvedValue([]);

      render(<BusinessSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucune entreprise trouvée')).toBeInTheDocument();
      });
    });
  });
});
