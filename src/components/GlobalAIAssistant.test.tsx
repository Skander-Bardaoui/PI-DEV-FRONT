/**
 * Tests for GlobalAIAssistant component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalAIAssistant from './GlobalAIAssistant';

// Mock dependencies
vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

describe('GlobalAIAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: {
        business_id: 'business-123',
        id: 'user-1',
      },
    });
  });

  it('should not render when user has no business_id', () => {
    (useAuth as any).mockReturnValue({
      user: null,
    });

    const { container } = render(<GlobalAIAssistant />);
    expect(container.firstChild).toBeNull();
  });

  it('should render floating button when closed', () => {
    render(<GlobalAIAssistant />);

    const button = screen.getByLabelText('Ouvrir l\'assistant IA');
    expect(button).toBeInTheDocument();
  });

  it('should open assistant when button is clicked', () => {
    render(<GlobalAIAssistant />);

    const button = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(button);

    expect(screen.getByText('Assistant IA')).toBeInTheDocument();
    expect(screen.getByText('NovaEntra Intelligence')).toBeInTheDocument();
  });

  it('should display initial welcome message', () => {
    render(<GlobalAIAssistant />);

    const button = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(button);

    expect(screen.getByText(/Bonjour ! Je suis votre assistant intelligent NovaEntra/)).toBeInTheDocument();
  });

  it('should display input field', () => {
    render(<GlobalAIAssistant />);

    const button = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(button);

    const input = screen.getByPlaceholderText('Posez votre question...');
    expect(input).toBeInTheDocument();
  });

  it('should send message when send button is clicked', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: {
        answer: 'Voici la réponse',
        suggestions: [],
      },
    });

    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test question' } });

    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/businesses/business-123/ai-assistant/chat',
        expect.objectContaining({
          question: 'Test question',
        })
      );
    });
  });

  it('should send message when Enter key is pressed', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: {
        answer: 'Voici la réponse',
        suggestions: [],
      },
    });

    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
    });
  });

  it('should not send empty message', () => {
    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const sendButton = screen.getByRole('button', { name: '' });
    expect(sendButton).toBeDisabled();
  });

  it('should display loading state while waiting for response', async () => {
    (axiosInstance.post as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { answer: 'Response' } }), 100))
    );

    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test' } });

    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/L'IA réfléchit/)).toBeInTheDocument();
    });
  });

  it('should display error message on API failure', async () => {
    (axiosInstance.post as any).mockRejectedValue(new Error('API Error'));

    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test' } });

    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Désolé, une erreur s'est produite/)).toBeInTheDocument();
    });
  });

  it('should close assistant when close button is clicked', () => {
    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const closeButton = screen.getByLabelText('Fermer');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Assistant IA')).not.toBeInTheDocument();
  });

  it('should minimize assistant when minimize button is clicked', () => {
    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const minimizeButton = screen.getByLabelText('Minimiser');
    fireEvent.click(minimizeButton);

    // Full panel should not be visible
    expect(screen.queryByPlaceholderText('Posez votre question...')).not.toBeInTheDocument();
    // But minimized version should be visible
    expect(screen.getByText('Assistant IA')).toBeInTheDocument();
  });

  it('should display quick questions on initial load', () => {
    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    expect(screen.getByText('Questions rapides :')).toBeInTheDocument();
  });

  it('should send quick question when clicked', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: {
        answer: 'Réponse',
        suggestions: [],
      },
    });

    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const quickQuestion = screen.getByText(/Quel est mon chiffre d'affaires/);
    fireEvent.click(quickQuestion);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
    });
  });

  it('should display suggestions from AI response', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: {
        answer: 'Voici la réponse',
        suggestions: ['Question 1', 'Question 2'],
      },
    });

    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test' } });

    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });
  });

  it('should handle rate limit error', async () => {
    (axiosInstance.post as any).mockRejectedValue({
      response: { status: 429 },
    });

    render(<GlobalAIAssistant />);

    const openButton = screen.getByLabelText('Ouvrir l\'assistant IA');
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test' } });

    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Trop de requêtes/)).toBeInTheDocument();
    });
  });
});
