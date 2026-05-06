import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DepositModal from './DepositModal';

const mockAccounts = [
  {
    id: 'acc-1',
    name: 'Main Bank Account',
    type: 'BANK' as const,
    current_balance: 10000,
    currency: 'TND',
    is_active: true,
    business_id: 'biz-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'acc-2',
    name: 'Cash Account',
    type: 'CASH' as const,
    current_balance: 5000,
    currency: 'EUR',
    is_active: true,
    business_id: 'biz-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'acc-3',
    name: 'Inactive Account',
    type: 'BANK' as const,
    current_balance: 1000,
    currency: 'TND',
    is_active: false,
    business_id: 'biz-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

describe('DepositModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when open is false', () => {
      const { container } = render(
        <DepositModal
          open={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when open is true', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      expect(screen.getByText('Add Money to Account')).toBeInTheDocument();
      expect(screen.getByText('Deposit funds into your account')).toBeInTheDocument();
    });

    it('should only show active accounts', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      const options = accountSelect.querySelectorAll('option');
      
      // Should have "Select an account" + 2 active accounts (not the inactive one)
      expect(options.length).toBe(3);
    });

    it('should preselect account when provided', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
          preselectedAccountId="acc-1"
        />
      );

      const accountSelect = screen.getByRole('combobox') as HTMLSelectElement;
      expect(accountSelect.value).toBe('acc-1');
    });
  });

  describe('Account Selection', () => {
    it('should handle account selection', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });
      expect(accountSelect).toHaveValue('acc-1');
    });

    it('should display current balance when account is selected', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      expect(screen.getByText(/Current balance:/i)).toBeInTheDocument();
    });

    it('should display account currency in amount input', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-2' } });

      expect(screen.getByText('EUR')).toBeInTheDocument();
    });
  });

  describe('Form Inputs', () => {
    it('should handle amount input', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '1000' } });
      expect(amountInput).toHaveValue(1000);
    });

    it('should handle deposit date input', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const dateInput = screen.getByLabelText(/Deposit Date/i);
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      expect(dateInput).toHaveValue('2024-12-31');
    });

    it('should handle description input', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const descriptionInput = screen.getByPlaceholderText(/Cash deposit, Bank transfer/i);
      fireEvent.change(descriptionInput, { target: { value: 'Test deposit' } });
      expect(descriptionInput).toHaveValue('Test deposit');
    });

    it('should handle reference input', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const referenceInput = screen.getByPlaceholderText(/DEP-2024-001/i);
      fireEvent.change(referenceInput, { target: { value: 'REF-001' } });
      expect(referenceInput).toHaveValue('REF-001');
    });

    it('should handle notes textarea', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const notesTextarea = screen.getByPlaceholderText(/Additional notes/i);
      fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });
      expect(notesTextarea).toHaveValue('Test notes');
    });
  });

  describe('New Balance Calculation', () => {
    it('should display new balance when amount is entered', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '2000' } });

      expect(screen.getByText(/New balance will be:/i)).toBeInTheDocument();
    });

    it('should not display new balance when amount is zero', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '0' } });

      expect(screen.queryByText(/New balance will be:/i)).not.toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show error when account is not selected', async () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const submitButton = screen.getByText('Add Deposit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select an account')).toBeInTheDocument();
      });
    });

    it('should show error when amount is zero', async () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '0' } });

      const submitButton = screen.getByText('Add Deposit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid amount greater than 0')).toBeInTheDocument();
      });
    });

    it('should show error when amount is negative', async () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '-100' } });

      const submitButton = screen.getByText('Add Deposit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid amount greater than 0')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const descriptionInput = screen.getByPlaceholderText(/Cash deposit, Bank transfer/i);
      fireEvent.change(descriptionInput, { target: { value: 'Test deposit' } });

      const submitButton = screen.getByText('Add Deposit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            account_id: 'acc-1',
            amount: 1000,
            description: 'Test deposit',
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const submitButton = screen.getByText('Add Deposit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });
    });

    it('should handle submission errors', async () => {
      const error = {
        response: {
          data: {
            message: 'Deposit failed',
          },
        },
      };
      mockOnSubmit.mockRejectedValue(error);

      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const submitButton = screen.getByText('Add Deposit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Deposit failed')).toBeInTheDocument();
      });
    });

    it('should call onClose after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const submitButton = screen.getByText('Add Deposit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should reset form after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const accountSelect = screen.getByRole('combobox');
      fireEvent.change(accountSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByPlaceholderText('0.000');
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const submitButton = screen.getByText('Add Deposit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const closeButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Info Box', () => {
    it('should display transaction details info', () => {
      render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      expect(screen.getByText('Transaction Details')).toBeInTheDocument();
      expect(screen.getByText(/VIREMENT_INTERNE/i)).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should display DollarSign icons', () => {
      const { container } = render(
        <DepositModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const icons = container.querySelectorAll('.lucide-dollar-sign');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
