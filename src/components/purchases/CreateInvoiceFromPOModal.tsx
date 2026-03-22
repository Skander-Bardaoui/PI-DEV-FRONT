// src/components/purchases/CreateInvoiceFromPOModal.tsx
// Création d'une facture directement depuis un BC — pré-remplit tout

import { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { useCreatePurchaseInvoice } from '@/hooks/usePurchaseInvoices';
import { usePurchaseInvoices }      from '@/hooks/usePurchaseInvoices';
import { useToast }                 from '@/components/ui/Toast';
import { formatAmount, round3, SupplierPO, TIMBRE_FISCAL } from '@/types';
import { useApiError } from '../ui/ConfirmModal';

interface Props {
  businessId: string;
  po:         SupplierPO;
  onClose:    () => void;
}

export default function CreateInvoiceFromPOModal({ businessId, po, onClose }: Props) {
  const create        = useCreatePurchaseInvoice(businessId);
  const toast         = useToast();
  const { handleError } = useApiError();

  // Vérification doublon
  const { data: existingInvoices } = usePurchaseInvoices(businessId, {
    supplier_id: po.supplier_id,
    limit: 100,
  });

  const [form, setForm] = useState({
    invoice_number_supplier: '',
    invoice_date:  new Date().toISOString().split('T')[0],
    due_date:      '',
    subtotal_ht:   Number(po.subtotal_ht),
    tax_amount:    Number(po.tax_amount),
    timbre_fiscal: Number(po.timbre_fiscal) || TIMBRE_FISCAL,
    receipt_url:   '',
  });

  const net_amount = round3(form.subtotal_ht + form.tax_amount + form.timbre_fiscal);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // ── Détection doublon ─────────────────────────────────────────────────────
  const isDuplicate = (existingInvoices?.data ?? []).some(
    inv => inv.invoice_number_supplier.toLowerCase().trim() === form.invoice_number_supplier.toLowerCase().trim()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDuplicate) {
      toast.error('Doublon détecté', `Une facture avec le N° "${form.invoice_number_supplier}" existe déjà pour ce fournisseur`);
      return;
    }

    try {
      await create.mutateAsync({
        invoice_number_supplier: form.invoice_number_supplier,
        supplier_id:   po.supplier_id,
        supplier_po_id: po.id,
        invoice_date:  form.invoice_date,
        due_date:      form.due_date || undefined,
        subtotal_ht:   form.subtotal_ht,
        tax_amount:    form.tax_amount,
        timbre_fiscal: form.timbre_fiscal,
        receipt_url:   form.receipt_url || undefined,
      });
      toast.success('Facture créée', `La facture ${form.invoice_number_supplier} a été enregistrée`);
      onClose();
    } catch (err) { handleError(err, 'Impossible de créer la facture'); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Créer une facture</h2>
              <p className="text-sm text-gray-500">depuis {po.po_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info BC source */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm">
            <p className="font-medium text-indigo-800">BC source : {po.po_number}</p>
            <p className="text-indigo-600">Fournisseur : {po.supplier?.name} · Net TTC : {formatAmount(po.net_amount)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° facture fournisseur *
            </label>
            <input type="text" required value={form.invoice_number_supplier}
              onChange={e => set('invoice_number_supplier', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                isDuplicate && form.invoice_number_supplier ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ex: FACT-2024-0042" />
            {isDuplicate && form.invoice_number_supplier && (
              <p className="text-red-600 text-xs mt-1">⚠ Ce numéro de facture existe déjà pour ce fournisseur</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date facture *</label>
              <input type="date" required value={form.invoice_date}
                onChange={e => set('invoice_date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
              <input type="date" value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Montants pré-remplis depuis le BC */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase">Montants (pré-remplis depuis le BC)</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sous-total HT</label>
                <input type="number" min={0} step={0.001} value={form.subtotal_ht}
                  onChange={e => set('subtotal_ht', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TVA</label>
                <input type="number" min={0} step={0.001} value={form.tax_amount}
                  onChange={e => set('tax_amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Timbre</label>
                <input type="number" min={0} step={0.001} value={form.timbre_fiscal}
                  onChange={e => set('timbre_fiscal', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Alerte si montants différents du BC */}
            {Math.abs(net_amount - Number(po.net_amount)) > Number(po.net_amount) * 0.05 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                <p className="text-orange-700 font-medium">⚠ Écart important détecté</p>
                <p className="text-orange-600 text-xs mt-0.5">
                  Facture : {formatAmount(net_amount)} vs BC : {formatAmount(po.net_amount)} —
                  écart de {Math.abs(((net_amount - Number(po.net_amount)) / Number(po.net_amount)) * 100).toFixed(1)}%
                </p>
              </div>
            )}

            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-sm">
              <span>Net TTC facture</span>
              <span>{formatAmount(net_amount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL scan facture</label>
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
            <button type="submit" disabled={create.isPending || isDuplicate}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {create.isPending ? 'Création...' : 'Créer la facture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}