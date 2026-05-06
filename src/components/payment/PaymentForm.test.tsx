import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentForm } from './PaymentForm';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: vi.fn(),
  useElements: vi.fn(),
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
}));
vi.mock('../ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('PaymentForm', () => {
  const mockOnSuccess = vi.fn();
  const mockStripe = {
    confirmPayment: vi.fn(),
  };
  const mockElements = {};

  const defaultProps = {
    token: 'test-token',
    amount: 99.999,
    currency: 'TND',
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { useStripe, useElements } = require('@stripe/react-stripe-js');
    useStripe.mockReturnValue(mockStripe);
    useElements.mockReturnValue(mockElements);
  });

  it('renders payment form with payment element', () => {
    render(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
    expect(screen.getByText(/Pay 99.999 TND/i)).toBeInTheDocument();
  });

  it('displays security message', () => {
    render(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('Your payment information is secure and encrypted')).toBeInTheDocument();
  });

  it('disables submit button when stripe is not loaded', () => {
    const { useStripe } = require('@stripe/react-stripe-js');
    useStripe.mockReturnValue(null);
    
    render(<PaymentForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Pay/i });
    expect(submitButton).toBeDisabled();
  });

  it('handles successful payment', async () => {
    mockStripe.confirmPayment.mockResolvedValue({
      paymentIntent: {
        id: 'pi_123',
        status: 'succeeded',
      },
    });
    
    vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });
    
    render(<PaymentForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Pay/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockStripe.confirmPayment).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions/pay/test-token/confirm'),
        { paymentIntentId: 'pi_123' }
      );
    });
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message on payment failure', async () => {
    mockStripe.confirmPayment.mockResolvedValue({
      error: {
        message: 'Card declined',
      },
    });
    
    render(<PaymentForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Pay/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Card declined')).toBeInTheDocument();
    });
  });

  it('shows processing state during payment', async () => {
    mockStripe.confirmPayment.mockImplementation(() => new Promise(() => {}));
    
    render(<PaymentForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Pay/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  it('handles backend confirmation error', async () => {
    mockStripe.confirmPayment.mockResolvedValue({
      paymentIntent: {
        id: 'pi_123',
        status: 'succeeded',
      },
    });
    
    vi.mocked(axios.post).mockRejectedValue({
      response: {
        data: {
          message: 'Backend error',
        },
      },
    });
    
    render(<PaymentForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Pay/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Backend error')).toBeInTheDocument();
    });
  });

  it('prevents form submission when processing', async () => {
    mockStripe.confirmPayment.mockImplementation(() => new Promise(() => {}));
    
    render(<PaymentForm {...defaultProps} />);
    
    const form = screen.getByRole('button', { name: /Pay/i }).closest('form');
    fireEvent.submit(form!);
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockStripe.confirmPayment).toHaveBeenCalledTimes(1);
    });
  });
});
