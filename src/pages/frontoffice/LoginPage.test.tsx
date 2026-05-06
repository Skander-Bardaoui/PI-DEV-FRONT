// src/pages/frontoffice/LoginPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './LoginPage';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockLogin = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.login': 'Connexion',
        'auth.email': 'Email',
        'auth.password': 'Mot de passe',
        'auth.rememberMe': 'Se souvenir de moi',
        'auth.forgotPassword': 'Mot de passe oublié ?',
        'auth.loginButton': 'Se connecter',
        'auth.loading': 'Connexion...',
        'auth.noAccount': "Vous n'avez pas de compte ?",
        'auth.registerButton': "S'inscrire",
        'auth.continueWithGoogle': 'Continuer avec Google',
        'dashboard.welcome': 'Bienvenue sur votre espace',
        'common.or': 'Ou continuer avec',
        'errors.generic': 'Une erreur est survenue',
      };
      return translations[key] || key;
    },
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../components/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = (initialRoute = '/login') => {
  window.history.pushState({}, '', initialRoute);
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render login form', () => {
      renderWithRouter();

      expect(screen.getByText('Connexion')).toBeInTheDocument();
      expect(screen.getByText('Bienvenue sur votre espace')).toBeInTheDocument();
    });

    it('should render NovEntra logo', () => {
      renderWithRouter();

      expect(screen.getByText('NovEntra')).toBeInTheDocument();
    });

    it('should render language switcher', () => {
      renderWithRouter();

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderWithRouter();

      expect(screen.getByPlaceholderText('vous@exemple.com')).toBeInTheDocument();
    });

    it('should render password input field', () => {
      renderWithRouter();

      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('should render remember me checkbox', () => {
      renderWithRouter();

      expect(screen.getByText('Se souvenir de moi')).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderWithRouter();

      expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderWithRouter();

      expect(screen.getByText("S'inscrire")).toBeInTheDocument();
    });

    it('should render Google login button', () => {
      renderWithRouter();

      expect(screen.getByText('Continuer avec Google')).toBeInTheDocument();
    });
  });

  // ── Form Interaction Tests ──────────────────────────────────────────────────

  describe('Form Interactions', () => {
    it('should allow typing in email field', () => {
      renderWithRouter();

      const emailInput = screen.getByPlaceholderText('vous@exemple.com') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow typing in password field', () => {
      renderWithRouter();

      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should toggle password visibility', () => {
      renderWithRouter();

      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      const toggleButton = passwordInput.nextElementSibling as HTMLButtonElement;

      expect(passwordInput.type).toBe('password');

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    it('should toggle remember me checkbox', () => {
      renderWithRouter();

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });
  });

  // ── Form Submission Tests ───────────────────────────────────────────────────

  describe('Form Submission', () => {
    it('should call login function with correct credentials', async () => {
      mockLogin.mockResolvedValueOnce({});
      renderWithRouter();

      const emailInput = screen.getByPlaceholderText('vous@exemple.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state during submission', async () => {
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderWithRouter();

      const emailInput = screen.getByPlaceholderText('vous@exemple.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Connexion...')).toBeInTheDocument();
      });
    });

    it('should disable form during submission', async () => {
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderWithRouter();

      const emailInput = screen.getByPlaceholderText('vous@exemple.com') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Se connecter/i }) as HTMLButtonElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      });
    });
  });

  // ── Validation Tests ────────────────────────────────────────────────────────

  describe('Validation', () => {
    it('should show validation error for empty email', async () => {
      renderWithRouter();

      const emailInput = screen.getByPlaceholderText('vous@exemple.com');
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      fireEvent.blur(emailInput);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Erreurs de validation/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      renderWithRouter();

      const emailInput = screen.getByPlaceholderText('vous@exemple.com');

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const errorMessages = screen.queryAllByText(/email/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should show validation error for empty password', async () => {
      renderWithRouter();

      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      fireEvent.blur(passwordInput);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Erreurs de validation/i)).toBeInTheDocument();
      });
    });
  });

  // ── Error Handling Tests ────────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should display error message on login failure', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
      renderWithRouter();

      const emailInput = screen.getByPlaceholderText('vous@exemple.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should display generic error when no message provided', async () => {
      mockLogin.mockRejectedValueOnce(new Error());
      renderWithRouter();

      const emailInput = screen.getByPlaceholderText('vous@exemple.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
      });
    });
  });

  // ── Success Message Tests ───────────────────────────────────────────────────

  describe('Success Message', () => {
    it('should show success message when redirected from registration', () => {
      renderWithRouter('/login?registered=true');

      expect(
        screen.getByText(/Inscription réussie ! Veuillez vous connecter avec vos identifiants./)
      ).toBeInTheDocument();
    });

    it('should not show success message without query parameter', () => {
      renderWithRouter('/login');

      expect(
        screen.queryByText(/Inscription réussie/)
      ).not.toBeInTheDocument();
    });
  });

  // ── Navigation Tests ────────────────────────────────────────────────────────

  describe('Navigation', () => {
    it('should have link to forgot password page', () => {
      renderWithRouter();

      const forgotPasswordLink = screen.getByText('Mot de passe oublié ?');
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should have link to register page', () => {
      renderWithRouter();

      const registerLink = screen.getByText("S'inscrire");
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should have link to home page', () => {
      renderWithRouter();

      const homeLink = screen.getByText('NovEntra').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  // ── Google Login Tests ──────────────────────────────────────────────────────

  describe('Google Login', () => {
    it('should render Google login button', () => {
      renderWithRouter();

      const googleButton = screen.getByText('Continuer avec Google');
      expect(googleButton).toBeInTheDocument();
    });

    it('should redirect to Google OAuth on button click', () => {
      const originalLocation = window.location.href;
      delete (window as any).location;
      window.location = { href: originalLocation } as any;

      renderWithRouter();

      const googleButton = screen.getByText('Continuer avec Google');
      fireEvent.click(googleButton);

      expect(window.location.href).toContain('/auth/google');
    });
  });

  // ── Accessibility Tests ─────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithRouter();

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Mot de passe')).toBeInTheDocument();
    });

    it('should mark required fields', () => {
      renderWithRouter();

      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThan(0);
    });

    it('should have proper button roles', () => {
      renderWithRouter();

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // ── Responsive Design Tests ─────────────────────────────────────────────────

  describe('Responsive Design', () => {
    it('should have gradient background', () => {
      const { container } = renderWithRouter();

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('bg-gradient-to-br');
    });

    it('should have responsive layout classes', () => {
      const { container } = renderWithRouter();

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('min-h-screen', 'flex');
    });
  });
});
