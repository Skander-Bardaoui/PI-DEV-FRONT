// src/components/purchases/GoodsReceiptModal.tsx
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { goodsReceiptSchema, GoodsReceiptFormValues } from '@/schemas/purchases.schemas';
import { useCreateGoodsReceipt } from '@/hooks/useGoodsReceipts';
import { CreateGoodsReceiptItemDto, SupplierPO } from '@/types';

interface Props {
  businessId: string;
  po:         SupplierPO;
  onClose:    () => void;
}

export default function GoodsReceiptModal({ businessId, po, onClose }: Props) {
  const create = useCreateGoodsReceipt(businessId, po.id);
  const items  = po.items ?? [];

  const pendingItems = useMemo(() =>
    items.filter(i => Number(i.quantity_received) < Number(i.quantity_ordered)),
    [items],
  );

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      receipt_date: new Date().toISOString().split('T')[0],
      notes:        '',
      items: pendingItems.map(item => ({
        supplier_po_item_id: item.id,
        quantity_received:   0,
      })),
    },
  });

  const onSubmit = async (values: GoodsReceiptFormValues) => {
    // FIX: filteredItems est casté explicitement en CreateGoodsReceiptItemDto[]
    // car Zod infère supplier_po_item_id et quantity_received comme optionnels
    // alors que CreateGoodsReceiptItemDto les exige comme requis.
    // Le filtre garantit que quantity_received > 0, et le schéma Zod garantit
    // que supplier_po_item_id est toujours présent (uuid non vide).
    const filteredItems = values.items
      .filter(i => Number(i.quantity_received) > 0)
      .map(i => ({
        supplier_po_item_id: i.supplier_po_item_id as string,
        quantity_received:   Number(i.quantity_received),
      })) satisfies CreateGoodsReceiptItemDto[];

    if (filteredItems.length === 0) return;

    await create.mutateAsync({
      receipt_date: values.receipt_date || undefined,
      notes:        values.notes        || undefined,
      items:        filteredItems,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            Nouveau Bon de Réception — {po.po_number}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-5">

          {errors.items?.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {errors.items.root.message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de réception <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('receipt_date')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm ${
                  errors.receipt_date ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.receipt_date && (
                <p className="text-red-500 text-xs mt-1">{errors.receipt_date.message}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Quantités reçues</h3>
            <p className="text-xs text-gray-500 mb-3">
              Saisissez 0 pour les lignes non reçues lors de cette réception.
            </p>

            {pendingItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4 italic">
                Toutes les lignes ont été entièrement réceptionnées.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500">Description</th>
                      <th className="text-center px-4 py-3 text-gray-500">Commandé</th>
                      <th className="text-center px-4 py-3 text-gray-500">Déjà reçu</th>
                      <th className="text-center px-4 py-3 text-gray-500">Reliquat</th>
                      <th className="text-center px-4 py-3 text-gray-500">
                        Reçu ce jour <span className="text-red-500">*</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingItems.map((item, i) => {
                      const reliquat = Number(item.quantity_ordered) - Number(item.quantity_received);
                      const qtyError = errors.items?.[i]?.quantity_received;
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-gray-900 font-medium">{item.description}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.quantity_ordered}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.quantity_received}</td>
                          <td className="px-4 py-3 text-center font-medium text-orange-600">
                            {reliquat.toFixed(3)}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              max={reliquat}
                              {...register(`items.${i}.quantity_received`)}
                              className={`w-full px-3 py-1.5 border rounded-lg text-center focus:ring-1 focus:ring-indigo-500 text-sm ${
                                qtyError ? 'border-red-400 bg-red-50' : 'border-gray-200'
                              }`}
                            />
                            {qtyError && (
                              <p className="text-red-500 text-xs mt-0.5">{qtyError.message}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              {...register('notes')}
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                errors.notes ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Observations sur la réception..."
            />
            {errors.notes && (
              <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || pendingItems.length === 0}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Valider la réception'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}