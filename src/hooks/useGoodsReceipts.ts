// src/hooks/useGoodsReceipts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SUPPLIER_POS_KEY } from '@/hooks/useSupplierPOs';
import { createGoodsReceipt, getGoodsReceipt, getGoodsReceiptsByPO } from '@/api/goods-receipts';
import { CreateGoodsReceiptDto } from '@/types';

export const GOODS_RECEIPTS_KEY = 'goods-receipts';

export const useGoodsReceiptsByPO = (businessId: string, poId: string) =>
  useQuery({
    queryKey: [GOODS_RECEIPTS_KEY, businessId, poId],
    queryFn:  () => getGoodsReceiptsByPO(businessId, poId),
    enabled:  !!businessId && !!poId,
  });

export const useGoodsReceipt = (businessId: string, id: string) =>
  useQuery({
    queryKey: [GOODS_RECEIPTS_KEY, businessId, id],
    queryFn:  () => getGoodsReceipt(businessId, id),
    enabled:  !!businessId && !!id,
  });

export const useCreateGoodsReceipt = (businessId: string, poId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGoodsReceiptDto) =>
      createGoodsReceipt(businessId, poId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GOODS_RECEIPTS_KEY, businessId, poId] });
      // Rafraîchir aussi le BC car son statut a changé
      qc.invalidateQueries({ queryKey: [SUPPLIER_POS_KEY, businessId] });
    },
  });
};