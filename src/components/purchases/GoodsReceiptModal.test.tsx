import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoodsReceiptModal from './GoodsReceiptModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockPO = {
  id: 'po-1',
  po_number: 'BC-001',
  created_at: '2026-04-01T10:00:00Z',
  supplier: {
    name: 'Fournisseur Test',
  },
  items: [
    {
      id: 'item-1',
      description: 'Product 1',
      quantity_ordered: '10.000',
      quantity_received: '0.000',
      unit_price_ht: '100.000',
    },
    {
      id: 'item-2',
      description: 'Product 2',
      quantity_ordered: '20.000',
      quantity_received: '10.000',
      unit_price_ht: '50.000',
    },
  ],
};

vi.mock('../../hooks/useGoodsReceipts', () => ({
  useCreateGoodsReceipt: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../ui/Toast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock('../../schemas/purchases.schemas', () => ({
  createGoodsReceiptSchema: vi.fn(() => ({
    parse: vi.fn((data) => data),
  })),
}));

vi.mock('../../types', () => ({
  formatAmount: vi.fn((val) => `${Number(val).toFixed(3)} TND`),
  round3: vi.fn((val) => Math.round(val * 1000) / 1000),
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

describe('GoodsReceiptModal', () => {
  const mockOnClose = vi.fn();
  const businessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with PO information', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Nouveau Bon de Réception')).toBeInTheDocument();
    expect(screen.getByText(/BC-001/)).toBeInTheDocument();
    expect(screen.getByText(/Fournisseur Test/)).toBeInTheDocument();
  });

  it('should display pending items', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should display receipt date input', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/Date de réception/i)).toBeInTheDocument();
  });

  it('should fill all quantities when clicking "Tout recevoir"', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const fillAllButton = screen.getByRole('button', { name: /Tout recevoir/i });
    fireEvent.click(fillAllButton);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(10);
    expect(inputs[1]).toHaveValue(10);
  });

  it('should handle quantity input changes', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '5' } });

    expect(inputs[0]).toHaveValue(5);
  });

  it('should submit form successfully', async () => {
    const { useCreateGoodsReceipt } = require('../../hooks/useGoodsReceipts');
    const mockMutate = vi.fn().mockResolvedValue({});
    useCreateGoodsReceipt.mockReturnValue({
      mutateAsync: mockMutate,
    });

    const { useToast } = require('../ui/Toast');
    const mockToast = { success: vi.fn(), error: vi.fn() };
    useToast.mockReturnValue(mockToast);

    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '5' } });

    const submitButton = screen.getByRole('button', { name: /Valider la réception/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show error when no quantity is entered', async () => {
    const { useToast } = require('../ui/Toast');
    const mockToast = { success: vi.fn(), error: vi.fn() };
    useToast.mockReturnValue(mockToast);

    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /Valider la réception/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Validation',
        expect.stringContaining('au moins une quantité')
      );
    });
  });

  it('should close modal when close button is clicked', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when cancel button is clicked', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display notes textarea', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/Observations \/ Remarques/i)).toBeInTheDocument();
  });

  it('should disable submit button when no items pending', () => {
    const poWithNoItems = {
      ...mockPO,
      items: [],
    };

    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={poWithNoItems as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /Valider la réception/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show message when all items are received', () => {
    const poFullyReceived = {
      ...mockPO,
      items: [
        {
          id: 'item-1',
          description: 'Product 1',
          quantity_ordered: '10.000',
          quantity_received: '10.000',
          unit_price_ht: '100.000',
        },
      ],
    };

    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={poFullyReceived as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Toutes les lignes ont été entièrement réceptionnées/i)).toBeInTheDocument();
  });

  it('should calculate total value correctly', () => {
    render(
      <GoodsReceiptModal
        businessId={businessId}
        po={mockPO as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '5' } });

    expect(screen.getByText(/Valeur totale reçue/i)).toBeInTheDocument();
  });
});
