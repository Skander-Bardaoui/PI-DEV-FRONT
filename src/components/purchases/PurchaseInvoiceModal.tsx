// src/components/purchases/PurchaseInvoiceModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useCreatePurchaseInvoice } from '../../hooks/usePurchaseInvoices';
import { CreatePurchaseInvoiceDto, formatAmount, round3, TIMBRE_FISCAL } from '@/types';

interface Props {
  businessId: string;
  onClose:    () => void;
}

export default function PurchaseInvoiceModal({ businessId, onClose }: Props) {
  const { data: suppliersData } = useSuppliers(businessId, { is_active: true, limit: 100 });
  const create = useCreatePurchaseInvoice(businessId);

  const [form, setForm] = useState({
    invoice_number_supplier: '',
    supplier_id:             '',
    invoice_date:            new Date().toISOString().split('T')[0],
    due_date:                '',
    subtotal_ht:             0,
    tax_amount:              0,
    timbre_fiscal:           TIMBRE_FISCAL,
    receipt_url:             '',
  });
  const [error, setError] = useState('');

  const set = (key: string, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  const net_amount = round3(
    Number(form.subtotal_ht) + Number(form.tax_amount) + Number(form.timbre_fiscal),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const dto: CreatePurchaseInvoiceDto = {
      invoice_number_supplier: form.invoice_number_supplier,
      supplier_id:             form.supplier_id,
      invoice_date:            form.invoice_date,
      due_date:                form.due_date || undefined,
      subtotal_ht:             Number(form.subtotal_ht),
      tax_amount:              Number(form.tax_amount),
      timbre_fiscal:           Number(form.timbre_fiscal),
      receipt_url:             form.receipt_url || undefined,
    };

    try {
      await create.mutateAsync(dto);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Erreur lors de la création'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Saisir une facture fournisseur</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° de facture fournisseur *
            </label>
            <input type="text" required value={form.invoice_number_supplier}
              onChange={e => set('invoice_number_supplier', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: FACT-2024-0042" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
            <select required value={form.supplier_id} onChange={e => set('supplier_id', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">Sélectionner un fournisseur</option>
              {suppliersData?.data.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date facture *</label>
              <input type="date" required value={form.invoice_date}
                onChange={e => set('invoice_date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date échéance
                <span className="text-gray-400 font-normal"> (auto si vide)</span>
              </label>
              <input type="date" value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Montants */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-gray-900 text-sm">Montants (TND)</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sous-total HT *</label>
                <input type="number" required min={0} step={0.001} value={form.subtotal_ht}
                  onChange={e => set('subtotal_ht', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TVA *</label>
                <input type="number" required min={0} step={0.001} value={form.tax_amount}
                  onChange={e => set('tax_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Timbre fiscal</label>
                <input type="number" min={0} step={0.001} value={form.timbre_fiscal}
                  onChange={e => set('timbre_fiscal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Net à payer</span>
              <span className="text-lg font-bold text-gray-900">{formatAmount(net_amount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL du scan / photo de la facture
            </label>
            <input type="url" value={form.receipt_url}
              onChange={e => set('receipt_url', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..." />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {create.isPending ? 'Enregistrement...' : 'Saisir la facture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}