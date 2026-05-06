import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PurchaseAIAssistant from './PurchaseAIAssistant';
import axiosInstance from '../../api/axiosInstance';

vi.mock('../../api/axiosInstance');

describe('PurchaseAIAssistant', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render AI assistant modal', () => {
    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    expect(screen.getByText('Assistant IA Achats')).toBeInTheDocument();
    expect(screen.getByText('Posez vos questions en langage naturel')).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    expect(
      screen.getByText(/Bonjour ! Je suis votre assistant achats intelligent/)
    ).toBeInTheDocument();
  });

  it('should show example questions', () => {
    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    expect(screen.getByText('Questions rapides :')).toBeInTheDocument();
    expect(screen.getByText(/Quel fournisseur m'a le plus facturé/)).toBeInTheDocument();
    expect(screen.getByText(/Y a-t-il des factures en retard/)).toBeInTheDocument();
  });

  it('should allow typing a question', () => {
    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test question' } });

    expect(input).toHaveValue('Test question');
  });

  it('should send question when send button is clicked', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: {
        answer: 'Test answer',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      },
    });

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test question' } });

    const sendButton = screen.getByText('Envoyer');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/businesses/biz-1/purchases/ai-assistant/chat',
        expect.objectContaining({
          question: 'Test question',
        })
      );
      expect(screen.getByText('Test answer')).toBeInTheDocument();
    });
  });

  it('should send question on Enter key press', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { answer: 'Test answer', suggestions: [] },
    });

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
    });
  });

  it('should not send on Shift+Enter', () => {
    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', shiftKey: true });

    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it('should display AI response with suggestions', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: {
        answer: 'AI response',
        suggestions: ['Follow-up 1', 'Follow-up 2'],
      },
    });

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByText('Envoyer');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('AI response')).toBeInTheDocument();
      expect(screen.getByText('Questions suggérées :')).toBeInTheDocument();
      expect(screen.getByText('Follow-up 1')).toBeInTheDocument();
      expect(screen.getByText('Follow-up 2')).toBeInTheDocument();
    });
  });

  it('should send suggested question when clicked', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { answer: 'Answer', suggestions: [] },
    });

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const exampleQuestion = screen.getByText(/Quel fournisseur m'a le plus facturé/);
    fireEvent.click(exampleQuestion);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          question: expect.stringContaining('Quel fournisseur'),
        })
      );
    });
  });

  it('should show loading state while waiting for response', async () => {
    (axiosInstance.post as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByText('Envoyer');
    fireEvent.click(sendButton);

    expect(screen.getByText('L\'IA réfléchit...')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    (axiosInstance.post as any).mockRejectedValue({
      response: { data: { message: 'API Error' } },
    });

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByText('Envoyer');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('should handle rate limit error', async () => {
    (axiosInstance.post as any).mockRejectedValue({
      response: { status: 429 },
    });

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByText('Envoyer');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Trop de requêtes/)
      ).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', () => {
    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-x')
    );

    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should clear input after sending message', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { answer: 'Answer', suggestions: [] },
    });

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByText('Envoyer');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should disable send button when input is empty', () => {
    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const sendButton = screen.getByText('Envoyer');
    expect(sendButton).toBeDisabled();
  });

  it('should display message timestamps', async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { answer: 'Answer', suggestions: [] },
    });

    render(<PurchaseAIAssistant businessId="biz-1" onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByText('Envoyer');
    fireEvent.click(sendButton);

    await waitFor(() => {
      const timestamps = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });
});
