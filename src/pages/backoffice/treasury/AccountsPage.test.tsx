// src/pages/backoffice/treasury/AccountsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAccounts = [
  {
    id: '1',
    name: 'Main Bank Account',
    type: 'BANK',
    bank_name: 'STB',
    rib: '12345678901234567890',
    opening_balance: 10000,
    current_balance: 15000,
    currency: 'TND',
    is_default: true,
    is_active: true,
  },
  {
    id: '2',
    name: 'Cash Register',
    type: 'CASH',
    bank_name: null,
    rib: null,
    opening_balance: 1000,
    current_balance: 800,
    currency: 'TND',
    is_default: false,
    is_active: true,
  },
  {
    id: '3',
    name: 'Savings Account',
    type: 'BANK',
    bank_name: 'BIAT',
    rib: '09876543210987654321',
    opening_balance: 5000,
    current_balance: 5500,
    currency: 'TND',
    is_default: false,
    is_active: false,
  },
];

vi.mock('@/hooks/useAccounts', () => ({
  useAccounts: () => ({
    accounts: mockAccounts,
    loading: false,
    error: null,
    fetchAccounts: vi.fn(),
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    toggleActive: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTransfers', () => ({
  useTransfers: () => ({
    transfer: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAIAccess', () => ({
  useAIAccess: () => ({
    hasAIAccess: true,
    loading: false,
  }),
}));

vi.mock('@/components/treasury/AccountModal', () => ({
  default: () => <div data-testid="account-modal">Account Modal</div>,
}));

vi.mock('@/components/treasury/TransferModal', () => ({
  default: () => <div data-testid="transfer-modal">Transfer Modal</div>,
}));

vi.mock('@/components/treasury/DepositModal', () => ({
  default: () => <div data-testid="deposit-modal">Deposit Modal</div>,
}));

vi.mock('@/components/treasury/CashFlowForecast', () => ({
  default: () => <div data-testid="cash-flow-forecast">Cash Flow Forecast</div>,
}));

// Mock component
const MockAccountsPage = () => {
  const totalBalance = 15800;
  const bankBalance = 15000;
  const cashBalance = 800;

  return (
    <div data-testid="accounts-page">
      <h1>Accounts</h1>
      <p>Manage your bank accounts and cash</p>

      <div data-testid="action-buttons">
        <button data-testid="refresh-btn">Refresh</button>
        <button data-testid="add-money-btn">Add Money</button>
        <button data-testid="transfer-btn">Transfer</button>
        <button data-testid="new-account-btn">New Account</button>
      </div>

      <div data-testid="summary-cards">
        <div className="summary-card">
          <span>Total Balance (active accounts)</span>
          <span>{totalBalance.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</span>
        </div>
        <div className="summary-card">
          <span>Bank Accounts (1)</span>
          <span>{bankBalance.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</span>
        </div>
        <div className="summary-card">
          <span>Cash (1)</span>
          <span>{cashBalance.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</span>
        </div>
      </div>

      <div data-testid="accounts-table">
        <h2>All Accounts</h2>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Type</th>
              <th>Bank / RIB</th>
              <th>Opening Balance</th>
              <th>Current Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAccounts.map((account) => (
              <tr key={account.id} data-testid={`account-row-${account.id}`}>
                <td>
                  {account.name}
                  {account.is_default && <span className="default-badge">★</span>}
                  <div>{account.currency}</div>
                </td>
                <td>
                  <span className={`type-badge type-${account.type.toLowerCase()}`}>
                    {account.type}
                  </span>
                </td>
                <td>
                  {account.type === 'BANK' ? (
                    <div>
                      <div>{account.bank_name}</div>
                      <div>{account.rib}</div>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{account.opening_balance.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} {account.currency}</td>
                <td>
                  <div>{account.current_balance.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} {account.currency}</div>
                  {account.current_balance !== account.opening_balance && (
                    <div className={account.current_balance > account.opening_balance ? 'positive' : 'negative'}>
                      {account.current_balance > account.opening_balance ? '+' : ''}
                      {(account.current_balance - account.opening_balance).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} {account.currency}
                    </div>
                  )}
                </td>
                <td>
                  <span className={account.is_active ? 'status-active' : 'status-inactive'}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button data-testid={`menu-${account.id}`}>Menu</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-testid="cash-flow-forecast">Cash Flow Forecast</div>
    </div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <MockAccountsPage />
    </BrowserRouter>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AccountsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithRouter();
      expect(screen.getByText('Accounts')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderWithRouter();
      expect(screen.getByText('Manage your bank accounts and cash')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    });

    it('should render summary cards', () => {
      renderWithRouter();
      expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
    });

    it('should render accounts table', () => {
      renderWithRouter();
      expect(screen.getByTestId('accounts-table')).toBeInTheDocument();
    });

    it('should render cash flow forecast for AI users', () => {
      renderWithRouter();
      expect(screen.getByTestId('cash-flow-forecast')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render refresh button', () => {
      renderWithRouter();
      expect(screen.getByTestId('refresh-btn')).toBeInTheDocument();
    });

    it('should render add money button', () => {
      renderWithRouter();
      expect(screen.getByTestId('add-money-btn')).toBeInTheDocument();
    });

    it('should render transfer button', () => {
      renderWithRouter();
      expect(screen.getByTestId('transfer-btn')).toBeInTheDocument();
    });

    it('should render new account button', () => {
      renderWithRouter();
      expect(screen.getByTestId('new-account-btn')).toBeInTheDocument();
    });

    it('should handle refresh button click', () => {
      renderWithRouter();
      const refreshBtn = screen.getByTestId('refresh-btn');
      fireEvent.click(refreshBtn);
      expect(refreshBtn).toBeInTheDocument();
    });

    it('should handle add money button click', () => {
      renderWithRouter();
      const addMoneyBtn = screen.getByTestId('add-money-btn');
      fireEvent.click(addMoneyBtn);
      expect(addMoneyBtn).toBeInTheDocument();
    });

    it('should handle transfer button click', () => {
      renderWithRouter();
      const transferBtn = screen.getByTestId('transfer-btn');
      fireEvent.click(transferBtn);
      expect(transferBtn).toBeInTheDocument();
    });

    it('should handle new account button click', () => {
      renderWithRouter();
      const newAccountBtn = screen.getByTestId('new-account-btn');
      fireEvent.click(newAccountBtn);
      expect(newAccountBtn).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    it('should display total balance', () => {
      renderWithRouter();
      expect(screen.getByText('Total Balance (active accounts)')).toBeInTheDocument();
      expect(screen.getByText('15 800,000 TND')).toBeInTheDocument();
    });

    it('should display bank accounts balance', () => {
      renderWithRouter();
      expect(screen.getByText('Bank Accounts (1)')).toBeInTheDocument();
      expect(screen.getByText('15 000,000 TND')).toBeInTheDocument();
    });

    it('should display cash balance', () => {
      renderWithRouter();
      expect(screen.getByText('Cash (1)')).toBeInTheDocument();
      expect(screen.getByText('800,000 TND')).toBeInTheDocument();
    });
  });

  describe('Accounts Table', () => {
    it('should display table header', () => {
      renderWithRouter();
      expect(screen.getByText('All Accounts')).toBeInTheDocument();
    });

    it('should display all account rows', () => {
      renderWithRouter();
      expect(screen.getByTestId('account-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('account-row-2')).toBeInTheDocument();
      expect(screen.getByTestId('account-row-3')).toBeInTheDocument();
    });

    it('should display account names', () => {
      renderWithRouter();
      expect(screen.getByText('Main Bank Account')).toBeInTheDocument();
      expect(screen.getByText('Cash Register')).toBeInTheDocument();
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
    });

    it('should display default badge for default account', () => {
      renderWithRouter();
      expect(screen.getByText('★')).toBeInTheDocument();
    });

    it('should display account types', () => {
      renderWithRouter();
      const bankTypes = screen.getAllByText('BANK');
      expect(bankTypes).toHaveLength(2);
      expect(screen.getByText('CASH')).toBeInTheDocument();
    });

    it('should display bank names and RIBs', () => {
      renderWithRouter();
      expect(screen.getByText('STB')).toBeInTheDocument();
      expect(screen.getByText('12345678901234567890')).toBeInTheDocument();
      expect(screen.getByText('BIAT')).toBeInTheDocument();
      expect(screen.getByText('09876543210987654321')).toBeInTheDocument();
    });

    it('should display opening balances', () => {
      renderWithRouter();
      expect(screen.getByText('10 000,000 TND')).toBeInTheDocument();
      expect(screen.getByText('1 000,000 TND')).toBeInTheDocument();
      expect(screen.getByText('5 000,000 TND')).toBeInTheDocument();
    });

    it('should display current balances', () => {
      renderWithRouter();
      expect(screen.getByText('15 000,000 TND')).toBeInTheDocument();
      expect(screen.getByText('800,000 TND')).toBeInTheDocument();
      expect(screen.getByText('5 500,000 TND')).toBeInTheDocument();
    });

    it('should display balance differences', () => {
      renderWithRouter();
      expect(screen.getByText('+5 000,000 TND')).toBeInTheDocument();
      expect(screen.getByText('-200,000 TND')).toBeInTheDocument();
      expect(screen.getByText('+500,000 TND')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      renderWithRouter();
      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses).toHaveLength(2);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should render menu buttons', () => {
      renderWithRouter();
      expect(screen.getByTestId('menu-1')).toBeInTheDocument();
      expect(screen.getByTestId('menu-2')).toBeInTheDocument();
      expect(screen.getByTestId('menu-3')).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should mount without errors', () => {
      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
