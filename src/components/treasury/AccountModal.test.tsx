import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountModal from './AccountModal';

const mockAccount = {
  id: 'acc-1',
  name: 'Main Bank Account',
  type: 'BANK' as const,
  bank_name: 'Banque Zitouna',
  rib: '12345678901234567890123',
  opening_balance: 10000,
  current_balance: 15000,
  currency: 'TND',
  is_default: true,
  is_active: true,
  business_id: 'biz-1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('AccountModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when open is false', () => {
      const { container } = render(
        <AccountModal
          open={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render create mode correctly', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('New Account')).toBeInTheDocument();
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });

    it('should render edit mode correctly', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          account={mockAccount}
        />
      );

      expect(screen.getByText('Edit Account')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('should populate form fields in edit mode', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          account={mockAccount}
        />
      );

      expect(screen.getByDisplayValue('Main Bank Account')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Banque Zitouna')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12345678901234567890123')).toBeInTheDocument();
    });
  });

  describe('Account Type Selection', () => {
    it('should render BANK and CASH type buttons', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Bank Account')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });

    it('should select BANK by default', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const bankButton = screen.getByText('Bank Account').closest('button');
      expect(bankButton).toHaveClass('border-indigo-500');
    });

    it('should switch to CASH type when clicked', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cashButton = screen.getByText('Cash').closest('button');
      if (cashButton) {
        fireEvent.click(cashButton);
        expect(cashButton).toHaveClass('border-indigo-500');
      }
    });

    it('should hide bank fields when CASH is selected', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cashButton = screen.getByText('Cash').closest('button');
      if (cashButton) {
        fireEvent.click(cashButton);
      }

      expect(screen.queryByLabelText(/Bank Name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/RIB/i)).not.toBeInTheDocument();
    });

    it('should show bank fields when BANK is selected', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/Bank Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/RIB/i)).toBeInTheDocument();
    });
  });

  describe('Form Inputs', () => {
    it('should handle account name input', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/Main Bank Account/i);
      fireEvent.change(nameInput, { target: { value: 'Test Account' } });
      expect(nameInput).toHaveValue('Test Account');
    });

    it('should handle bank name input', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const bankNameInput = screen.getByPlaceholderText(/Banque Zitouna/i);
      fireEvent.change(bankNameInput, { target: { value: 'Test Bank' } });
      expect(bankNameInput).toHaveValue('Test Bank');
    });

    it('should handle RIB input with maxLength', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const ribInput = screen.getByPlaceholderText(/Bank account number/i);
      expect(ribInput).toHaveAttribute('maxLength', '23');
    });

    it('should handle opening balance in create mode', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const balanceInput = screen.getByLabelText(/Opening Balance/i);
      fireEvent.change(balanceInput, { target: { value: '5000' } });
      expect(balanceInput).toHaveValue(5000);
    });

    it('should handle current balance in edit mode', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          account={mockAccount}
        />
      );

      const balanceInput = screen.getByLabelText(/Current Balance/i);
      fireEvent.change(balanceInput, { target: { value: '20000' } });
      expect(balanceInput).toHaveValue(20000);
    });

    it('should handle currency selection', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const currencySelect = screen.getByRole('combobox', { name: /Currency/i });
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });
      expect(currencySelect).toHaveValue('EUR');
    });

    it('should handle default checkbox', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const defaultCheckbox = screen.getByRole('checkbox', { name: /Set as default account/i });
      expect(defaultCheckbox).not.toBeChecked();

      fireEvent.click(defaultCheckbox);
      expect(defaultCheckbox).toBeChecked();
    });
  });

  describe('Form Validation', () => {
    it('should show error when account name is empty', async () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Create Account');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Account name is required')).toBeInTheDocument();
      });
    });

    it('should show error when bank name is empty for BANK type', async () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/Main Bank Account/i);
      fireEvent.change(nameInput, { target: { value: 'Test Account' } });

      const submitButton = screen.getByText('Create Account');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Bank name is required for bank accounts')).toBeInTheDocument();
      });
    });

    it('should show error for negative opening balance', async () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/Main Bank Account/i);
      fireEvent.change(nameInput, { target: { value: 'Test Account' } });

      const balanceInput = screen.getByLabelText(/Opening Balance/i);
      fireEvent.change(balanceInput, { target: { value: '-100' } });

      const submitButton = screen.getByText('Create Account');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Balance cannot be negative')).toBeInTheDocument();
      });
    });

    it('should show error for negative current balance in edit mode', async () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          account={mockAccount}
        />
      );

      const balanceInput = screen.getByLabelText(/Current Balance/i);
      fireEvent.change(balanceInput, { target: { value: '-100' } });

      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Balance cannot be negative')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data in create mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/Main Bank Account/i);
      fireEvent.change(nameInput, { target: { value: 'Test Account' } });

      const bankNameInput = screen.getByPlaceholderText(/Banque Zitouna/i);
      fireEvent.change(bankNameInput, { target: { value: 'Test Bank' } });

      const balanceInput = screen.getByLabelText(/Opening Balance/i);
      fireEvent.change(balanceInput, { target: { value: '5000' } });

      const submitButton = screen.getByText('Create Account');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Account',
            type: 'BANK',
            bank_name: 'Test Bank',
            opening_balance: 5000,
            currency: 'TND',
            is_default: false,
          })
        );
      });
    });

    it('should call onSubmit with current_balance in edit mode', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          account={mockAccount}
        />
      );

      const balanceInput = screen.getByLabelText(/Current Balance/i);
      fireEvent.change(balanceInput, { target: { value: '20000' } });

      const submitButton = screen.getByText('Save Changes');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            current_balance: 20000,
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/Main Bank Account/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const bankNameInput = screen.getByPlaceholderText(/Banque Zitouna/i);
      fireEvent.change(bankNameInput, { target: { value: 'Test Bank' } });

      const submitButton = screen.getByText('Create Account');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });

    it('should call onClose after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/Main Bank Account/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const bankNameInput = screen.getByPlaceholderText(/Banque Zitouna/i);
      fireEvent.change(bankNameInput, { target: { value: 'Test Bank' } });

      const submitButton = screen.getByText('Create Account');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
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
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const backdrop = container.querySelector('.bg-black\\/40');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Icon Display', () => {
    it('should show Building2 icon for BANK type', () => {
      const { container } = render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const icon = container.querySelector('.lucide-building-2');
      expect(icon).toBeInTheDocument();
    });

    it('should show Wallet icon for CASH type', () => {
      const { container } = render(
        <AccountModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cashButton = screen.getByText('Cash').closest('button');
      if (cashButton) {
        fireEvent.click(cashButton);
      }

      const icon = container.querySelector('.lucide-wallet');
      expect(icon).toBeInTheDocument();
    });
  });
});
