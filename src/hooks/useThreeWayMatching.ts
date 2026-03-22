// src/hooks/useThreeWayMatching.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';

export type MatchStatus =
  | 'MATCHED' | 'PARTIAL_MATCH' | 'MISMATCH'
  | 'MISSING_PO' | 'MISSING_GR' | 'OVER_INVOICED' | 'UNDER_INVOICED';

export interface LineDiscrepancy {
  description:        string;
  po_quantity:        number;
  received_quantity:  number;
  invoiced_quantity:  number;
  po_unit_price:      number;
  po_line_total:      number;
  received_total:     number;
  discrepancy_amount: number;
  discrepancy_pct:    number;
  status:             'OK' | 'PRICE_MISMATCH' | 'QTY_MISMATCH' | 'NOT_RECEIVED' | 'OVER_INVOICED';
}

export interface MatchResult {
  invoice_id:           string;
  invoice_number:       string;
  supplier_name:        string;
  status:               MatchStatus;
  can_auto_approve:     boolean;
  should_auto_dispute:  boolean;
  po_total:             number;
  received_total:       number;
  invoiced_total:       number;
  total_discrepancy:    number;
  discrepancy_pct:      number;
  line_discrepancies:   LineDiscrepancy[];
  issues:               string[];
  recommendations:      string[];
  po_number:            string | null;
  gr_numbers:           string[];
  matching_date:        string;
}

const base = (bId: string) => `/businesses/${bId}/three-way-matching`;

// Rapprochement d'une facture spécifique
export function useInvoiceMatch(businessId: string, invoiceId: string) {
  return useQuery({
    queryKey: ['three-way-match', businessId, invoiceId],
    queryFn:  () => axiosInstance
      .get(`${base(businessId)}/invoice/${invoiceId}`)
      .then(r => r.data as MatchResult),
    enabled: !!businessId && !!invoiceId,
    staleTime: 30_000,
  });
}

// Rapprochement de toutes les factures PENDING
export function useAllPendingMatches(businessId: string) {
  return useQuery({
    queryKey: ['three-way-match-all', businessId],
    queryFn:  () => axiosInstance
      .get(`${base(businessId)}/pending`)
      .then(r => r.data as MatchResult[]),
    enabled:  !!businessId,
    staleTime: 60_000,
  });
}

// Appliquer l'action automatique sur une facture
export function useApplyMatch(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => axiosInstance
      .post(`${base(businessId)}/invoice/${invoiceId}/apply`)
      .then(r => r.data as MatchResult),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-invoices', businessId] });
      qc.invalidateQueries({ queryKey: ['three-way-match-all', businessId] });
    },
  });
}