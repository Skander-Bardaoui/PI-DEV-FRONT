// src/components/purchases/PurchaseInvoiceModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { purchaseInvoiceSchema, PurchaseInvoiceFormValues } from '@/schemas/purchases.schemas';
import { useSuppliers }             from '@/hooks/useSuppliers';
import { useCreatePurchaseInvoice } from '@/hooks/usePurchaseInvoices';
import { formatAmount, round3, TIMBRE_FISCAL } from '@/types';

const inputCls = (error?: string) =>
  `w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`;
const Err = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;

interface Props { businessId: string; onClose: () => void; }

export function PurchaseInvoiceModal({ businessId, onClose }: Props) {
  const { data: suppliersData } = useSuppliers(businessId, { is_active: true, limit: 100 });
  const create = useCreatePurchaseInvoice(businessId);

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseInvoiceFormValues>({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: {
      invoice_number_supplier: '',
      supplier_id:   '',
      invoice_date:  new Date().toISOString().split('T')[0],
      due_date:      '',
      subtotal_ht:   0,
      tax_amount:    0,
      timbre_fiscal: TIMBRE_FISCAL,
      receipt_url:   '',
    },
  });

  const [ht, tax, timbre] = [watch('subtotal_ht') || 0, watch('tax_amount') || 0, watch('timbre_fiscal') || 0];
  const netDisplay = round3(Number(ht) + Number(tax) + Number(timbre));

  const onSubmit = async (values: PurchaseInvoiceFormValues) => {
    await create.mutateAsync({
      invoice_number_supplier: values.invoice_number_supplier,
      supplier_id:             values.supplier_id,
      invoice_date:            values.invoice_date,
      due_date:                values.due_date    || undefined,
      subtotal_ht:             Number(values.subtotal_ht)   || 0,
      tax_amount:              Number(values.tax_amount)    || 0,
      timbre_fiscal:           Number(values.timbre_fiscal) || TIMBRE_FISCAL,
      receipt_url:             values.receipt_url || undefined,
      // net_amount intentionnellement absent — calculé par le backend
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Saisir une facture fournisseur</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N° facture fournisseur <span className="text-red-500">*</span></label>
            <input {...register('invoice_number_supplier')} className={inputCls(errors.invoice_number_supplier?.message)} placeholder="Ex: FACT-2024-0042" />
            <Err msg={errors.invoice_number_supplier?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur <span className="text-red-500">*</span></label>
            <select {...register('supplier_id')} className={inputCls(errors.supplier_id?.message)}>
              <option value="">Sélectionner un fournisseur</option>
              {suppliersData?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Err msg={errors.supplier_id?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date facture <span className="text-red-500">*</span></label>
              <input type="date" {...register('invoice_date')} className={inputCls(errors.invoice_date?.message)} />
              <Err msg={errors.invoice_date?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Échéance <span className="text-gray-400 text-xs">(auto si vide)</span></label>
              <input type="date" {...register('due_date')} className={inputCls(errors.due_date?.message)} />
              <Err msg={errors.due_date?.message} />
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Montants (TND)</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sous-total HT <span className="text-red-500">*</span></label>
                <input type="number" step="0.001" min="0" {...register('subtotal_ht', { valueAsNumber: true })} className={inputCls(errors.subtotal_ht?.message) + ' text-right'} />
                <Err msg={errors.subtotal_ht?.message} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TVA <span className="text-red-500">*</span></label>
                <input type="number" step="0.001" min="0" {...register('tax_amount', { valueAsNumber: true })} className={inputCls(errors.tax_amount?.message) + ' text-right'} />
                <Err msg={errors.tax_amount?.message} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Timbre fiscal</label>
                <input type="number" step="0.001" min="0" {...register('timbre_fiscal', { valueAsNumber: true })} className={inputCls(errors.timbre_fiscal?.message) + ' text-right'} />
                <Err msg={errors.timbre_fiscal?.message} />
              </div>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-sm">
              <span>Net TTC (calculé)</span>
              <span>{formatAmount(netDisplay)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL scan facture</label>
            <input type="url" {...register('receipt_url')} className={inputCls(errors.receipt_url?.message)} placeholder="https://..." />
            <Err msg={errors.receipt_url?.message} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Enregistrement...' : 'Saisir la facture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default PurchaseInvoiceModal;