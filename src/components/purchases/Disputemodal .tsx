// src/components/purchases/DisputeModal.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, X } from 'lucide-react';
import { z } from 'zod';
import { formatAmount, PurchaseInvoice } from '@/types';

const schema = z.object({
  dispute_reason: z.string().min(1, 'Veuillez sélectionner un motif'),
});
type FormValues = z.infer<typeof schema>;

const DISPUTE_REASONS = [
  'Montant incorrect',
  'Produit non conforme à la commande',
  'Facture déjà réglée',
  'Double facturation',
  'Prestation non réalisée',
  'Autre',
];

interface Props {
  invoice:   PurchaseInvoice;
  onClose:   () => void;
  onConfirm: (reason: string) => void;
}

export function DisputeModal({ invoice, onClose, onConfirm }: Props) {
  // State séparé pour le champ texte libre — ne jamais utiliser register() dessus
  const [customReason, setCustomReason] = useState('');
  const [customError,  setCustomError]  = useState('');

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dispute_reason: '' },
  });

  const selected = watch('dispute_reason');

  const onSubmit = ({ dispute_reason }: FormValues) => {
    if (dispute_reason === 'Autre') {
      const trimmed = customReason.trim();
      if (trimmed.length < 10) {
        setCustomError('Veuillez préciser le motif (minimum 10 caractères)');
        return;
      }
      // Motif final pour le backend : "Autre : <détail>"
      onConfirm(`Autre : ${trimmed}`);
    } else {
      onConfirm(dispute_reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">Mettre en litige</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 text-sm">
          <p className="font-medium text-orange-800">{invoice.invoice_number_supplier}</p>
          <p className="text-orange-700">{invoice.supplier?.name} — {formatAmount(invoice.net_amount)}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif du litige <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {DISPUTE_REASONS.map(r => (
                <label key={r} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    value={r}
                    {...register('dispute_reason')}
                    onChange={(e) => {
                      // Reset le texte libre si on quitte "Autre"
                      if (e.target.value !== 'Autre') {
                        setCustomReason('');
                        setCustomError('');
                      }
                      register('dispute_reason').onChange(e);
                    }}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{r}</span>
                </label>
              ))}
            </div>
            {errors.dispute_reason && (
              <p className="text-red-500 text-xs mt-2">{errors.dispute_reason.message}</p>
            )}
          </div>

          {/* Champ texte libre — useState uniquement, PAS de register() */}
          {selected === 'Autre' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Précisez le motif <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (e.target.value.trim().length >= 10) setCustomError('');
                }}
                placeholder="Décrivez le motif du litige (min. 10 caractères)..."
                className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 ${
                  customError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {customError && <p className="text-red-500 text-xs mt-1">{customError}</p>}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium disabled:opacity-50">
              {isSubmitting ? 'Enregistrement...' : 'Confirmer le litige'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DisputeModal;