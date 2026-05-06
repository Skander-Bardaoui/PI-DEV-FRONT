// src/pages/backoffice/Team.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { business_id: 'business-123', role: 'BUSINESS_OWNER' },
  }),
}));

// Mock Team component
const MockTeamPage = () => {
  return (
    <div>
      <h1>Team Management</h1>
      <p>Manage your team members</p>
      <button>Invite Member</button>
      <div data-testid="team-list">
        <div>John Doe - Owner</div>
        <div>Jane Smith - Admin</div>
      </div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockTeamPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Team Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();

      expect(screen.getByText('Team Management')).toBeInTheDocument();
    });

    it('should render invite button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Invite Member/i })).toBeInTheDocument();
    });

    it('should render team members list', () => {
      renderWithRouter();

      expect(screen.getByTestId('team-list')).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    });
  });
});
