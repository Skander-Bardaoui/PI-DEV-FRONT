// src/hooks/useGoodsReceipts.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateGoodsReceiptDto } from '@/types';
import { createGoodsReceipt, getGoodsReceipt, getGoodsReceiptsByPO } from '@/api/goods-receipts';

// FIX: import des fonctions directement depuis le fichier API
// Avant : goodsReceipts.findAllByPO() et goodsReceiptsApi.create() n'existaient pas
// Après : on importe les fonctions nommées exactement comme elles sont exportées

// Validation UUID v4 stricte — évite les requêtes avec "undefined" ou ""
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (v: string | undefined | null): v is string =>
  !!v && UUID_REGEX.test(v);

// ─── Clés de cache ─────────────────────────────────────────────────────────────
export const grKeys = {
  byPO: (businessId: string, poId: string) => ['goods-receipts', businessId, poId] as const,
  one:  (businessId: string, id: string)   => ['goods-receipt',  businessId, id]   as const,
};

// ─── Récupérer les BRs d'un BC ─────────────────────────────────────────────────
export function useGoodsReceiptsByPO(businessId: string, poId: string) {
  return useQuery({
    queryKey: grKeys.byPO(businessId, poId),
    queryFn:  () => getGoodsReceiptsByPO(businessId, poId), // FIX: était goodsReceipts.findAllByPO
    enabled:  isValidUUID(businessId) && isValidUUID(poId),
    staleTime: 30_000,
  });
}

// ─── Récupérer un BR par ID ──────────────────────────────────────────────────
export function useGoodsReceipt(businessId: string, id: string) {
  return useQuery({
    queryKey: grKeys.one(businessId, id),
    queryFn:  () => getGoodsReceipt(businessId, id), // FIX: était goodsReceiptsApi.findOne
    enabled:  isValidUUID(businessId) && isValidUUID(id),
    staleTime: 60_000,
  });
}

// ─── Créer un BR ─────────────────────────────────────────────────────────────
export function useCreateGoodsReceipt(businessId: string, poId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGoodsReceiptDto) =>
      createGoodsReceipt(businessId, poId, dto), // FIX: était goodsReceiptsApi.create
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: grKeys.byPO(businessId, poId) });
      qc.invalidateQueries({ queryKey: ['supplier-pos', businessId] });
      qc.invalidateQueries({ queryKey: ['supplier-po', businessId, poId] });
    },
  });
}