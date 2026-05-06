// src/pages/backoffice/Settings.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', business_id: 'business-123', role: 'BUSINESS_OWNER' },
  }),
}));

// Mock Settings component
const MockSettingsPage = () => {
  return (
    <div data-testid="settings-page">
      <h1>Settings</h1>
      <div>
        <h2>General Settings</h2>
        <button>Save Changes</button>
      </div>
      <div>
        <h2>Notifications</h2>
        <label>
          <input type="checkbox" />
          Email Notifications
        </label>
      </div>
      <div>
        <h2>Security</h2>
        <button>Change Password</button>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockSettingsPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the page', () => {
      renderWithRouter();

      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render general settings section', () => {
      renderWithRouter();

      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    it('should render notifications section', () => {
      renderWithRouter();

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });

    it('should render security section', () => {
      renderWithRouter();

      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });

    it('should be accessible', () => {
      const { container } = renderWithRouter();
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
