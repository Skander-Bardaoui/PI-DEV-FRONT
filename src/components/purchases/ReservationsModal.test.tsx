import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReservationsModal from './ReservationsModal';
import { productReservationsApi } from '../../api/product-reservations.api';
import { createSupplierPO } from '../../api/supplier-pos';
import { toast } from 'sonner';

vi.mock('../../api/product-reservations.api');
vi.mock('../../api/supplier-pos');
vi.mock('sonner');

describe('ReservationsModal', () => {
  const mockOnClose = vi.fn();

  const mockReservations = [
    {
      id: 'res-1',
      name: 'Product A',
      sku: 'SKU-001',
      reserved_quantity: 50,
      current_quantity: 10,
      min_quantity: 20,
      cost: 10,
      price: 15,
      unit: 'pcs',
      reserved_supplier_id: 'sup-1',
      reserved_supplier_name: 'Supplier A',
      default_supplier_id: null,
      supplier_name: null,
    },
    {
      id: 'res-2',
      name: 'Product B',
      sku: 'SKU-002',
      reserved_quantity: 30,
      current_quantity: 5,
      min_quantity: 15,
      cost: 20,
      price: 25,
      unit: 'kg',
      reserved_supplier_id: null,
      reserved_supplier_name: null,
      default_supplier_id: 'sup-2',
      supplier_name: 'Supplier B',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (productReservationsApi.getAll as any).mockResolvedValue(mockReservations);
  });

  it('should render reservations modal', async () => {
    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Réservations de Produits')).toBeInTheDocument();
      expect(screen.getByText('2 produit(s) réservé(s)')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (productReservationsApi.getAll as any).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should display reservation details', async () => {
    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('SKU-001')).toBeInTheDocument();
      expect(screen.getByText('50 pcs')).toBeInTheDocument();
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    });
  });

  it('should show default supplier when no reserved supplier', async () => {
    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Product B')).toBeInTheDocument();
      expect(screen.getByText('Supplier B')).toBeInTheDocument();
      expect(screen.getByText('Fournisseur par défaut:')).toBeInTheDocument();
    });
  });

  it('should accept reservation and create PO', async () => {
    (createSupplierPO as any).mockResolvedValue({ id: 'po-1' });
    (productReservationsApi.clear as any).mockResolvedValue({});

    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByText('Accepter');
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(createSupplierPO).toHaveBeenCalledWith('biz-1', expect.objectContaining({
        supplier_id: 'sup-1',
        items: expect.arrayContaining([
          expect.objectContaining({
            product_id: 'res-1',
            description: 'Product A',
            quantity_ordered: 50,
          }),
        ]),
      }));
      expect(productReservationsApi.clear).toHaveBeenCalledWith('biz-1', 'res-1');
      expect(toast.success).toHaveBeenCalledWith('Bon de commande créé avec succès');
    });
  });

  it('should show warning when no supplier assigned', async () => {
    const reservationWithoutSupplier = {
      ...mockReservations[0],
      reserved_supplier_id: null,
      default_supplier_id: null,
    };

    (productReservationsApi.getAll as any).mockResolvedValue([reservationWithoutSupplier]);

    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('⚠️ Aucun fournisseur assigné pour ce produit')).toBeInTheDocument();
    });
  });

  it('should disable accept button when no supplier', async () => {
    const reservationWithoutSupplier = {
      ...mockReservations[0],
      reserved_supplier_id: null,
      default_supplier_id: null,
    };

    (productReservationsApi.getAll as any).mockResolvedValue([reservationWithoutSupplier]);

    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      const acceptButton = screen.getByText('Accepter');
      expect(acceptButton).toBeDisabled();
    });
  });

  it('should handle API error when accepting reservation', async () => {
    (createSupplierPO as any).mockRejectedValue({
      response: { data: { message: 'Failed to create PO' } },
    });

    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByText('Accepter');
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create PO');
    });
  });

  it('should show empty state when no reservations', async () => {
    (productReservationsApi.getAll as any).mockResolvedValue([]);

    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Aucune réservation en attente')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Réservations de Produits')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Fermer');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should calculate total correctly', async () => {
    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('500.000 DT')).toBeInTheDocument(); // 50 * 10
      expect(screen.getByText('600.000 DT')).toBeInTheDocument(); // 30 * 20
    });
  });

  it('should show loading state on accept button', async () => {
    (createSupplierPO as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ReservationsModal businessId="biz-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByText('Accepter');
    fireEvent.click(acceptButtons[0]);

    expect(screen.getByText('Création...')).toBeInTheDocument();
  });
});
