// src/components/sales/DeliveryNoteModal.tsx
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Trash2 } from 'lucide-react';
import { createDeliveryNoteSchema, DeliveryNoteFormValues } from '@/schemas/sales.schemas';
import { useCreateDeliveryNote, useUpdateDeliveryNote } from '@/hooks/useDeliveryNotes';
import { useClients } from '@/hooks/useClients';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { CreateDeliveryNoteItemDto } from '@/types/delivery-note';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ProductSelector from './ProductSelector';
import { Product } from '@/types/product';

// ── Composant Field avec erreur ───────────────────────────────────────────────
const Field = ({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-start gap-1.5 mt-1.5">
        <svg className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-red-600 text-xs font-medium">{error}</p>
      </div>
    )}
  </div>
);

const inputCls = (error?: string) =>
  `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm transition-colors ${
    error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
  }`;

const inputSmallCls = (error?: string) =>
  `w-full px-2 py-1 border rounded text-sm transition-colors ${
    error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
  }`;

interface Props {
  businessId: string;
  note?: any;
  onClose: () => void;
}

export default function DeliveryNoteModal({ businessId, note, onClose }: Props) {
  const create = useCreateDeliveryNote(businessId);
  const update = useUpdateDeliveryNote(businessId, note?.id || '');
  const { data: clientsData } = useClients(businessId, { limit: 100 });
  const { data: ordersData } = useSalesOrders(businessId, { limit: 100 });
  const [error, setError] = useState<string | null>(null);
  const [itemStocks, setItemStocks] = useState<{ [key: number]: { stock: number; isStockable: boolean } }>({});
  const [orderCreatedDate, setOrderCreatedDate] = useState<string | undefined>(undefined);

  const isEdit = !!note;

  // Track whether the order-items effect has already run once (create mode only)
  const orderItemsPopulated = useRef(false);

  // Deduplicate items helper
  const deduplicateItems = useCallback((items: any[]) => {
    return items.reduce((acc: any[], item: any) => {
      const existing = acc.find(
        (i: any) =>
          i.description?.trim().toLowerCase() === item.description?.trim().toLowerCase(),
      );
      if (existing) {
        // Keep the one with higher deliveredQuantity
        if (Number(item.deliveredQuantity) > Number(existing.deliveredQuantity)) {
          const index = acc.indexOf(existing);
          acc[index] = item;
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
  }, []);

  // Compute default values — stable, runs only once on mount
  const defaultValues = useMemo((): DeliveryNoteFormValues => {
    if (isEdit && note) {
      const uniqueItems = deduplicateItems(note.items ?? []);
      return {
        delivery_date: note.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        notes: note.notes || '',
        items: uniqueItems.map((item: any) => ({
          sales_order_item_id: item.salesOrderItemId ?? '',
          quantity_delivered: Number(item.deliveredQuantity),
        })),
      };
    }

    return {
      delivery_date: new Date().toISOString().split('T')[0],
      notes: '',
      items: [{ sales_order_item_id: '', quantity_delivered: 0 }],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only compute once on mount

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryNoteFormValues>({
    resolver: zodResolver(createDeliveryNoteSchema(orderCreatedDate)),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
    keyName: 'fieldId',
  });

  const watchedSalesOrderId = watch('salesOrderId' as any);
  const watchedItems = watch('items') || [];

  // ─── KEY FIX ────────────────────────────────────────────────────────────────
  // Only populate items from order in CREATE mode, and only once per order
  // selection (guarded by the ref). In EDIT mode this effect never runs.
  // Also set the order created date for validation
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Never auto-populate in edit mode
    if (isEdit) return;
    // Only run when we have an order selected and the orders data is loaded
    if (!watchedSalesOrderId || !ordersData?.data) return;
    // Don't run again if we already populated for this selection
    if (orderItemsPopulated.current) return;

    const selectedOrder = ordersData.data.find((o: any) => o.id === watchedSalesOrderId);
    if (selectedOrder) {
      // Set order created date for validation
      if (selectedOrder.createdAt) {
        setOrderCreatedDate(new Date(selectedOrder.createdAt).toISOString().split('T')[0]);
      }
      
      if (selectedOrder.items) {
        const orderItems = selectedOrder.items.map((item: any) => ({
          sales_order_item_id: item.id,
          quantity_delivered: Number(item.quantity),
        }));
        replace(orderItems);
        orderItemsPopulated.current = true;
      }
    }
  }, [watchedSalesOrderId, ordersData, isEdit, replace]);

  // Reset the guard when the user picks a different order (create mode)
  useEffect(() => {
    if (!isEdit) {
      orderItemsPopulated.current = false;
    }
  }, [watchedSalesOrderId, isEdit]);

  const handleProductSelect = (index: number, product: Product | null) => {
    if (product) {
      setItemStocks(prev => ({
        ...prev,
        [index]: { stock: product.current_stock || 0, isStockable: product.is_stockable }
      }));
    } else {
      setItemStocks(prev => {
        const newStocks = { ...prev };
        delete newStocks[index];
        return newStocks;
      });
    }
  };

  const getStockWarning = (index: number) => {
    const itemStock = itemStocks[index];
    if (!itemStock || !itemStock.isStockable) return null;
    
    const quantity = Number(watchedItems[index]?.quantity_delivered) || 0;
    if (quantity > itemStock.stock) {
      return `Stock insuffisant ! Disponible: ${itemStock.stock}`;
    }
    return null;
  };

  const onSubmit = async (values: DeliveryNoteFormValues) => {
    try {
      setError(null);
      
      // Validate stock for all items
      for (let i = 0; i < values.items.length; i++) {
        const warning = getStockWarning(i);
        if (warning) {
          setError(`Ligne ${i + 1}: ${warning}`);
          return;
        }
      }
      
      // Get the selected order to extract client and item details
      const selectedOrder = ordersData?.data?.find((o: any) => o.id === watchedSalesOrderId);
      if (!selectedOrder) {
        setError('Commande introuvable');
        return;
      }
      
      const items = values.items.map((item) => {
        const orderItem = selectedOrder.items?.find((oi: any) => oi.id === item.sales_order_item_id);
        return {
          description: orderItem?.description || '',
          quantity: Number(orderItem?.quantity) || 0,
          deliveredQuantity: Number(item.quantity_delivered) || 0,
          salesOrderItemId: item.sales_order_item_id,
          ...(orderItem?.productId ? { productId: orderItem.productId } : {}),
        };
      }) as CreateDeliveryNoteItemDto[];

      const payload = {
        clientId: selectedOrder.clientId,
        salesOrderId: watchedSalesOrderId,
        deliveryDate: values.delivery_date || undefined,
        notes: values.notes || undefined,
        items,
      };

      if (isEdit) {
        await update.mutateAsync(payload);
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      console.error('❌ Erreur bon de livraison:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Erreur lors de l'opération",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Modifier le bon de livraison' : 'Nouveau bon de livraison'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5" noValidate>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commande client <span className="text-red-500">*</span>
              </label>
              <select
                value={watchedSalesOrderId || ''}
                onChange={(e) => setValue('salesOrderId' as any, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                disabled={isEdit}
              >
                <option value="">Sélectionner une commande</option>
                {ordersData?.data?.map((order: any) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - {order.client?.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez une commande pour créer le bon de livraison
              </p>
            </div>

            <Field label="Date de livraison" error={errors.delivery_date?.message} required>
              <input
                type="date"
                {...register('delivery_date')}
                className={inputCls(errors.delivery_date?.message)}
              />
            </Field>
          </div>

          {/* Lignes */}
          {watchedSalesOrderId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-gray-900">Articles à livrer</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Modifiez les quantités livrées selon la livraison réelle
                  </p>
                </div>
              </div>

              {errors.items?.message && (
                <div className="text-red-600 text-sm mb-2 flex items-center gap-1.5">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.items.message}
                </div>
              )}

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                        Article
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-green-600 w-48 bg-green-50">
                        Quantité livrée *
                        <div className="text-[10px] font-normal text-gray-500 mt-0.5">
                          Modifiable
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fields.map((field, i) => {
                      const stockWarning = getStockWarning(i);
                      const hasError = errors.items?.[i];
                      const orderItem = ordersData?.data
                        ?.find((o: any) => o.id === watchedSalesOrderId)
                        ?.items?.find((item: any) => item.id === watchedItems[i]?.sales_order_item_id);
                      
                      return (
                      <tr key={field.fieldId} className={stockWarning || hasError ? 'bg-red-50' : ''}>
                        <td className="px-4 py-2">
                          <div className="text-sm font-medium text-gray-900">
                            {orderItem?.description || 'Article'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Qté commandée: {orderItem?.quantity || 0}
                          </div>
                          <input type="hidden" {...register(`items.${i}.sales_order_item_id`)} />
                        </td>
                        <td className="px-4 py-2 bg-green-50/30">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            {...register(`items.${i}.quantity_delivered`, { valueAsNumber: true })}
                            className={`w-full px-3 py-2 border-2 rounded text-sm text-center font-semibold focus:ring-2 ${
                              stockWarning || hasError?.quantity_delivered
                                ? 'border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-200' 
                                : 'border-green-300 text-green-700 focus:border-green-500 focus:ring-green-200'
                            }`}
                            placeholder="0.000"
                          />
                          {stockWarning && (
                            <div className="text-xs text-red-600 mt-1 font-semibold">{stockWarning}</div>
                          )}
                          {errors.items?.[i]?.quantity_delivered?.message && (
                            <p className="text-red-600 text-xs mt-1">{errors.items[i]?.quantity_delivered?.message}</p>
                          )}
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!watchedSalesOrderId && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              Veuillez sélectionner une commande client pour continuer
            </div>
          )}

          <Field label="Notes" error={errors.notes?.message}>
            <textarea
              {...register('notes')}
              rows={3}
              className={inputCls(errors.notes?.message)}
              placeholder="Notes additionnelles..."
            />
          </Field>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !watchedSalesOrderId}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting
                ? isEdit
                  ? 'Modification...'
                  : 'Création...'
                : isEdit
                  ? 'Modifier'
                  : 'Créer le bon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}