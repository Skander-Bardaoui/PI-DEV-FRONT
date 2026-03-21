// src/components/purchases/DisputeModal.tsx
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { formatAmount, PurchaseInvoice } from '@/types';


interface Props {
  invoice:   PurchaseInvoice;
  onClose:   () => void;
  onConfirm: (reason: string) => void;
}

const DISPUTE_REASONS = [
  'Montant incorrect',
  'Produit non conforme à la commande',
  'Facture déjà réglée',
  'Double facturation',
  'Prestation non réalisée',
  'Autre',
];

export default function DisputeModal({ invoice, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState('');
  const [custom,   setCustom]   = useState('');
  const [error,    setError]    = useState('');

  const handleConfirm = () => {
    const reason = selected === 'Autre' ? custom : selected;
    if (!reason.trim()) {
      setError('Veuillez indiquer le motif du litige');
      return;
    }
    onConfirm(reason);
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

        {/* Résumé */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 text-sm">
          <p className="font-medium text-orange-800">{invoice.invoice_number_supplier}</p>
          <p className="text-orange-700">{invoice.supplier?.name} — {formatAmount(invoice.net_amount)}</p>
        </div>

        {/* Motifs */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motif du litige *
          </label>
          <div className="space-y-2">
            {DISPUTE_REASONS.map(r => (
              <label key={r} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="dispute"
                  value={r}
                  checked={selected === r}
                  onChange={() => { setSelected(r); setError(''); }}
                  className="h-4 w-4 text-orange-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{r}</span>
              </label>
            ))}
          </div>
        </div>

        {selected === 'Autre' && (
          <div className="mb-4">
            <textarea
              rows={3}
              value={custom}
              onChange={e => { setCustom(e.target.value); setError(''); }}
              placeholder="Décrivez le motif du litige..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
            Confirmer le litige
          </button>
        </div>
      </div>
    </div>
  );
}