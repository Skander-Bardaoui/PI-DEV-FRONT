// src/components/purchases/SupplierPOModal.tsx
import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useCreateSupplierPO } from '../../hooks/useSupplierPOs';
import { CreateSupplierPODto, CreateSupplierPOItemDto, formatAmount, round3, TIMBRE_FISCAL, TVA_RATES } from '@/types';

interface Props {
  businessId: string;
  onClose:    () => void;
}

const emptyLine = (): CreateSupplierPOItemDto => ({
  description:      '',
  quantity_ordered: 1,
  unit_price_ht:    0,
  tax_rate_value:   19,
});

export default function SupplierPOModal({ businessId, onClose }: Props) {
  const { data: suppliersData } = useSuppliers(businessId, { is_active: true, limit: 100 });
  const create = useCreateSupplierPO(businessId);

  const [supplierId, setSupplierId]         = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes]                   = useState('');
  const [lines, setLines]                   = useState<CreateSupplierPOItemDto[]>([emptyLine()]);
  const [error, setError]                   = useState('');

  // ── Calculs ──────────────────────────────────────────────────────────────
  const computed = lines.map(l => {
    const ht  = round3(l.quantity_ordered * l.unit_price_ht);
    const tax = round3(ht * (l.tax_rate_value / 100));
    return { ht, tax };
  });

  const subtotal_ht  = round3(computed.reduce((s, c) => s + c.ht, 0));
  const tax_amount   = round3(computed.reduce((s, c) => s + c.tax, 0));
  const net_amount   = round3(subtotal_ht + tax_amount + TIMBRE_FISCAL);

  // ── Lignes ────────────────────────────────────────────────────────────────
  const setLine = (i: number, key: keyof CreateSupplierPOItemDto, value: any) =>
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [key]: value } : l));

  const addLine    = () => setLines(ls => [...ls, emptyLine()]);
  const removeLine = (i: number) => setLines(ls => ls.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supplierId) { setError('Sélectionnez un fournisseur'); return; }
    if (lines.some(l => !l.description)) { setError('Toutes les lignes doivent avoir une description'); return; }

    const dto: CreateSupplierPODto = {
      supplier_id:        supplierId,
      expected_delivery:  expectedDelivery || undefined,
      notes:              notes || undefined,
      items: lines.map((l, i) => ({ ...l, sort_order: i })),
    };

    try {
      await create.mutateAsync(dto);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Nouveau Bon de Commande</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Infos générales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
              <select required value={supplierId} onChange={e => setSupplierId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Sélectionner un fournisseur</option>
                {suppliersData?.data.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livraison souhaitée</label>
              <input type="date" value={expectedDelivery}
                onChange={e => setExpectedDelivery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Lignes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Lignes du bon de commande</h3>
              <button type="button" onClick={addLine}
                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus className="h-4 w-4" /> Ajouter une ligne
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description *</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-24">Qté</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-32">Prix HT</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-24">TVA %</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-32">Total HT</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((line, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">
                        <input
                          type="text" required value={line.description}
                          onChange={e => setLine(i, 'description', e.target.value)}
                          placeholder="Description du produit/service"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number" min={0.001} step={0.001} value={line.quantity_ordered}
                          onChange={e => setLine(i, 'quantity_ordered', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number" min={0} step={0.001} value={line.unit_price_ht}
                          onChange={e => setLine(i, 'unit_price_ht', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select value={line.tax_rate_value}
                          onChange={e => setLine(i, 'tax_rate_value', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500">
                          {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                        {round3(computed[i]?.ht ?? 0).toFixed(3)}
                      </td>
                      <td className="px-4 py-2">
                        {lines.length > 1 && (
                          <button type="button" onClick={() => removeLine(i)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors">
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

          {/* Totaux */}
          <div className="bg-gray-50 rounded-xl p-4 ml-auto max-w-xs w-full">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total HT</span>
                <span className="font-medium">{subtotal_ht.toFixed(3)} TND</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA</span>
                <span className="font-medium">{tax_amount.toFixed(3)} TND</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Timbre fiscal</span>
                <span className="font-medium">{TIMBRE_FISCAL.toFixed(3)} TND</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Net à payer</span>
                <span>{formatAmount(net_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Instructions particulières..." />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {create.isPending ? 'Création...' : 'Créer le BC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}