import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DisputeResponsesPanel } from './DisputeResponsesPanel';
import { QueryClient, QueryClientProvider } from '@tantml:query';

const mockResponses = [
  {
    id: 'resp-1',
    invoice_number: 'FACT-001',
    supplier_name: 'Fournisseur Test',
    invoice_amount: 1191.000,
    expected_amount: 1000.000,
    proposed_amount: 1100.000,
    response_message: 'Nous avons vérifié et le montant est correct',
    proposed_solution: 'Nous proposons un ajustement à 1100 TND',
    created_at: '2026-05-01T10:00:00Z',
  },
];

vi.mock('../../hooks/useDisputeResponses', () => ({
  usePendingDisputeResponses: vi.fn(() => ({
    data: mockResponses,
    isLoading: false,
  })),
  useProcessDisputeResponse: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  })),
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

describe('DisputeResponsesPanel', () => {
  const businessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render panel with responses', () => {
    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    expect(screen.getByText('FACT-001')).toBeInTheDocument();
    expect(screen.getByText('Fournisseur Test')).toBeInTheDocument();
  });

  it('should display response message', () => {
    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    expect(screen.getByText('Nous avons vérifié et le montant est correct')).toBeInTheDocument();
  });

  it('should display proposed solution', () => {
    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    expect(screen.getByText('Nous proposons un ajustement à 1100 TND')).toBeInTheDocument();
  });

  it('should display amounts', () => {
    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    expect(screen.getByText('Montant Facturé')).toBeInTheDocument();
    expect(screen.getByText('Montant Attendu')).toBeInTheDocument();
    expect(screen.getByText('Écart')).toBeInTheDocument();
  });

  it('should open accept modal', () => {
    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    const acceptButton = screen.getByRole('button', { name: /Accepter et Résoudre/i });
    fireEvent.click(acceptButton);

    expect(screen.getByText('Accepter la Réponse')).toBeInTheDocument();
  });

  it('should open reject modal', () => {
    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    const rejectButton = screen.getByRole('button', { name: /Rejeter/i });
    fireEvent.click(rejectButton);

    expect(screen.getByText('Rejeter la Réponse')).toBeInTheDocument();
  });

  it('should process accept action', async () => {
    const { useProcessDisputeResponse } = require('../../hooks/useDisputeResponses');
    const mockMutate = vi.fn().mockResolvedValue({});
    useProcessDisputeResponse.mockReturnValue({
      mutateAsync: mockMutate,
    });

    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    const acceptButton = screen.getByRole('button', { name: /Accepter et Résoudre/i });
    fireEvent.click(acceptButton);

    const confirmButton = screen.getByRole('button', { name: /Confirmer/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        responseId: 'resp-1',
        action: 'accept',
        admin_notes: undefined,
      });
    });
  });

  it('should add admin notes', () => {
    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    const acceptButton = screen.getByRole('button', { name: /Accepter et Résoudre/i });
    fireEvent.click(acceptButton);

    const notesTextarea = screen.getByPlaceholderText(/Ajoutez des notes pour votre suivi interne/i);
    fireEvent.change(notesTextarea, { target: { value: 'Test admin notes' } });

    expect(notesTextarea).toHaveValue('Test admin notes');
  });

  it('should close modal on cancel', () => {
    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    const acceptButton = screen.getByRole('button', { name: /Accepter et Résoudre/i });
    fireEvent.click(acceptButton);

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Accepter la Réponse')).not.toBeInTheDocument();
  });

  it('should display loading state', () => {
    const { usePendingDisputeResponses } = require('../../hooks/useDisputeResponses');
    usePendingDisputeResponses.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should display empty state when no responses', () => {
    const { usePendingDisputeResponses } = require('../../hooks/useDisputeResponses');
    usePendingDisputeResponses.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<DisputeResponsesPanel businessId={businessId} />, { wrapper: createWrapper() });

    expect(screen.getByText('Aucune réponse de fournisseur en attente')).toBeInTheDocument();
  });
});
