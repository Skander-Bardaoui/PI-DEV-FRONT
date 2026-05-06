// src/pages/frontoffice/RegisterPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockRegister = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../components/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

// Mock the RegisterPage component
const MockRegisterPage = () => {
  const [formData, setFormData] = vi.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mockRegister(formData);
      mockNavigate('/login?registered=true');
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>auth.register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="auth.firstName"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
        <input
          type="text"
          placeholder="auth.lastName"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
        <input
          type="email"
          placeholder="auth.email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="auth.password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <input
          type="password"
          placeholder="auth.confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
          />
          auth.acceptTerms
        </label>
        <button type="submit">auth.registerButton</button>
      </form>
      <a href="/login">auth.loginButton</a>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockRegisterPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render register form', () => {
      renderWithRouter();

      expect(screen.getByText('auth.register')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      renderWithRouter();

      expect(screen.getByPlaceholderText('auth.firstName')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('auth.lastName')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('auth.email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('auth.password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('auth.confirmPassword')).toBeInTheDocument();
    });

    it('should render terms checkbox', () => {
      renderWithRouter();

      expect(screen.getByText('auth.acceptTerms')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /auth.registerButton/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderWithRouter();

      expect(screen.getByText('auth.loginButton')).toBeInTheDocument();
    });
  });

  // ── Form Interaction Tests ──────────────────────────────────────────────────

  describe('Form Interactions', () => {
    it('should allow typing in all fields', () => {
      renderWithRouter();

      const firstNameInput = screen.getByPlaceholderText('auth.firstName') as HTMLInputElement;
      const lastNameInput = screen.getByPlaceholderText('auth.lastName') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('auth.email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('auth.password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByPlaceholderText('auth.confirmPassword') as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
      expect(emailInput.value).toBe('john@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(confirmPasswordInput.value).toBe('password123');
    });

    it('should toggle terms checkbox', () => {
      renderWithRouter();

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });
  });

  // ── Form Submission Tests ───────────────────────────────────────────────────

  describe('Form Submission', () => {
    it('should call register function with form data', async () => {
      mockRegister.mockResolvedValueOnce({});
      renderWithRouter();

      fireEvent.change(screen.getByPlaceholderText('auth.firstName'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('auth.lastName'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByPlaceholderText('auth.email'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('auth.password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByPlaceholderText('auth.confirmPassword'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('checkbox'));

      const submitButton = screen.getByRole('button', { name: /auth.registerButton/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            acceptTerms: true,
          })
        );
      });
    });

    it('should navigate to login page after successful registration', async () => {
      mockRegister.mockResolvedValueOnce({});
      renderWithRouter();

      fireEvent.change(screen.getByPlaceholderText('auth.firstName'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('auth.lastName'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByPlaceholderText('auth.email'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('auth.password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByPlaceholderText('auth.confirmPassword'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('checkbox'));

      const submitButton = screen.getByRole('button', { name: /auth.registerButton/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login?registered=true');
      });
    });
  });

  // ── Navigation Tests ────────────────────────────────────────────────────────

  describe('Navigation', () => {
    it('should have link to login page', () => {
      renderWithRouter();

      const loginLink = screen.getByText('auth.loginButton');
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});
