import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransferModal from './TransferModal';

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
    currency: 'TND',
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

describe('TransferModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when open is false', () => {
      const { container } = render(
        <TransferModal
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
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      expect(screen.getByText('New Transfer')).toBeInTheDocument();
    });

    it('should only show active accounts', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      const options = fromSelect.querySelectorAll('option');
      
      // Should have "Select account" + 2 active accounts (not the inactive one)
      expect(options.length).toBe(3);
    });

    it('should preselect from account when provided', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
          preselectedFromId="acc-1"
        />
      );

      const fromSelect = screen.getByLabelText(/From/i) as HTMLSelectElement;
      expect(fromSelect.value).toBe('acc-1');
    });
  });

  describe('Account Selection', () => {
    it('should handle from account selection', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });
      expect(fromSelect).toHaveValue('acc-1');
    });

    it('should handle to account selection', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const toSelect = screen.getByLabelText(/To \*/i);
      fireEvent.change(toSelect, { target: { value: 'acc-2' } });
      expect(toSelect).toHaveValue('acc-2');
    });

    it('should display from account balance when selected', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
    });

    it('should disable selected from account in to dropdown', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const toSelect = screen.getByLabelText(/To \*/i);
      const option = Array.from(toSelect.querySelectorAll('option')).find(
        opt => (opt as HTMLOptionElement).value === 'acc-1'
      ) as HTMLOptionElement;

      expect(option?.disabled).toBe(true);
    });
  });

  describe('Form Inputs', () => {
    it('should handle amount input', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '1000' } });
      expect(amountInput).toHaveValue(1000);
    });

    it('should handle transfer date input', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const dateInput = screen.getByLabelText(/Transfer Date/i);
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      expect(dateInput).toHaveValue('2024-12-31');
    });

    it('should handle reference input', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const referenceInput = screen.getByPlaceholderText(/VIR-2024-001/i);
      fireEvent.change(referenceInput, { target: { value: 'TEST-REF' } });
      expect(referenceInput).toHaveValue('TEST-REF');
    });

    it('should handle notes textarea', () => {
      render(
        <TransferModal
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

  describe('Validation', () => {
    it('should show error when from account is not selected', async () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Source account is required')).toBeInTheDocument();
      });
    });

    it('should show error when to account is not selected', async () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Destination account is required')).toBeInTheDocument();
      });
    });

    it('should show error when from and to accounts are the same', async () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const toSelect = screen.getByLabelText(/To \*/i);
      fireEvent.change(toSelect, { target: { value: 'acc-1' } });

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Source and destination must be different')).toBeInTheDocument();
      });
    });

    it('should show error when amount is zero or negative', async () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const toSelect = screen.getByLabelText(/To \*/i);
      fireEvent.change(toSelect, { target: { value: 'acc-2' } });

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '0' } });

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
      });
    });

    it('should show error when amount exceeds balance', async () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const toSelect = screen.getByLabelText(/To \*/i);
      fireEvent.change(toSelect, { target: { value: 'acc-2' } });

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '20000' } });

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
      });
    });
  });

  describe('Insufficient Balance Warning', () => {
    it('should show warning when amount exceeds balance', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '20000' } });

      expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
    });

    it('should not show warning when amount is within balance', () => {
      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '5000' } });

      const warnings = screen.queryAllByText(/Insufficient balance/i);
      expect(warnings.length).toBe(0);
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const toSelect = screen.getByLabelText(/To \*/i);
      fireEvent.change(toSelect, { target: { value: 'acc-2' } });

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            from_account_id: 'acc-1',
            to_account_id: 'acc-2',
            amount: 1000,
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const toSelect = screen.getByLabelText(/To \*/i);
      fireEvent.change(toSelect, { target: { value: 'acc-2' } });

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });
    });

    it('should handle submission errors', async () => {
      const error = {
        response: {
          data: {
            message: 'Transfer failed',
          },
        },
      };
      mockOnSubmit.mockRejectedValue(error);

      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const toSelect = screen.getByLabelText(/To \*/i);
      fireEvent.change(toSelect, { target: { value: 'acc-2' } });

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Transfer failed')).toBeInTheDocument();
      });
    });

    it('should call onClose after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const fromSelect = screen.getByLabelText(/From/i);
      fireEvent.change(fromSelect, { target: { value: 'acc-1' } });

      const toSelect = screen.getByLabelText(/To \*/i);
      fireEvent.change(toSelect, { target: { value: 'acc-2' } });

      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '1000' } });

      const submitButton = screen.getByText('Confirm Transfer');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <TransferModal
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
        <TransferModal
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

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <TransferModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          accounts={mockAccounts}
        />
      );

      const backdrop = container.querySelector('.bg-black\\/40');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });
});
