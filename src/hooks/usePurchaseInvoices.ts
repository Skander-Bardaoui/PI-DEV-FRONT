// src/hooks/usePurchaseInvoices.ts
import { approvePurchaseInvoice, createPurchaseInvoice, disputePurchaseInvoice, getPurchaseInvoice, getPurchaseInvoices, resolveDisputePurchaseInvoice, updatePaymentAmount, updatePurchaseInvoice } from '@/api/purchase-invoices';
import { CreatePurchaseInvoiceDto, DisputeInvoiceDto, PurchaseInvoicesQueryParams, UpdatePaymentAmountDto, UpdatePurchaseInvoiceDto } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


export const PURCHASE_INVOICES_KEY = 'purchase-invoices';

export const usePurchaseInvoices = (
  businessId: string,
  params?: PurchaseInvoicesQueryParams,
) =>
  useQuery({
    queryKey: [PURCHASE_INVOICES_KEY, businessId, params],
    queryFn: () => getPurchaseInvoices(businessId, params),
    enabled:  !!businessId,
  });

export const usePurchaseInvoice = (businessId: string, id: string) =>
  useQuery({
    queryKey: [PURCHASE_INVOICES_KEY, businessId, id],
    queryFn:  () => getPurchaseInvoice(businessId, id),
    enabled:  !!businessId && !!id,
  });

export const useCreatePurchaseInvoice = (businessId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePurchaseInvoiceDto) =>
      createPurchaseInvoice(businessId, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [PURCHASE_INVOICES_KEY, businessId] }),
  });
};

export const useUpdatePurchaseInvoice = (businessId: string, id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePurchaseInvoiceDto) =>
      updatePurchaseInvoice(businessId, id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [PURCHASE_INVOICES_KEY, businessId] }),
  });
};

export const useApprovePurchaseInvoice = (businessId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvePurchaseInvoice(businessId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [PURCHASE_INVOICES_KEY, businessId] }),
  });
};

export const useDisputePurchaseInvoice = (businessId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DisputeInvoiceDto }) =>
      disputePurchaseInvoice(businessId, id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [PURCHASE_INVOICES_KEY, businessId] }),
  });
};

export const useResolveDispute = (businessId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveDisputePurchaseInvoice(businessId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [PURCHASE_INVOICES_KEY, businessId] }),
  });
};

export const useUpdatePayment = (businessId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePaymentAmountDto }) =>
      updatePaymentAmount(businessId, id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [PURCHASE_INVOICES_KEY, businessId] }),
  });
};