// src/components/purchases/GoodsReceiptModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateGoodsReceipt } from '../../hooks/useGoodsReceipts';
import { CreateGoodsReceiptDto, CreateGoodsReceiptItemDto, SupplierPO } from '@/types';

interface Props {
  businessId: string;
  po:         SupplierPO;
  onClose:    () => void;
}

export default function GoodsReceiptModal({ businessId, po, onClose }: Props) {
  const create = useCreateGoodsReceipt(businessId, po.id);

  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes]             = useState('');
  const [error, setError]             = useState('');

  // Initialiser les quantités à 0 pour chaque ligne du BC
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(
    (po.items ?? [])
        .filter(item => Number(item.quantity_received) < Number(item.quantity_ordered))
        .map(item => [item.id, 0])
    ),
  );

  const setQty = (id: string, value: number) =>
    setQuantities(q => ({ ...q, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const items: CreateGoodsReceiptItemDto[] = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ supplier_po_item_id: id, quantity_received: qty }));

    if (items.length === 0) {
      setError('Saisissez au moins une quantité reçue > 0');
      return;
    }

    const dto: CreateGoodsReceiptDto = {
      receipt_date: receiptDate,
      notes:        notes || undefined,
      items,
    };

    try {
      await create.mutateAsync(dto);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Erreur lors de la création'));
    }
  };

    const pendingItems = (po.items ?? []).filter(
    item => Number(item.quantity_received) < Number(item.quantity_ordered),
  );

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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de réception</label>
              <input type="date" required value={receiptDate}
                onChange={e => setReceiptDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Lignes à réceptionner */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Quantités reçues</h3>
            <p className="text-xs text-gray-500 mb-3">
              Saisissez 0 pour les lignes non reçues lors de cette réception.
            </p>

            {pendingItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
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
                      <th className="text-center px-4 py-3 text-gray-500">Reçu ce jour *</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingItems.map(item => {
                      const reliquat = Number(item.quantity_ordered) - Number(item.quantity_received);
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.quantity_ordered}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.quantity_received}</td>
                          <td className="px-4 py-3 text-center font-medium text-orange-600">{reliquat}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number" min={0} max={reliquat} step={0.001}
                              value={quantities[item.id] ?? 0}
                              onChange={e => setQty(item.id, parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-center focus:ring-1 focus:ring-indigo-500"
                            />
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
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Observations sur la réception..." />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={create.isPending || pendingItems.length === 0}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {create.isPending ? 'Enregistrement...' : 'Valider la réception'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}