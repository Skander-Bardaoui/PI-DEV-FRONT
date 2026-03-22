// src/components/sales/DeliveryNoteModal.tsx
import { useFieldArray, useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { useCreateDeliveryNote, useUpdateDeliveryNote } from '@/hooks/useDeliveryNotes';
import { useClients } from '@/hooks/useClients';
import { CreateDeliveryNoteItemDto } from '@/types/delivery-note';
import { useState } from 'react';

interface DeliveryNoteFormValues {
  clientId: string;
  deliveryDate?: string;
  notes?: string;
  items: {
    productId?: string;
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
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!note;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryNoteFormValues>({
    defaultValues: isEdit ? {
      clientId: note.clientId || '',
      deliveryDate: note.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      notes: note.notes || '',
      items: note.items?.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        deliveredQuantity: item.deliveredQuantity || item.quantity,
        productId: item.productId,
      })) || [{ description: '', quantity: 1, deliveredQuantity: 1 }],
    } : {
      clientId: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      notes: '',
      items: [{ description: '', quantity: 1, deliveredQuantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = async (values: DeliveryNoteFormValues) => {
    try {
      setError(null);
      const items = values.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity) || 0,
        deliveredQuantity: Number(item.deliveredQuantity) || 0,
        ...(item.productId ? { productId: item.productId } : {}),
      })) as CreateDeliveryNoteItemDto[];

      const payload = {
        clientId: values.clientId,
        deliveryDate: values.deliveryDate || undefined,
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
      console.error('Error with delivery note:', err);
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
                Client <span className="text-red-500">*</span>
              </label>
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
            </div>
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
              <span className="font-medium text-gray-900">Articles livrés</span>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, deliveredQuantity: 1 })}
                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="h-4 w-4" /> Ajouter
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description *</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-28">Qté commandée *</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-28">Qté livrée *</th>
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
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${i}.quantity`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${i}.deliveredQuantity`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {fields.length > 1 && (
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
