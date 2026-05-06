import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisputesSlideOver from './DisputesSlideOver';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

vi.mock('../../api/axiosInstance');

const mockInvoices = [
  {
    id: 'inv-1',
    invoice_number_supplier: 'FACT-001',
    invoice_date: '2026-05-01',
    net_amount: 1191.000,
    dispute_reason: 'Montant incorrect',
    dispute_category: 'PRICE_DISCREPANCY',
    updated_at: '2026-04-28T10:00:00Z',
    supplier: {
      id: 'sup-1',
      name: 'Fournisseur Test',
      email: 'supplier@test.com',
    },
    supplier_po: {
      po_number: 'BC-001',
      net_amount: 1000.000,
    },
  },
];

vi.mock('./DisputeResolutionModal', () => ({
  DisputeResolutionModal: vi.fn(() => <div>Dispute Resolution Modal</div>),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('DisputesSlideOver', () => {
  const mockOnClose = vi.fn();
  const mockOnInvoiceSelect = vi.fn();
  const businessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
    (axiosInstance.get as any).mockResolvedValue({ data: mockInvoices });
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={false}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render slide over when isOpen is true', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Litiges Actifs')).toBeInTheDocument();
    });
  });

  it('should display invoice count', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/1 facture\(s\) en litige/)).toBeInTheDocument();
    });
  });

  it('should display disputed invoices', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('FACT-001')).toBeInTheDocument();
      expect(screen.getByText('Fournisseur Test')).toBeInTheDocument();
      expect(screen.getByText('Montant incorrect')).toBeInTheDocument();
    });
  });

  it('should display category label', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Écart de prix')).toBeInTheDocument();
    });
  });

  it('should display days in dispute', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/\d+j/)).toBeInTheDocument();
    });
  });

  it('should open resolution modal when clicking resolve button', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('FACT-001')).toBeInTheDocument();
    });

    const resolveButton = screen.getByRole('button', { name: /Résoudre/i });
    fireEvent.click(resolveButton);

    await waitFor(() => {
      expect(screen.getByText('Dispute Resolution Modal')).toBeInTheDocument();
    });
  });

  it('should close slide over when clicking close button', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Litiges Actifs')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /Fermer/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close slide over when clicking overlay', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Litiges Actifs')).toBeInTheDocument();
    });

    const overlay = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(overlay!);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    (axiosInstance.get as any).mockImplementation(() => new Promise(() => {}));

    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should display empty state when no disputes', async () => {
    (axiosInstance.get as any).mockResolvedValue({ data: [] });

    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Aucun litige en cours')).toBeInTheDocument();
      expect(screen.getByText('Toutes vos factures sont en ordre !')).toBeInTheDocument();
    });
  });

  it('should display email link', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const emailLink = screen.getByRole('link');
      expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:supplier@test.com'));
    });
  });

  it('should display discrepancy when supplier_po exists', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Écart:')).toBeInTheDocument();
    });
  });

  it('should select invoice when clicking on card', async () => {
    render(
      <DisputesSlideOver
        businessId={businessId}
        isOpen={true}
        onClose={mockOnClose}
        onInvoiceSelect={mockOnInvoiceSelect}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('FACT-001')).toBeInTheDocument();
    });

    const invoiceCard = screen.getByText('FACT-001').closest('div.cursor-pointer');
    fireEvent.click(invoiceCard!);

    await waitFor(() => {
      expect(screen.getByText('Dispute Resolution Modal')).toBeInTheDocument();
    });
  });
});
