// src/components/sales/DeliveryNoteModal.tsx
import { useFieldArray, useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { useCreateDeliveryNote, useUpdateDeliveryNote } from '@/hooks/useDeliveryNotes';
import { useClients } from '@/hooks/useClients';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { CreateDeliveryNoteItemDto } from '@/types/delivery-note';
import { useState, useEffect, useCallback } from 'react';

interface DeliveryNoteFormValues {
  clientId: string;
  salesOrderId?: string;
  deliveryDate?: string;
  notes?: string;
  items: {
    productId?: string;
    salesOrderItemId?: string;
    description: string;
    quantity: number;
    deliveredQuantity: number;
  }[];
}

interface Props {
  businessId: string;
  note?: any;
  onClose: () => void;
}

export default function DeliveryNoteModal({ businessId, note, onClose }: Props) {
  const create = useCreateDeliveryNote(businessId);
  const update = useUpdateDeliveryNote(businessId, note?.id || '');
  const { data: clientsData } = useClients(businessId, { limit: 100 });
  // Ne pas charger les commandes en mode édition pour éviter l'erreur
  const { data: ordersData } = useSalesOrders(businessId, { limit: 100 });
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!note;

  // Préparer les valeurs par défaut
  const getDefaultValues = useCallback(() => {
    if (isEdit && note) {
      console.log('📝 Mode édition - Note reçue:', note);
      console.log('📝 Items de la note:', note.items);
      
      return {
        clientId: note.clientId || '',
        salesOrderId: note.salesOrderId || '',
        deliveryDate: note.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        notes: note.notes || '',
        items: note.items?.map((item: any) => {
          console.log('📝 Mapping item:', item);
          return {
            description: item.description,
            quantity: Number(item.quantity),
            deliveredQuantity: Number(item.deliveredQuantity),
            productId: item.productId,
            salesOrderItemId: item.salesOrderItemId,
          };
        }) || [{ description: '', quantity: 1, deliveredQuantity: 1 }],
      };
    }
    
    return {
      clientId: '',
      salesOrderId: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      notes: '',
      items: [{ description: '', quantity: 1, deliveredQuantity: 1 }],
    };
  }, [isEdit, note]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryNoteFormValues>({
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'items' });
  
  // Log le nombre de champs au montage
  useEffect(() => {
    console.log('🎯 Nombre de champs au montage:', fields.length);
    console.log('🎯 Champs:', fields);
  }, []);
  
  const watchedSalesOrderId = watch('salesOrderId');
  
  // Réinitialiser le formulaire quand la note change (mode édition uniquement)
  // DÉSACTIVÉ - On utilise la clé du composant pour forcer la recréation
  /*
  useEffect(() => {
    if (isEdit && note?.id) {
      console.log('🔄 Réinitialisation du formulaire pour note:', note.id);
      const values = getDefaultValues();
      console.log('🔄 Nouvelles valeurs:', values);
      reset(values);
    }
  }, [note?.id, isEdit, reset, getDefaultValues]);
  */
  
  // When sales order changes, populate items from the order (only in create mode)
  useEffect(() => {
    if (watchedSalesOrderId && !isEdit) {
      const selectedOrder = ordersData?.data?.find((o: any) => o.id === watchedSalesOrderId);
      if (selectedOrder?.items) {
        const orderItems = selectedOrder.items.map((item: any) => ({
          salesOrderItemId: item.id,
          productId: item.productId,
          description: item.description,
          quantity: Number(item.quantity),
          deliveredQuantity: Number(item.quantity), // Default to full quantity
        }));
        replace(orderItems);
        setValue('clientId', selectedOrder.clientId);
      }
    }
  }, [watchedSalesOrderId, ordersData, isEdit, replace, setValue]);
  
  // Debug: Watch form values
  const watchedItems = watch('items');
  useEffect(() => {
    if (isEdit) {
      console.log('📝 Nombre de lignes dans le formulaire:', fields.length);
      console.log('📝 Valeurs du formulaire (items):', watchedItems);
    }
  }, [watchedItems, fields.length, isEdit]);

  const onSubmit = async (values: DeliveryNoteFormValues) => {
    try {
      setError(null);
      
      console.log('📦 Soumission bon de livraison:', values);
      
      const items = values.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity) || 0,
        deliveredQuantity: Number(item.deliveredQuantity) || 0,
        ...(item.productId ? { productId: item.productId } : {}),
        ...(item.salesOrderItemId ? { salesOrderItemId: item.salesOrderItemId } : {}),
      })) as CreateDeliveryNoteItemDto[];

      console.log('📦 Items transformés:', items);

      const payload = {
        clientId: values.clientId,
        salesOrderId: values.salesOrderId || undefined,
        deliveryDate: values.deliveryDate || undefined,
        notes: values.notes || undefined,
        items,
      };

      console.log('📦 Payload final:', payload);

      if (isEdit) {
        await update.mutateAsync(payload);
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      console.error('❌ Erreur bon de livraison:', err);
      setError(err?.response?.data?.message || err?.message || 'Erreur lors de l\'opération');
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
                Commande client
              </label>
              <select
                {...register('salesOrderId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                disabled={isEdit}
              >
                <option value="">Sélectionner une commande (optionnel)</option>
                {ordersData?.data?.map((order: any) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - {order.client?.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez une commande pour lier automatiquement les articles
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              {(watchedSalesOrderId || isEdit) ? (
                <>
                  {/* Champ caché pour envoyer la valeur */}
                  <input type="hidden" {...register('clientId', { required: 'Client requis' })} />
                  {/* Champ visuel désactivé */}
                  <select
                    value={watch('clientId')}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                  >
                    <option value="">Sélectionner un client</option>
                    {clientsData?.clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Le client ne peut pas être modifié
                  </p>
                </>
              ) : (
                <>
                  <select
                    {...register('clientId', { required: 'Client requis' })}
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                      errors.clientId ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner un client</option>
                    {clientsData?.clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de livraison
              </label>
              <input
                type="date"
                {...register('deliveryDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Lignes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-medium text-gray-900">Articles livrés</span>
                {watchedSalesOrderId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Articles liés à la commande - Modifiez les quantités livrées selon la livraison réelle
                  </p>
                )}
              </div>
              {!watchedSalesOrderId && (
                <button
                  type="button"
                  onClick={() => append({ description: '', quantity: 1, deliveredQuantity: 1 })}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="h-4 w-4" /> Ajouter
                </button>
              )}
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description *</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-32">Qté commandée</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-green-600 w-32 bg-green-50">
                      Qté livrée * 
                      <div className="text-[10px] font-normal text-gray-500 mt-0.5">Modifiable</div>
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fields.map((field, i) => (
                    <tr key={field.id}>
                      <td className="px-4 py-2">
                        <input
                          {...register(`items.${i}.description`, { required: true })}
                          placeholder="Description de l'article"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          disabled={!!watchedSalesOrderId && !isEdit}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          {...register(`items.${i}.quantity`, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center bg-gray-50"
                          disabled={!!watchedSalesOrderId && !isEdit}
                          readOnly={!!watchedSalesOrderId && !isEdit}
                        />
                      </td>
                      <td className="px-4 py-2 bg-green-50/30">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          {...register(`items.${i}.deliveredQuantity`, { 
                            valueAsNumber: true,
                            required: 'Quantité livrée requise'
                          })}
                          className="w-full px-2 py-1.5 border-2 border-green-300 rounded text-sm text-center font-semibold text-green-700 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                          placeholder="0.000"
                        />
                        {errors.items?.[i]?.deliveredQuantity && (
                          <p className="text-red-500 text-[10px] mt-0.5">Requis</p>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {fields.length > 1 && !watchedSalesOrderId && (
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="Notes additionnelles..."
            />
          </div>

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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (isEdit ? 'Modification...' : 'Création...') : (isEdit ? 'Modifier' : 'Créer le bon')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
