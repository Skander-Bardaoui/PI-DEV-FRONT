import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteDetailModal from './QuoteDetailModal';
import {
  useSendQuote,
  useAcceptQuote,
  useRejectQuote,
  useConvertQuoteToInvoice,
  useConvertQuoteToOrder,
  useQuote,
} from '../../hooks/useQuotes';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/Toast';
import { QuoteStatus } from '../../types/quote';

vi.mock('../../hooks/useQuotes', () => ({
  useSendQuote: vi.fn(),
  useAcceptQuote: vi.fn(),
  useRejectQuote: vi.fn(),
  useConvertQuoteToInvoice: vi.fn(),
  useConvertQuoteToOrder: vi.fn(),
  useQuote: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../ui/Toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('./QuoteModal', () => ({
  default: () => <div>Edit Modal</div>,
}));

vi.mock('../ui/ConfirmModal', () => ({
  default: ({ onConfirm }: any) => (
    <button onClick={onConfirm}>Confirm Delete</button>
  ),
}));

vi.mock('../../utils/sales-quote-print', () => ({
  printQuote: vi.fn(),
}));

vi.mock('../../utils/business-info.utils', () => ({
  getBusinessInfo: vi.fn().mockResolvedValue({
    businessName: 'Test Business',
    businessMF: '1234567',
    businessAddress: 'Test Address',
  }),
}));

describe('QuoteDetailModal', () => {
  const mockOnClose = vi.fn();
  const mockOnDelete = vi.fn();
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const mockQuote = {
    id: 'quote-1',
    quoteNumber: 'DEV-2024-001',
    status: QuoteStatus.DRAFT,
    client: {
      id: 'client-1',
      name: 'Test Client',
      email: 'client@test.com',
    },
    quoteDate: '2024-01-01',
    validUntil: '2024-02-01',
    items: [
      {
        id: 'item-1',
        description: 'Product A',
        quantity: 10,
        unitPrice: 100,
        taxRate: 19,
        total: 1000,
      },
    ],
    subtotal: 1000,
    taxAmount: 190,
    timbreFiscal: 1,
    netAmount: 1191,
    notes: 'Test notes',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      user: { id: 'user-1' },
    });

    (useToast as any).mockReturnValue(mockToast);

    (useQuote as any).mockReturnValue({
      data: mockQuote,
      isLoading: false,
    });

    (useSendQuote as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    (useAcceptQuote as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    (useRejectQuote as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    (useConvertQuoteToInvoice as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    (useConvertQuoteToOrder as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('should render modal correctly', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('DEV-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Test Client')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display quote items', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should toggle items section', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const toggleButton = screen.getByText(/Lignes du devis/);
    fireEvent.click(toggleButton);

    // Items should still be visible (default is expanded)
  });

  it('should display totals correctly', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Sous-total HT')).toBeInTheDocument();
    expect(screen.getByText('TVA')).toBeInTheDocument();
    expect(screen.getByText('Timbre fiscal')).toBeInTheDocument();
    expect(screen.getByText('Net TTC')).toBeInTheDocument();
  });

  it('should show edit button for draft quotes', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Modifier')).toBeInTheDocument();
  });

  it('should show send button for draft quotes', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Envoyer au client')).toBeInTheDocument();
  });

  it('should show accept button for sent quotes', () => {
    const sentQuote = { ...mockQuote, status: QuoteStatus.SENT };
    (useQuote as any).mockReturnValue({
      data: sentQuote,
      isLoading: false,
    });

    render(
      <QuoteDetailModal
        quote={sentQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Accepter → Commande/)).toBeInTheDocument();
  });

  it('should show convert buttons for accepted quotes', () => {
    const acceptedQuote = { ...mockQuote, status: QuoteStatus.ACCEPTED };
    (useQuote as any).mockReturnValue({
      data: acceptedQuote,
      isLoading: false,
    });

    render(
      <QuoteDetailModal
        quote={acceptedQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Convertir en facture')).toBeInTheDocument();
    expect(screen.getByText('Convertir en commande')).toBeInTheDocument();
  });

  it('should handle send quote', () => {
    const mockMutate = vi.fn();
    (useSendQuote as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const sendButton = screen.getByText('Envoyer au client');
    fireEvent.click(sendButton);

    expect(mockMutate).toHaveBeenCalledWith('quote-1');
  });

  it('should handle accept and convert to order', async () => {
    const mockAccept = vi.fn().mockResolvedValue({});
    const mockConvert = vi.fn().mockResolvedValue({});
    
    (useAcceptQuote as any).mockReturnValue({
      mutateAsync: mockAccept,
      isPending: false,
    });

    (useConvertQuoteToOrder as any).mockReturnValue({
      mutateAsync: mockConvert,
      isPending: false,
    });

    const sentQuote = { ...mockQuote, status: QuoteStatus.SENT };
    (useQuote as any).mockReturnValue({
      data: sentQuote,
      isLoading: false,
    });

    render(
      <QuoteDetailModal
        quote={sentQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const acceptButton = screen.getByText(/Accepter → Commande/);
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockAccept).toHaveBeenCalledWith('quote-1');
      expect(mockConvert).toHaveBeenCalledWith('quote-1');
      expect(mockToast.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle convert to invoice', async () => {
    const mockConvert = vi.fn().mockResolvedValue({});
    (useConvertQuoteToInvoice as any).mockReturnValue({
      mutateAsync: mockConvert,
      isPending: false,
    });

    const acceptedQuote = { ...mockQuote, status: QuoteStatus.ACCEPTED };
    (useQuote as any).mockReturnValue({
      data: acceptedQuote,
      isLoading: false,
    });

    render(
      <QuoteDetailModal
        quote={acceptedQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const convertButton = screen.getByText('Convertir en facture');
    fireEvent.click(convertButton);

    await waitFor(() => {
      expect(mockConvert).toHaveBeenCalledWith('quote-1');
      expect(mockToast.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle reject quote', () => {
    const mockMutate = vi.fn();
    (useRejectQuote as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    const sentQuote = { ...mockQuote, status: QuoteStatus.SENT };
    (useQuote as any).mockReturnValue({
      data: sentQuote,
      isLoading: false,
    });

    render(
      <QuoteDetailModal
        quote={sentQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const rejectButton = screen.getByText('Rejeter');
    fireEvent.click(rejectButton);

    expect(mockMutate).toHaveBeenCalledWith('quote-1');
  });

  it('should handle delete quote', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith('quote-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should open edit modal', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const editButton = screen.getByText('Modifier');
    fireEvent.click(editButton);

    expect(screen.getByText('Edit Modal')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useQuote as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Chargement des détails...')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/01\/02\/2024/)).toBeInTheDocument();
  });

  it('should display notes when present', () => {
    render(
      <QuoteDetailModal
        quote={mockQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('should handle conversion error', async () => {
    const mockConvert = vi.fn().mockRejectedValue({
      response: { data: { message: 'Conversion failed' } },
    });
    
    (useConvertQuoteToInvoice as any).mockReturnValue({
      mutateAsync: mockConvert,
      isPending: false,
    });

    const acceptedQuote = { ...mockQuote, status: QuoteStatus.ACCEPTED };
    (useQuote as any).mockReturnValue({
      data: acceptedQuote,
      isLoading: false,
    });

    render(
      <QuoteDetailModal
        quote={acceptedQuote}
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const convertButton = screen.getByText('Convertir en facture');
    fireEvent.click(convertButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erreur de conversion', 'Conversion failed');
    });
  });
});
