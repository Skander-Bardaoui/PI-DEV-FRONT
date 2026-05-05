import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSalesInvoices } from './useSalesInvoices';
import * as salesInvoicesApi from '../api/sales-invoices';

// Mock de l'API
vi.mock('../api/sales-invoices');

describe('useSalesInvoices', () => {
  const businessId = 'business-123';

  const mockInvoices = [
    {
      id: 'invoice-1',
      invoice_number: 'FAC-2026-0001',
      client_id: 'client-1',
      date: '2026-01-01',
      due_date: '2026-01-31',
      subtotal_ht: 1000,
      tax_amount: 190,
      net_amount: 1191,
      paid_amount: 0,
      status: 'DRAFT',
      type: 'NORMAL',
    },
    {
      id: 'invoice-2',
      invoice_number: 'FAC-2026-0002',
      client_id: 'client-2',
      date: '2026-01-02',
      due_date: '2026-02-01',
      subtotal_ht: 2000,
      tax_amount: 380,
      net_amount: 2381,
      paid_amount: 0,
      status: 'SENT',
      type: 'NORMAL',
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

      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.invoices).toEqual(mockInvoices);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch invoices');
      vi.mocked(salesInvoicesApi.getInvoices).mockRejectedValue(mockError);

      const { result } = renderHook(() => useSalesInvoices(businessId));

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

      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSalesInvoices(businessId, { status: 'DRAFT' }));

      await waitFor(() => {
        expect(result.current.invoices).toHaveLength(1);
        expect(result.current.invoices[0].status).toBe('DRAFT');
      });

      expect(salesInvoicesApi.getInvoices).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({ status: 'DRAFT' })
      );
    });

    it('should filter by client', async () => {
      const mockResponse = {
        data: [mockInvoices[0]],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSalesInvoices(businessId, { client_id: 'client-1' }));

      await waitFor(() => {
        expect(result.current.invoices).toHaveLength(1);
      });

      expect(salesInvoicesApi.getInvoices).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({ client_id: 'client-1' })
      );
    });

    it('should search by term', async () => {
      const mockResponse = {
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSalesInvoices(businessId, { search: 'FAC-2026' }));

      await waitFor(() => {
        expect(result.current.invoices).toHaveLength(2);
      });

      expect(salesInvoicesApi.getInvoices).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({ search: 'FAC-2026' })
      );
    });
  });

  describe('createInvoice', () => {
    it('should create invoice successfully', async () => {
      const newInvoice = {
        client_id: 'client-1',
        date: '2026-01-01',
        due_date: '2026-01-31',
        items: [
          {
            description: 'Product 1',
            quantity: 10,
            unit_price: 100,
            tax_rate_value: 19,
          },
        ],
      };

      vi.mocked(salesInvoicesApi.createInvoice).mockResolvedValue(mockInvoices[0]);
      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.createInvoice(newInvoice);

      expect(salesInvoicesApi.createInvoice).toHaveBeenCalledWith(businessId, newInvoice);
      
      await waitFor(() => {
        expect(result.current.invoices).toHaveLength(2);
      });
    });

    it('should handle create error', async () => {
      const newInvoice = {
        client_id: 'client-1',
        date: '2026-01-01',
        items: [],
      };

      const mockError = new Error('Failed to create invoice');
      vi.mocked(salesInvoicesApi.createInvoice).mockRejectedValue(mockError);

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await expect(result.current.createInvoice(newInvoice)).rejects.toThrow('Failed to create invoice');
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice successfully', async () => {
      const updateData = {
        notes: 'Updated notes',
      };

      const updatedInvoice = { ...mockInvoices[0], ...updateData };
      vi.mocked(salesInvoicesApi.updateInvoice).mockResolvedValue(updatedInvoice);
      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.updateInvoice('invoice-1', updateData);

      expect(salesInvoicesApi.updateInvoice).toHaveBeenCalledWith(
        businessId,
        'invoice-1',
        updateData
      );
    });
  });

  describe('sendInvoice', () => {
    it('should send invoice successfully', async () => {
      const sentInvoice = { ...mockInvoices[0], status: 'SENT' };
      vi.mocked(salesInvoicesApi.sendInvoice).mockResolvedValue(sentInvoice);
      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.sendInvoice('invoice-1');

      expect(salesInvoicesApi.sendInvoice).toHaveBeenCalledWith(businessId, 'invoice-1');
    });
  });

  describe('sendInvoiceByEmail', () => {
    it('should send invoice by email successfully', async () => {
      const emailData = {
        email: 'client@test.com',
        subject: 'Your Invoice',
        body: 'Please find attached...',
      };

      const sentInvoice = { ...mockInvoices[0], status: 'SENT' };
      vi.mocked(salesInvoicesApi.sendInvoiceByEmail).mockResolvedValue(sentInvoice);
      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.sendInvoiceByEmail('invoice-1', emailData);

      expect(salesInvoicesApi.sendInvoiceByEmail).toHaveBeenCalledWith(
        businessId,
        'invoice-1',
        emailData
      );
    });
  });

  describe('generateEmailDraft', () => {
    it('should generate email draft successfully', async () => {
      const mockDraft = {
        subject: 'Facture FAC-2026-0001',
        body: 'Bonjour...',
      };

      vi.mocked(salesInvoicesApi.generateEmailDraft).mockResolvedValue(mockDraft);

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const draft = await result.current.generateEmailDraft('invoice-1', 'fr', false);

      expect(draft).toEqual(mockDraft);
      expect(salesInvoicesApi.generateEmailDraft).toHaveBeenCalledWith(
        businessId,
        'invoice-1',
        'fr',
        false
      );
    });
  });

  describe('sendPaymentReminder', () => {
    it('should send payment reminder successfully', async () => {
      vi.mocked(salesInvoicesApi.sendPaymentReminder).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.sendPaymentReminder('invoice-1', 'client@test.com');

      expect(salesInvoicesApi.sendPaymentReminder).toHaveBeenCalledWith(
        businessId,
        'invoice-1',
        'client@test.com'
      );
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid successfully', async () => {
      const paidInvoice = { ...mockInvoices[0], status: 'PAID' };
      vi.mocked(salesInvoicesApi.markPaid).mockResolvedValue(paidInvoice);
      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.markPaid('invoice-1');

      expect(salesInvoicesApi.markPaid).toHaveBeenCalledWith(businessId, 'invoice-1');
    });
  });

  describe('cancelInvoice', () => {
    it('should cancel invoice successfully', async () => {
      const cancelledInvoice = { ...mockInvoices[0], status: 'CANCELLED' };
      vi.mocked(salesInvoicesApi.cancelInvoice).mockResolvedValue(cancelledInvoice);
      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.cancelInvoice('invoice-1');

      expect(salesInvoicesApi.cancelInvoice).toHaveBeenCalledWith(businessId, 'invoice-1');
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      vi.mocked(salesInvoicesApi.deleteInvoice).mockResolvedValue(undefined);
      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue({
        data: [mockInvoices[1]],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      });

      const { result } = renderHook(() => useSalesInvoices(businessId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteInvoice('invoice-1');

      expect(salesInvoicesApi.deleteInvoice).toHaveBeenCalledWith(businessId, 'invoice-1');
      
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

      vi.mocked(salesInvoicesApi.getInvoices).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSalesInvoices(businessId, { page: 2, limit: 20 }));

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
