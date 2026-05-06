import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientFormModal from './ClientFormModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../hooks/useClients', () => ({
  useCreateClient: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useUpdateClient: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
}));

vi.mock('../../schemas/sales.schemas', () => ({
  clientSchema: {
    parse: vi.fn((data) => data),
  },
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

describe('ClientFormModal', () => {
  const mockOnClose = vi.fn();
  const businessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal for creating new client', () => {
    render(
      <ClientFormModal businessId={businessId} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Ajouter un client')).toBeInTheDocument();
  });

  it('should render modal for editing existing client', () => {
    const mockClient = {
      id: 'client-1',
      name: 'Test Client',
      email: 'test@client.com',
      phone: '+216 71 000 000',
      matricule_fiscal: '1234567/A/B/C/000',
      payment_terms: 30,
    };

    render(
      <ClientFormModal
        businessId={businessId}
        client={mockClient as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Modifier le client')).toBeInTheDocument();
  });

  it('should display all form sections', () => {
    render(
      <ClientFormModal businessId={businessId} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Informations générales')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Adresse')).toBeInTheDocument();
    expect(screen.getByText('Informations bancaires')).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    render(
      <ClientFormModal businessId={businessId} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByPlaceholderText(/Nom de l'entreprise/i);
    fireEvent.change(nameInput, { target: { value: 'New Client' } });

    expect(nameInput).toHaveValue('New Client');
  });

  it('should submit form successfully', async () => {
    const { useCreateClient } = require('../../hooks/useClients');
    const mockMutate = vi.fn().mockResolvedValue({});
    useCreateClient.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    });

    render(
      <ClientFormModal businessId={businessId} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByPlaceholderText(/Nom de l'entreprise/i);
    fireEvent.change(nameInput, { target: { value: 'Test Client' } });

    const submitButton = screen.getByRole('button', { name: /Créer le client/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should close modal when close button is clicked', () => {
    render(
      <ClientFormModal businessId={businessId} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when cancel button is clicked', () => {
    render(
      <ClientFormModal businessId={businessId} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state during submission', () => {
    const { useCreateClient } = require('../../hooks/useClients');
    useCreateClient.mockReturnValue({
      mutateAsync: vi.fn(() => new Promise(() => {})),
      isPending: true,
    });

    render(
      <ClientFormModal businessId={businessId} onClose=  {mockOnClose} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /Enregistrement/i });
    expect(submitButton).toBeDisabled();
  });

  it('should populate form with client data when editing', () => {
    const mockClient = {
      id: 'client-1',
      name: 'Test Client',
      email: 'test@client.com',
      phone: '+216 71 000 000',
      matricule_fiscal: '1234567/A/B/C/000',
      payment_terms: 30,
      address: {
        street: '123 Test St',
        city: 'Tunis',
        postal_code: '1000',
        country: 'Tunisie',
      },
    };

    render(
      <ClientFormModal
        businessId={businessId}
        client={mockClient as any}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@client.com')).toBeInTheDocument();
  });

  it('should display required field indicators', () => {
    render(
      <ClientFormModal businessId={businessId} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    const requiredIndicators = screen.getAllByText('*');
    expect(requiredIndicators.length).toBeGreaterThan(0);
  });
});
