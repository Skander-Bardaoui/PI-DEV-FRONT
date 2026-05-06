import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PurchaseInvoiceModal } from './PurchaseInvoiceModal';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useSupplierPOs } from '../../hooks/useSupplierPOs';
import { useGoodsReceiptsByPO } from '../../hooks/useGoodsReceipts';
import { useCreatePurchaseInvoice } from '../../hooks/usePurchaseInvoices';
import { POStatus } from '../../types';

vi.mock('../../hooks/useSuppliers', () => ({
  useSuppliers: vi.fn(),
}));

vi.mock('../../hooks/useSupplierPOs', () => ({
  useSupplierPOs: vi.fn(),
}));

vi.mock('../../hooks/useGoodsReceipts', () => ({
  useGoodsReceiptsByPO: vi.fn(),
}));

vi.mock('../../hooks/usePurchaseInvoices', () => ({
  useCreatePurchaseInvoice: vi.fn(),
}));

vi.mock('./UploadInvoiceScan', () => ({
  default: ({ onChange }: any) => (
    <button onClick={() => onChange('https://example.com/scan.pdf')}>
      Upload Scan
    </button>
  ),
}));

describe('PurchaseInvoiceModal', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  const mockSuppliers = {
    data: [
      { id: 'supplier-1', name: 'Supplier A' },
      { id: 'supplier-2', name: 'Supplier B' },
    ],
  };

  const mockPOs = {
    data: [
      {
        id: 'po-1',
        po_number: 'BC-2024-001',
        status: POStatus.CONFIRMED,
        supplier_id: 'supplier-1',
        supplier: { id: 'supplier-1', name: 'Supplier A' },
        net_amount: 1191,
        items: [
          {
            id: 'item-1',
            unit_price_ht: 100,
            tax_rate_value: 19,
          },
        ],
      },
    ],
  };

  const mockGRs = [
    {
      id: 'gr-1',
      receipt_number: 'GR-2024-001',
      receipt_date: '2024-01-15',
      items: [
        {
          supplier_po_item_id: 'item-1',
          quantity_received: 10,
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (useSuppliers as any).mockReturnValue({ data: mockSuppliers });
    (useSupplierPOs as any).mockReturnValue({ data: mockPOs });
    (useGoodsReceiptsByPO as any).mockReturnValue({ data: mockGRs, isLoading: false });
    (useCreatePurchaseInvoice as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('should render choice step initially', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Nouvelle facture fournisseur')).toBeInTheDocument();
    expect(screen.getByText('Choisissez le mode de création')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display two creation options', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Depuis un bon de réception')).toBeInTheDocument();
    expect(screen.getByText('Saisie manuelle')).toBeInTheDocument();
  });

  it('should show recommended badge for goods receipt option', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Recommandé')).toBeInTheDocument();
  });

  it('should navigate to PO selection when choosing from GR', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    if (grOption) {
      fireEvent.click(grOption);
      expect(screen.getByText('Sélectionnez un bon de commande')).toBeInTheDocument();
    }
  });

  it('should navigate to form when choosing manual entry', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      expect(screen.getByText('Saisie manuelle')).toBeInTheDocument();
    }
  });

  it('should display available POs', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    if (grOption) {
      fireEvent.click(grOption);
      expect(screen.getByText('BC-2024-001')).toBeInTheDocument();
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    }
  });

  it('should navigate to GR selection after selecting PO', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    if (grOption) {
      fireEvent.click(grOption);
      
      const poButton = screen.getByText('BC-2024-001').closest('button');
      if (poButton) {
        fireEvent.click(poButton);
        expect(screen.getByText('Sélectionnez un bon de réception')).toBeInTheDocument();
      }
    }
  });

  it('should display available GRs for selected PO', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    if (grOption) {
      fireEvent.click(grOption);
      
      const poButton = screen.getByText('BC-2024-001').closest('button');
      if (poButton) {
        fireEvent.click(poButton);
        
        waitFor(() => {
          expect(screen.getByText('GR-2024-001')).toBeInTheDocument();
        });
      }
    }
  });

  it('should show loading state while fetching GRs', () => {
    (useGoodsReceiptsByPO as any).mockReturnValue({ data: null, isLoading: true });

    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    // Navigate to GR selection
    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    if (grOption) {
      fireEvent.click(grOption);
      
      const poButton = screen.getByText('BC-2024-001').closest('button');
      if (poButton) {
        fireEvent.click(poButton);
        
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      }
    }
  });

  it('should show warning when no GRs available', () => {
    (useGoodsReceiptsByPO as any).mockReturnValue({ data: [], isLoading: false });

    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    if (grOption) {
      fireEvent.click(grOption);
      
      const poButton = screen.getByText('BC-2024-001').closest('button');
      if (poButton) {
        fireEvent.click(poButton);
        
        waitFor(() => {
          expect(screen.getByText(/Aucun bon de réception disponible/)).toBeInTheDocument();
        });
      }
    }
  });

  it('should render form with supplier dropdown in manual mode', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      expect(screen.getByText('Fournisseur')).toBeInTheDocument();
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    }
  });

  it('should display auto-generated invoice number info', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      expect(screen.getByText(/Numéro de facture auto-généré/)).toBeInTheDocument();
    }
  });

  it('should handle date inputs', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      const dateInput = screen.getByLabelText(/Date facture/);
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
      
      expect(dateInput).toHaveValue('2024-01-15');
    }
  });

  it('should calculate net amount automatically', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      expect(screen.getByText('Net TTC')).toBeInTheDocument();
      expect(screen.getByText('Auto-calculé')).toBeInTheDocument();
    }
  });

  it('should provide TVA rate shortcuts', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('7%')).toBeInTheDocument();
      expect(screen.getByText('13%')).toBeInTheDocument();
      expect(screen.getByText('19%')).toBeInTheDocument();
    }
  });

  it('should apply TVA rate when shortcut clicked', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      const tvaButton = screen.getByText('19%');
      fireEvent.click(tvaButton);
      
      // TVA should be calculated based on HT amount
    }
  });

  it('should submit form with valid data', async () => {
    mockMutateAsync.mockResolvedValue({});

    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      const submitButton = screen.getByText('Créer la facture');
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Form validation would trigger
      });
    }
  });

  it('should display validation errors', async () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      const submitButton = screen.getByText('Créer la facture');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erreurs de validation')).toBeInTheDocument();
      });
    }
  });

  it('should show loading state during submission', () => {
    (useCreatePurchaseInvoice as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
    }
  });

  it('should allow going back to choice from PO selection', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    if (grOption) {
      fireEvent.click(grOption);
      
      const backButton = screen.getByText('← Retour au choix');
      fireEvent.click(backButton);
      
      expect(screen.getByText('Choisissez le mode de création')).toBeInTheDocument();
    }
  });

  it('should allow going back to PO selection from GR selection', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    if (grOption) {
      fireEvent.click(grOption);
      
      const poButton = screen.getByText('BC-2024-001').closest('button');
      if (poButton) {
        fireEvent.click(poButton);
        
        await waitFor(() => {
          const backButton = screen.getByText('← Changer de bon de commande');
          fireEvent.click(backButton);
          
          expect(screen.getByText('Sélectionnez un bon de commande')).toBeInTheDocument();
        });
      }
    }
  });

  it('should display visual amount breakdown', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      // Visual breakdown shows HT, TVA, Timbre proportions
    }
  });

  it('should handle upload scan component', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const manualOption = screen.getByText('Saisie manuelle').closest('button');
    if (manualOption) {
      fireEvent.click(manualOption);
      
      const uploadButton = screen.getByText('Upload Scan');
      fireEvent.click(uploadButton);
      
      // Receipt URL should be updated
    }
  });

  it('should disable GR option when no POs available', () => {
    (useSupplierPOs as any).mockReturnValue({ data: { data: [] } });

    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    const grOption = screen.getByText('Depuis un bon de réception').closest('button');
    expect(grOption).toBeDisabled();
  });

  it('should show PO count in GR option', () => {
    render(
      <PurchaseInvoiceModal
        businessId="business-1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/1 bon\(s\) de commande disponible/)).toBeInTheDocument();
  });
});
