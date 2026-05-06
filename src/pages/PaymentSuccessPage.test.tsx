// src/pages/PaymentSuccessPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentSuccessPage } from './PaymentSuccessPage';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <PaymentSuccessPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PaymentSuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render success icon', () => {
      renderWithRouter();

      const icon = screen.getByRole('generic', { hidden: true });
      expect(icon.parentElement).toHaveClass('bg-green-100');
    });

    it('should display success title', () => {
      renderWithRouter();

      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    });

    it('should show subscription active message', () => {
      renderWithRouter();

      expect(screen.getByText('Your subscription is now active.')).toBeInTheDocument();
    });

    it('should display instructions to login', () => {
      renderWithRouter();

      expect(
        screen.getByText(/You can log in to your NovEntra account and start using all the features./)
      ).toBeInTheDocument();
    });

    it('should show confirmation email notice', () => {
      renderWithRouter();

      expect(
        screen.getByText(/A confirmation email has been sent to your registered email address./)
      ).toBeInTheDocument();
    });

    it('should render Go to Login button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Go to Login/i })).toBeInTheDocument();
    });
  });

  // ── Navigation Tests ────────────────────────────────────────────────────────

  describe('Navigation', () => {
    it('should navigate to login page when clicking button', () => {
      renderWithRouter();

      const loginButton = screen.getByRole('button', { name: /Go to Login/i });
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should call navigate only once per click', () => {
      renderWithRouter();

      const loginButton = screen.getByRole('button', { name: /Go to Login/i });
      fireEvent.click(loginButton);
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  // ── Styling Tests ───────────────────────────────────────────────────────────

  describe('Styling', () => {
    it('should have gradient background', () => {
      const { container } = renderWithRouter();

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('bg-gradient-to-br', 'from-purple-50', 'to-blue-50');
    });

    it('should center content on screen', () => {
      const { container } = renderWithRouter();

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
    });

    it('should have white card with shadow', () => {
      renderWithRouter();

      const card = screen.getByText('Payment Successful!').closest('div');
      expect(card).toHaveClass('bg-white', 'rounded-2xl', 'shadow-xl');
    });
  });

  // ── Accessibility Tests ─────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter();

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Payment Successful!');
    });

    it('should have accessible button', () => {
      renderWithRouter();

      const button = screen.getByRole('button', { name: /Go to Login/i });
      expect(button).toBeEnabled();
    });
  });
});
