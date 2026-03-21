// src/components/purchases/PaymentModal.tsx
import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { formatAmount, PurchaseInvoice, round3 } from '@/types';

interface Props {
  invoice:   PurchaseInvoice;
  onClose:   () => void;
  onConfirm: (paid_amount: number) => void;
}

export default function PaymentModal({ invoice, onClose, onConfirm }: Props) {
  const alreadyPaid = Number(invoice.paid_amount);
  const remaining   = round3(Number(invoice.net_amount) - alreadyPaid);

  const [amount, setAmount] = useState<number>(remaining);
  const [error,  setError]  = useState('');

  const handleConfirm = () => {
    if (!amount || amount <= 0) {
      setError('Le montant doit être supérieur à 0');
      return;
    }
    if (amount > remaining) {
      setError(`Le montant ne peut pas dépasser le reste à payer (${formatAmount(remaining)})`);
      return;
    }
    // On envoie le total payé cumulé (pas juste le nouveau versement)
    onConfirm(round3(alreadyPaid + amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Enregistrer un paiement</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Résumé facture */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Facture</span>
            <span className="font-mono font-medium">{invoice.invoice_number_supplier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fournisseur</span>
            <span className="font-medium">{invoice.supplier?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Net TTC</span>
            <span className="font-medium">{formatAmount(invoice.net_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Déjà payé</span>
            <span className="font-medium text-green-600">{formatAmount(alreadyPaid)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="font-medium text-gray-700">Reste à payer</span>
            <span className="font-bold text-orange-600">{formatAmount(remaining)}</span>
          </div>
        </div>

        {/* Champ montant */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant à régler (TND) *
          </label>
          <input
            type="number"
            min={0.001}
            max={remaining}
            step={0.001}
            value={amount}
            onChange={e => { setAmount(parseFloat(e.target.value) || 0); setError(''); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-right font-mono text-lg"
          />
          {/* Raccourcis */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setAmount(round3(remaining / 2))}
              className="flex-1 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setAmount(remaining)}
              className="flex-1 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Solde total
            </button>
          </div>
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>

        {/* Nouveau solde après paiement */}
        {amount > 0 && amount <= remaining && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-5 text-sm">
            <div className="flex justify-between">
              <span className="text-indigo-700">Reste après ce paiement</span>
              <span className="font-bold text-indigo-800">
                {formatAmount(round3(remaining - amount))}
              </span>
            </div>
            {round3(remaining - amount) === 0 && (
              <p className="text-green-700 text-xs mt-1 font-medium">
                ✓ La facture sera marquée comme entièrement payée
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Valider le paiement
          </button>
        </div>
      </div>
    </div>
  );
}