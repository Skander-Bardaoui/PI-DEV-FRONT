import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DisputeResolutionModal } from './DisputeResolutionModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockDisputeInfo = {
  invoice_number: 'FACT-001',
  supplier_name: 'Fournisseur Test',
  dispute_category: 'PRICE_DISCREPANCY',
  days_in_dispute: 5,
  dispute_reason: 'Montant incorrect',
  invoiced_amount: 1191.000,
  expected_amount: 1000.000,
  discrepancy: 191.000,
  discrepancy_pct: 19.1,
  supplier_email: 'supplier@test.com',
  suggested_actions: [
    {
      action: 'CORRECT_AMOUNTS',
      label: 'Corriger les montants',
      description: 'Ajuster les montants de la facture',
      priority: 'high',
      estimated_time: '5 minutes',
    },
    {
      action: 'RESOLVE_WITHOUT_CHANGES',
      label: 'Résoudre sans modification',
      description: 'Accepter la facture telle quelle',
      priority: 'low',
      estimated_time: '1 minute',
    },
  ],
};

vi.mock('../../hooks/useDisputeResolution', () => ({
  useDisputeInfo: vi.fn(() => ({
    data: mockDisputeInfo,
    isLoading: false,
  })),
  useResolveDispute: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  ResolutionAction: {
    CORRECT_AMOUNTS: 'CORRECT_AMOUNTS',
    RESOLVE_WITHOUT_CHANGES: 'RESOLVE_WITHOUT_CHANGES',
  },
  ACTION_LABELS: {
    CORRECT_AMOUNTS: 'Corriger les montants',
    RESOLVE_WITHOUT_CHANGES: 'Résoudre sans modification',
  },
  CATEGORY_LABELS: {
    PRICE_DISCREPANCY: 'Écart de prix',
  },
  CATEGORY_COLORS: {
    PRICE_DISCREPANCY: 'bg-red-100 text-red-700',
  },
  PRIORITY_COLORS: {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-orange-100 text-orange-700',
    low: 'bg-gray-100 text-gray-700',
  },
  PRIORITY_ICONS: {
    high: '🔴',
    medium: '🟠',
    low: '⚪',
  },
}));

vi.mock('../ui/ActionButton', () => ({
  ActionButton: vi.fn(({ label, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )),
  ActionSection: vi.fn(({ title, children }) => (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  )),
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

describe('DisputeResolutionModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const businessId = 'business-123';
  const invoiceId = 'inv-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render modal with dispute information', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Résolution de Litige')).toBeInTheDocument();
    expect(screen.getByText(/FACT-001/)).toBeInTheDocument();
    expect(screen.getByText(/Fournisseur Test/)).toBeInTheDocument();
  });

  it('should display dispute details', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Montant incorrect')).toBeInTheDocument();
    expect(screen.getByText(/5 jour/)).toBeInTheDocument();
  });

  it('should display suggested actions', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Corriger les montants')).toBeInTheDocument();
    expect(screen.getByText('Résoudre sans modification')).toBeInTheDocument();
  });

  it('should select an action', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const actionButton = screen.getByText('Corriger les montants').closest('button');
    fireEvent.click(actionButton!);

    expect(screen.getByText('Détails de la résolution')).toBeInTheDocument();
  });

  it('should show corrected amounts inputs when CORRECT_AMOUNTS is selected', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const actionButton = screen.getByText('Corriger les montants').closest('button');
    fireEvent.click(actionButton!);

    expect(screen.getByLabelText(/Sous-total HT/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/TVA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Timbre Fiscal/i)).toBeInTheDocument();
  });

  it('should handle resolution notes input', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const actionButton = screen.getByText('Corriger les montants').closest('button');
    fireEvent.click(actionButton!);

    const notesTextarea = screen.getByPlaceholderText(/Ajoutez des notes explicatives/i);
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

    expect(notesTextarea).toHaveValue('Test notes');
  });

  it('should toggle supplier notification checkbox', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const actionButton = screen.getByText('Corriger les montants').closest('button');
    fireEvent.click(actionButton!);

    const checkbox = screen.getByLabelText(/Envoyer un email au fournisseur/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('should submit resolution', async () => {
    const { useResolveDispute } = require('../../hooks/useDisputeResolution');
    const mockMutate = vi.fn().mockResolvedValue({});
    useResolveDispute.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    });

    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const actionButton = screen.getByText('Corriger les montants').closest('button');
    fireEvent.click(actionButton!);

    const confirmButton = screen.getByText('Confirmer la résolution');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should close modal when close button is clicked', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    const { useDisputeInfo } = require('../../hooks/useDisputeResolution');
    useDisputeInfo.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should display empty state when no dispute info', () => {
    const { useDisputeInfo } = require('../../hooks/useDisputeResolution');
    useDisputeInfo.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Aucune information de litige disponible')).toBeInTheDocument();
  });

  it('should disable confirm button when no action is selected', () => {
    render(
      <DisputeResolutionModal
        businessId={businessId}
        invoiceId={invoiceId}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const confirmButton = screen.getByText('Confirmer la résolution');
    expect(confirmButton).toBeDisabled();
  });
});
