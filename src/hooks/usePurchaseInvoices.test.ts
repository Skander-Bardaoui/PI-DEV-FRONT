import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePurchaseInvoices } from './usePurchaseInvoices';
import * as purchaseInvoicesApi from '../api/purchase-invoices';

// Mock de l'API
vi.mock('../api/purchase-invoices');

describe('usePurchaseInvoices', () => {
  const businessId = 'business-123';

  const mockInvoices = [
    {
      id: 'invoice-1',
      invoice_number: 'FACT-2026-0001',
      supplier_id: 'supplier-1',
      invoice_date: '2026-01-01',
      due_date: '2026-01-31',
      subtotal_ht: 1000,
      tax_amount: 190,
      net_amount: 1191,
      paid_amount: 0,
      status: 'PENDING',
    },
    {
      id: 'invoice-2',
      invoice_number: 'FACT-2026-0002',
      supplier_id: 'supplier-2',
      invoice_date: '2026-01-02',
      due_date: '2026-02-01',
      subtotal_ht: 2000,
      tax_amount: 380,
      net_amount: 2381,
      paid_amount: 0,
      status: 'APPROVED',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchInvoices', () => {
    it('should fetch invoices successfully', async () => {
      const mockResponse = {
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseInvoices(businessId));

      await waitFor(() => {
        expect(result.current.invoices).toEqual(mockInvoices);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch invoices');
      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePurchaseInvoices(businessId));

      await waitFor(() => {
        expect(result.current.invoices).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to fetch invoices');
      });
    });

    it('should filter by status', async () => {
      const mockResponse = {
        data: [mockInvoices[0]],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseInvoices(businessId, { status: 'PENDING' }));

      await waitFor(() => {
        expect(result.current.invoices).toHaveLength(1);
        expect(result.current.invoices[0].status).toBe('PENDING');
      });

      expect(purchaseInvoicesApi.getPurchaseInvoices).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({ status: 'PENDING' })
      );
    });

    it('should filter by supplier', async () => {
      const mockResponse = {
        data: [mockInvoices[0]],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseInvoices(businessId, { supplier_id: 'supplier-1' }));

      await waitFor(() => {
        expect(result.current.invoices).toHaveLength(1);
      });

      expect(purchaseInvoicesApi.getPurchaseInvoices).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({ supplier_id: 'supplier-1' })
      );
    });
  });

  describe('createInvoice', () => {
    it('should create invoice successfully', async () => {
      const newInvoice = {
        supplier_id: 'supplier-1',
        invoice_number_supplier: 'SUPP-001',
        invoice_date: '2026-01-01',
        subtotal_ht: 1000,
        tax_amount: 190,
        items: [],
      };

      vi.mocked(purchaseInvoicesApi.createPurchaseInvoice).mockResolvedValue(mockInvoices[0]);
      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => usePurchaseInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.createInvoice(newInvoice);

      expect(purchaseInvoicesApi.createPurchaseInvoice).toHaveBeenCalledWith(businessId, newInvoice);
      
      await waitFor(() => {
        expect(result.current.invoices).toHaveLength(2);
      });
    });

    it('should handle create error', async () => {
      const newInvoice = {
        supplier_id: 'supplier-1',
        invoice_number_supplier: 'SUPP-001',
        invoice_date: '2026-01-01',
        subtotal_ht: 1000,
        tax_amount: 190,
        items: [],
      };

      const mockError = new Error('Failed to create invoice');
      vi.mocked(purchaseInvoicesApi.createPurchaseInvoice).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePurchaseInvoices(businessId));

      await expect(result.current.createInvoice(newInvoice)).rejects.toThrow('Failed to create invoice');
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice successfully', async () => {
      const updateData = {
        subtotal_ht: 1200,
        tax_amount: 228,
      };

      const updatedInvoice = { ...mockInvoices[0], ...updateData };
      vi.mocked(purchaseInvoicesApi.updatePurchaseInvoice).mockResolvedValue(updatedInvoice);
      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => usePurchaseInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.updateInvoice('invoice-1', updateData);

      expect(purchaseInvoicesApi.updatePurchaseInvoice).toHaveBeenCalledWith(
        businessId,
        'invoice-1',
        updateData
      );
    });
  });

  describe('approveInvoice', () => {
    it('should approve invoice successfully', async () => {
      const approvedInvoice = { ...mockInvoices[0], status: 'APPROVED' };
      vi.mocked(purchaseInvoicesApi.approvePurchaseInvoice).mockResolvedValue(approvedInvoice);
      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => usePurchaseInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.approveInvoice('invoice-1');

      expect(purchaseInvoicesApi.approvePurchaseInvoice).toHaveBeenCalledWith(businessId, 'invoice-1');
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      vi.mocked(purchaseInvoicesApi.deletePurchaseInvoice).mockResolvedValue(undefined);
      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue({
        data: [mockInvoices[1]],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => usePurchaseInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteInvoice('invoice-1');

      expect(purchaseInvoicesApi.deletePurchaseInvoice).toHaveBeenCalledWith(businessId, 'invoice-1');
      
      await waitFor(() => {
        expect(result.current.invoices).toHaveLength(1);
      });
    });
  });

  describe('pagination', () => {
    it('should handle pagination', async () => {
      const mockResponse = {
        data: mockInvoices,
        total: 50,
        page: 2,
        limit: 20,
        total_pages: 3,
      };

      vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseInvoices(businessId, { page: 2, limit: 20 }));

      await waitFor(() => {
        expect(result.current.pagination).toEqual({
          total: 50,
          page: 2,
          limit: 20,
          total_pages: 3,
        });
      });
    });
  });
});
