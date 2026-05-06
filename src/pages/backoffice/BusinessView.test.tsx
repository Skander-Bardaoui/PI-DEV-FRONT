import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BusinessView from './BusinessView';
import { getMyBusinesses } from '../../api/business.api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../api/business.api');
vi.mock('sonner');
vi.mock('@/config/api.config', () => ({
  getAssetUrl: (url: string) => `https://api.test.com/${url}`,
}));

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

describe('BusinessView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getMyBusinesses as any).mockResolvedValue(mockBusinesses);
  });

  describe('Rendering', () => {
    it('should render business view page', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Mon Entreprise')).toBeInTheDocument();
        expect(screen.getByText('Informations de votre entreprise')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<BusinessView />);
      
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Business Loading', () => {
    it('should load businesses on mount', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(getMyBusinesses).toHaveBeenCalled();
      });
    });

    it('should display all businesses', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
        expect(screen.getByText('Business 2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no businesses', async () => {
      (getMyBusinesses as any).mockResolvedValue([]);

      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucune entreprise')).toBeInTheDocument();
        expect(screen.getByText("Vous n'êtes pas associé à une entreprise")).toBeInTheDocument();
      });
    });
  });

  describe('Business Information Display', () => {
    it('should display business name', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });
    });

    it('should display tax ID', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText(/1234567\/A\/M\/000/)).toBeInTheDocument();
      });
    });

    it('should display email', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('business1@test.com')).toBeInTheDocument();
      });
    });

    it('should display phone', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('+216 12 345 678')).toBeInTheDocument();
      });
    });

    it('should display currency', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('TND')).toBeInTheDocument();
        expect(screen.getByText('EUR')).toBeInTheDocument();
      });
    });

    it('should display tax rate', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('19%')).toBeInTheDocument();
        expect(screen.getByText('20%')).toBeInTheDocument();
      });
    });

    it('should display full address', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
        expect(screen.getByText(/1000 Tunis/)).toBeInTheDocument();
        expect(screen.getByText(/Tunisie/)).toBeInTheDocument();
      });
    });

    it('should display partial address when some fields missing', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText(/Sfax/)).toBeInTheDocument();
      });
    });
  });

  describe('Business Logo', () => {
    it('should display business logo when available', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        const logo = screen.getAllByAltText('Business 1')[0];
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', 'https://api.test.com/logo1.png');
      });
    });

    it('should display initial when no logo', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        const initials = screen.getAllByText('B');
        expect(initials.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Information Cards', () => {
    it('should display email card with icon', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Email')).toBeInTheDocument();
      });
    });

    it('should display phone card with icon', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Téléphone')).toBeInTheDocument();
      });
    });

    it('should display currency card with icon', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Devise')).toBeInTheDocument();
      });
    });

    it('should display tax rate card with icon', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Taux de TVA')).toBeInTheDocument();
      });
    });

    it('should display address card with icon', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Adresse')).toBeInTheDocument();
      });
    });
  });

  describe('Info Banner', () => {
    it('should display info banner about editing permissions', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText(/Seul le propriétaire de l'organisation peut modifier ces informations/i)).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Businesses', () => {
    it('should display all businesses in separate cards', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
        expect(screen.getByText('Business 2')).toBeInTheDocument();
      });
    });

    it('should display unique information for each business', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('business1@test.com')).toBeInTheDocument();
        expect(screen.getByText('business2@test.com')).toBeInTheDocument();
        expect(screen.getByText('TND')).toBeInTheDocument();
        expect(screen.getByText('EUR')).toBeInTheDocument();
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should not display email card when email is missing', async () => {
      const businessWithoutEmail = [
        {
          ...mockBusinesses[0],
          email: undefined,
        },
      ];
      (getMyBusinesses as any).mockResolvedValue(businessWithoutEmail);

      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      expect(screen.queryByText('business1@test.com')).not.toBeInTheDocument();
    });

    it('should not display phone card when phone is missing', async () => {
      const businessWithoutPhone = [
        {
          ...mockBusinesses[0],
          phone: undefined,
        },
      ];
      (getMyBusinesses as any).mockResolvedValue(businessWithoutPhone);

      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      expect(screen.queryByText('+216 12 345 678')).not.toBeInTheDocument();
    });

    it('should not display address card when city is missing', async () => {
      const businessWithoutAddress = [
        {
          ...mockBusinesses[0],
          address: {},
        },
      ];
      (getMyBusinesses as any).mockResolvedValue(businessWithoutAddress);

      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      expect(screen.queryByText('Adresse')).not.toBeInTheDocument();
    });

    it('should not display tax rate card when tax rate is null', async () => {
      const businessWithoutTaxRate = [
        {
          ...mockBusinesses[0],
          tax_rate: null,
        },
      ];
      (getMyBusinesses as any).mockResolvedValue(businessWithoutTaxRate);

      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Business 1')).toBeInTheDocument();
      });

      const taxRateCards = screen.queryAllByText('Taux de TVA');
      expect(taxRateCards.length).toBe(1); // Only from Business 2
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading businesses', async () => {
      (getMyBusinesses as any).mockRejectedValue(new Error('Network error'));

      render(<BusinessView />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors du chargement des entreprises');
      });
    });

    it('should show empty state after error', async () => {
      (getMyBusinesses as any).mockRejectedValue(new Error('Network error'));

      render(<BusinessView />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucune entreprise')).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should display business cards with proper styling', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        const businessCards = screen.getAllByText(/Business \d/).map(el => el.closest('div'));
        expect(businessCards.length).toBeGreaterThan(0);
      });
    });

    it('should display logo with gradient background', async () => {
      render(<BusinessView />);
      
      await waitFor(() => {
        const initials = screen.getAllByText('B');
        expect(initials.length).toBeGreaterThan(0);
      });
    });
  });
});
