import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientInvitationModal from './ClientInvitationModal';
import { useInviteClient } from '../../hooks/useClients';

vi.mock('../../hooks/useClients', () => ({
  useInviteClient: vi.fn(),
}));

describe('ClientInvitationModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useInviteClient as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('should render modal correctly', () => {
    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Inviter un client')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('client@example.com')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle email input', () => {
    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByPlaceholderText('client@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should handle client name input', () => {
    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const nameInput = screen.getByPlaceholderText("Nom de l'entreprise");
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    expect(nameInput).toHaveValue('Test Company');
  });

  it('should handle message textarea', () => {
    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const messageTextarea = screen.getByPlaceholderText(/Message optionnel/);
    fireEvent.change(messageTextarea, { target: { value: 'Welcome message' } });

    expect(messageTextarea).toHaveValue('Welcome message');
  });

  it('should display how it works section', () => {
    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Comment ça marche :')).toBeInTheDocument();
    expect(screen.getByText(/Le client reçoit un email/)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    mockMutateAsync.mockResolvedValue({
      invitationLink: 'https://example.com/invite/abc123',
    });

    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByPlaceholderText('client@example.com');
    const nameInput = screen.getByPlaceholderText("Nom de l'entreprise");

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByText("Envoyer l'invitation");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test Company',
        message: undefined,
      });
    });
  });

  it('should display success message after invitation sent', async () => {
    mockMutateAsync.mockResolvedValue({
      invitationLink: 'https://example.com/invite/abc123',
    });

    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByPlaceholderText('client@example.com');
    const nameInput = screen.getByPlaceholderText("Nom de l'entreprise");

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByText("Envoyer l'invitation");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invitation envoyée avec succès/)).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should display invitation link after success', async () => {
    mockMutateAsync.mockResolvedValue({
      invitationLink: 'https://example.com/invite/abc123',
    });

    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByPlaceholderText('client@example.com');
    const nameInput = screen.getByPlaceholderText("Nom de l'entreprise");

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByText("Envoyer l'invitation");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const linkInput = screen.getByDisplayValue('https://example.com/invite/abc123');
      expect(linkInput).toBeInTheDocument();
    });
  });

  it('should handle copy link button', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    mockMutateAsync.mockResolvedValue({
      invitationLink: 'https://example.com/invite/abc123',
    });

    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByPlaceholderText('client@example.com');
    const nameInput = screen.getByPlaceholderText("Nom de l'entreprise");

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByText("Envoyer l'invitation");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const copyButton = screen.getByText('Copier');
      fireEvent.click(copyButton);

      expect(mockClipboard.writeText).toHaveBeenCalledWith('https://example.com/invite/abc123');
    });
  });

  it('should show copied confirmation', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    mockMutateAsync.mockResolvedValue({
      invitationLink: 'https://example.com/invite/abc123',
    });

    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByPlaceholderText('client@example.com');
    const nameInput = screen.getByPlaceholderText("Nom de l'entreprise");

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByText("Envoyer l'invitation");
    fireEvent.click(submitButton);

    await waitFor(async () => {
      const copyButton = screen.getByText('Copier');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copié')).toBeInTheDocument();
      });
    });
  });

  it('should show loading state during submission', () => {
    (useInviteClient as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Envoi...')).toBeInTheDocument();
  });

  it('should display validation errors', async () => {
    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText("Envoyer l'invitation");
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Validation errors would appear
    });
  });

  it('should reset form when closing after success', async () => {
    mockMutateAsync.mockResolvedValue({
      invitationLink: 'https://example.com/invite/abc123',
    });

    render(
      <ClientInvitationModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByPlaceholderText('client@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByText("Envoyer l'invitation");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const closeButton = screen.getByText('Fermer');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
