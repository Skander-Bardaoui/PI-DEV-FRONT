// src/pages/PaymentPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentPage } from './PaymentPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => <div data-testid="stripe-elements">{children}</div>,
}));

vi.mock('../components/payment/PaymentForm', () => ({
  PaymentForm: ({ onSuccess }: any) => (
    <div data-testid="payment-form">
      <button onClick={onSuccess}>Complete Payment</button>
    </div>
  ),
}));

vi.mock('../components/payment/PaymentStatusScreen', () => ({
  PaymentStatusScreen: ({ status }: any) => (
    <div data-testid="payment-status-screen">Status: {status}</div>
  ),
}));

// ─── Test Data ────────────────────────────────────────────────────────────────

const mockPaymentData = {
  tenantName: 'Test Tenant',
  ownerName: 'John Doe',
  planName: 'Professional',
  billingCycle: 'monthly' as const,
  amount: 99.99,
  currency: 'USD',
  subscriptionId: 'sub-123',
  status: 'pending_payment',
};

const mockClientSecret = 'pi_test_secret_123';

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = (token = 'test-token') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/pay/:token" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>,
    { wrapper: ({ children }) => <div>{children}</div> }
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/pay/test-token');
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should show loading spinner initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));
      renderWithRouter();

      expect(screen.getByRole('generic', { hidden: true })).toHaveClass('animate-spin');
    });

    it('should render NovEntra logo and header', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('NovEntra')).toBeInTheDocument();
        expect(screen.getByText('Complete your subscription')).toBeInTheDocument();
      });
    });

    it('should display subscription summary', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Subscription Summary')).toBeInTheDocument();
        expect(screen.getByText('Professional')).toBeInTheDocument();
        expect(screen.getByText('Monthly')).toBeInTheDocument();
        expect(screen.getByText(/99\.990 USD/)).toBeInTheDocument();
      });
    });

    it('should show secure payment badge', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Secure payment powered by Stripe/)).toBeInTheDocument();
      });
    });

    it('should render payment form when client secret is available', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('payment-form')).toBeInTheDocument();
        expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
      });
    });
  });

  // ── Billing Cycle Tests ─────────────────────────────────────────────────────

  describe('Billing Cycle Display', () => {
    it('should display "Monthly" for monthly billing', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Monthly')).toBeInTheDocument();
      });
    });

    it('should display "Annual" for annual billing', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { ...mockPaymentData, billingCycle: 'annual' },
      });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Annual')).toBeInTheDocument();
      });
    });
  });

  // ── Status Handling Tests ───────────────────────────────────────────────────

  describe('Payment Status', () => {
    it('should show payment status screen for completed payment', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { ...mockPaymentData, status: 'active' },
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('payment-status-screen')).toBeInTheDocument();
        expect(screen.getByText('Status: active')).toBeInTheDocument();
      });
    });

    it('should show payment status screen for cancelled payment', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { ...mockPaymentData, status: 'cancelled' },
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('payment-status-screen')).toBeInTheDocument();
        expect(screen.getByText('Status: cancelled')).toBeInTheDocument();
      });
    });

    it('should create payment intent for pending payment', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/create-payment-intent')
        );
      });
    });
  });

  // ── Error Handling Tests ────────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should show error when token is missing', async () => {
      window.history.pushState({}, '', '/pay/');
      renderWithRouter('');

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Invalid payment link')).toBeInTheDocument();
      });
    });

    it('should display error message when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { message: 'Payment not found' } },
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Payment not found')).toBeInTheDocument();
      });
    });

    it('should show generic error when no error message provided', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Failed to load payment information')).toBeInTheDocument();
      });
    });

    it('should show error when client secret is not available', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      renderWithRouter();

      await waitFor(() => {
        expect(
          screen.getByText(/Unable to initialize payment. Please try again or contact support./)
        ).toBeInTheDocument();
      });
    });
  });

  // ── API Integration Tests ───────────────────────────────────────────────────

  describe('API Integration', () => {
    it('should fetch payment data on mount', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/subscriptions/pay/test-token')
        );
      });
    });

    it('should use correct token in API calls', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaymentData });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      window.history.pushState({}, '', '/pay/custom-token-123');
      renderWithRouter('custom-token-123');

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('custom-token-123')
        );
      });
    });
  });

  // ── Amount Formatting Tests ─────────────────────────────────────────────────

  describe('Amount Formatting', () => {
    it('should format amount with 3 decimal places', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { ...mockPaymentData, amount: 150.5 },
      });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/150\.500 USD/)).toBeInTheDocument();
      });
    });

    it('should handle string amounts', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { ...mockPaymentData, amount: '99.99' },
      });
      mockedAxios.post.mockResolvedValueOnce({ data: { clientSecret: mockClientSecret } });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/99\.990 USD/)).toBeInTheDocument();
      });
    });
  });
});
