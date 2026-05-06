import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierInviteModal from './SupplierInviteModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';

vi.mock('@tanstack/react-query');
vi.mock('../../api/suppliers');

describe('SupplierInviteModal', () => {
  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();
  const mockInvalidateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as any).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      error: null,
    });
  });

  it('should render invite modal', () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    expect(screen.getByText('Inviter un fournisseur')).toBeInTheDocument();
    expect(screen.getByText('Envoyez une invitation par email')).toBeInTheDocument();
  });

  it('should display how it works section', () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    expect(screen.getByText('Comment ça marche ?')).toBeInTheDocument();
    expect(screen.getByText(/Le fournisseur reçoit un email/)).toBeInTheDocument();
  });

  it('should allow entering email', () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText('fournisseur@exemple.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should allow entering supplier name', () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const nameInput = screen.getByPlaceholderText('Nom de l\'entreprise');
    fireEvent.change(nameInput, { target: { value: 'Test Supplier' } });

    expect(nameInput).toHaveValue('Test Supplier');
  });

  it('should allow entering custom message', () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const messageInput = screen.getByPlaceholderText('Ajoutez un message pour le fournisseur...');
    fireEvent.change(messageInput, { target: { value: 'Custom message' } });

    expect(messageInput).toHaveValue('Custom message');
  });

  it('should submit invitation', async () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText('fournisseur@exemple.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByText('Envoyer l\'invitation');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('should show validation error for empty email', async () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const submitButton = screen.getByText('Envoyer l\'invitation');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText('fournisseur@exemple.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText('Envoyer l\'invitation');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  it('should close modal on cancel', () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show success message after sending invitation', async () => {
    (useMutation as any).mockReturnValue({
      mutate: (data: any, options: any) => {
        options.onSuccess();
      },
      error: null,
    });

    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText('fournisseur@exemple.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByText('Envoyer l\'invitation');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invitation envoyée !')).toBeInTheDocument();
    });
  });

  it('should display error message on API failure', async () => {
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      error: {
        response: { data: { message: 'Failed to send invitation' } },
      },
    });

    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    expect(screen.getByText('Failed to send invitation')).toBeInTheDocument();
  });

  it('should disable submit button while submitting', async () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText('fournisseur@exemple.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByText('Envoyer l\'invitation');
    
    // Mock submitting state
    fireEvent.click(submitButton);

    // Button should show loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show helper text for supplier name field', () => {
    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    expect(
      screen.getByText('Le nom sera pré-rempli dans le formulaire d\'inscription')
    ).toBeInTheDocument();
  });

  it('should auto-close after successful submission', async () => {
    vi.useFakeTimers();

    (useMutation as any).mockReturnValue({
      mutate: (data: any, options: any) => {
        options.onSuccess();
      },
      error: null,
    });

    render(<SupplierInviteModal businessId="biz-1" onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText('fournisseur@exemple.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByText('Envoyer l\'invitation');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invitation envoyée !')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(2500);

    expect(mockOnClose).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
