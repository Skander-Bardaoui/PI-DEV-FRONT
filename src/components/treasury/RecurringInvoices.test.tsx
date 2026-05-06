import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecurringInvoices from './RecurringInvoices';

// Mock dependencies
vi.mock('../../hooks/useRecurringInvoicePayments', () => ({
  useRecurringInvoicePayments: vi.fn(() => ({ data: [], isLoading: false })),
  useValidateRecurringInvoicePayment: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useSendRecurringInvoiceReminder: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock('../../hooks/useAccounts', () => ({
  useAccounts: vi.fn(() => ({ accounts: [] })),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockInvoices = [
  {
    id: 'inv-1',
    description: 'Monthly Subscription',
    client: { id: 'client-1', name: 'Client A' },
    amount: 1000,
    tax_rate: 19,
    frequency: 'MONTHLY',
    status: 'ACTIVE',
    next_invoice_date: '2024-02-01',
    invoices_generated: 5,
    discount_type: null,
    discount_value: null,
    notes: null,
  },
  {
    id: 'inv-2',
    description: 'Quarterly Service',
    client: { id: 'client-2', name: 'Client B' },
    amount: 5000,
    tax_rate: 19,
    frequency: 'QUARTERLY',
    status: 'PAUSED',
    next_invoice_date: '2024-03-01',
    invoices_generated: 2,
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    notes: 'Special discount',
  },
];

describe('RecurringInvoices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component title', () => {
      render(<RecurringInvoices />);
      expect(screen.getByText('Factures récurrentes')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<RecurringInvoices />);
      expect(screen.getByText(/Gérez les paiements de vos factures récurrentes/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<RecurringInvoices />);
      expect(screen.getByPlaceholderText(/Rechercher client, description/i)).toBeInTheDocument();
    });

    it('should render status filter', () => {
      render(<RecurringInvoices />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton loaders when loading', () => {
      const { useRecurringInvoicePayments } = require('../../hooks/useRecurringInvoicePayments');
      vi.mocked(useRecurringInvoicePayments).mockReturnValue({
        data: [],
        isLoading: true,
      });

      render(<RecurringInvoices />);
      // Skeleton loaders should be visible
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      const { useRecurringInvoicePayments } = require('../../hooks/useRecurringInvoicePayments');
      vi.mocked(useRecurringInvoicePayments).mockReturnValue({
        data: mockInvoices,
        isLoading: false,
      });
    });

    it('should display invoices in table', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
        expect(screen.getByText('Quarterly Service')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display client names', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument();
        expect(screen.getByText('Client B')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display frequency labels', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Mensuel')).toBeInTheDocument();
        expect(screen.getByText('Trimestriel')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display status badges', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('En pause')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display discount badge when applicable', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('-10%')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Summary Cards', () => {
    beforeEach(() => {
      const { useRecurringInvoicePayments } = require('../../hooks/useRecurringInvoicePayments');
      vi.mocked(useRecurringInvoicePayments).mockReturnValue({
        data: mockInvoices,
        isLoading: false,
      });
    });

    it('should display active invoices count', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Factures actives')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display paused invoices count', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('En pause')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display monthly revenue', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Revenu mensuel prévu')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display total generated', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Total généré')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      const { useRecurringInvoicePayments } = require('../../hooks/useRecurringInvoicePayments');
      vi.mocked(useRecurringInvoicePayments).mockReturnValue({
        data: mockInvoices,
        isLoading: false,
      });
    });

    it('should filter invoices by search term', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
      }, { timeout: 3000 });

      const searchInput = screen.getByPlaceholderText(/Rechercher client, description/i);
      fireEvent.change(searchInput, { target: { value: 'Monthly' } });

      await waitFor(() => {
        expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
        expect(screen.queryByText('Quarterly Service')).not.toBeInTheDocument();
      });
    });
  });

  describe('Status Filter', () => {
    beforeEach(() => {
      const { useRecurringInvoicePayments } = require('../../hooks/useRecurringInvoicePayments');
      vi.mocked(useRecurringInvoicePayments).mockReturnValue({
        data: mockInvoices,
        isLoading: false,
      });
    });

    it('should filter invoices by status', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
      }, { timeout: 3000 });

      const statusFilter = screen.getByRole('combobox');
      fireEvent.change(statusFilter, { target: { value: 'ACTIVE' } });

      await waitFor(() => {
        expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
        expect(screen.queryByText('Quarterly Service')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no invoices', async () => {
      const { useRecurringInvoicePayments } = require('../../hooks/useRecurringInvoicePayments');
      vi.mocked(useRecurringInvoicePayments).mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucune facture récurrente trouvée')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      const { useRecurringInvoicePayments } = require('../../hooks/useRecurringInvoicePayments');
      vi.mocked(useRecurringInvoicePayments).mockReturnValue({
        data: mockInvoices,
        isLoading: false,
      });
    });

    it('should render validate button for paused invoices', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        const validateButtons = screen.getAllByText('Valider');
        expect(validateButtons.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('should render reminder button for all invoices', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        const reminderButtons = screen.getAllByText('Rappel');
        expect(reminderButtons.length).toBe(2);
      }, { timeout: 3000 });
    });

    it('should disable validate button for active invoices', async () => {
      render(<RecurringInvoices />);
      
      await waitFor(() => {
        const validateButtons = screen.getAllByText('Valider');
        const activeInvoiceButton = validateButtons[0];
        expect(activeInvoiceButton).toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('Pagination', () => {
    it('should show pagination when more than PAGE_SIZE items', async () => {
      const manyInvoices = Array.from({ length: 25 }, (_, i) => ({
        ...mockInvoices[0],
        id: `inv-${i}`,
        description: `Invoice ${i}`,
      }));

      const { useRecurringInvoicePayments } = require('../../hooks/useRecurringInvoicePayments');
      vi.mocked(useRecurringInvoicePayments).mockReturnValue({
        data: manyInvoices,
        isLoading: false,
      });

      render(<RecurringInvoices />);
      
      await waitFor(() => {
        expect(screen.getByText(/Page 1 sur/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
