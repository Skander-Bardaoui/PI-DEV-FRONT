// src/components/purchases/InvoiceDetailModal.tsx
import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { formatAmount, formatDate, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, InvoiceStatus, PurchaseInvoice, round3 } from '@/types';
import PDFButton from '@/components/purchases/PDFButton';
import { usePDFExport } from '@/hooks/usePDFExport';
import CorrectInvoiceModal from '@/components/purchases/CorrectInvoiceModal';

interface Props {
  invoice:    PurchaseInvoice;
  onClose:    () => void;
  businessId: string;
}

export default function InvoiceDetailModal({ invoice, onClose, businessId }: Props) {
  const remaining = round3(Number(invoice.net_amount) - Number(invoice.paid_amount));
  const paidPct   = Math.round((Number(invoice.paid_amount) / Number(invoice.net_amount)) * 100);

  const { exportFacture, loading } = usePDFExport();

  // FIX BUG 2: état correctOpen déclaré correctement
  const [correctOpen, setCorrectOpen] = useState(false);

  return (
    <>
      {/* FIX BUG 2: modal principal séparé du CorrectInvoiceModal
          — le fragment <> permet de rendre les deux en parallèle
          sans que CorrectInvoiceModal soit enfant du footer div */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{invoice.invoice_number_supplier}</h2>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                {INVOICE_STATUS_LABELS[invoice.status]}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-5">

            {/* Infos générales */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fournisseur</p>
                <p className="font-medium text-gray-900">{invoice.supplier?.name}</p>
              </div>
              {invoice.supplier_po && (
                <div>
                  <p className="text-gray-500">Bon de commande</p>
                  <p className="font-mono font-medium text-gray-900">{invoice.supplier_po.po_number}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Date facture</p>
                <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
              </div>
              <div>
                <p className="text-gray-500">Date échéance</p>
                <p className={`font-medium ${invoice.status === InvoiceStatus.OVERDUE ? 'text-red-600' : ''}`}>
                  {formatDate(invoice.due_date)}
                </p>
              </div>
            </div>

            {/* Montants */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total HT</span>
                <span>{formatAmount(invoice.subtotal_ht)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA</span>
                <span>{formatAmount(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Timbre fiscal</span>
                <span>{formatAmount(invoice.timbre_fiscal)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Net TTC</span>
                <span>{formatAmount(invoice.net_amount)}</span>
              </div>
            </div>

            {/* Suivi paiement */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Suivi du paiement</p>
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(paidPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">Payé : {formatAmount(invoice.paid_amount)}</span>
                <span className={`font-medium ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  Reste : {formatAmount(remaining)}
                </span>
              </div>
            </div>

            {/* Motif litige */}
            {invoice.status === InvoiceStatus.DISPUTED && invoice.dispute_reason && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm font-medium text-orange-800 mb-1">Motif du litige</p>
                <p className="text-sm text-orange-700">{invoice.dispute_reason}</p>
              </div>
            )}

            {/* Scan facture */}
            {invoice.receipt_url && (
              <a
                href={invoice.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink className="h-4 w-4" />
                Voir le scan de la facture
              </a>
            )}
          </div>

          {/* Footer — FIX BUG 2: plus de commentaire JS ni de CorrectInvoiceModal ici */}
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <PDFButton
              variant="primary"
              label="Télécharger PDF"
              loading={loading}
              onClick={() => exportFacture(invoice)}
            />
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
            {invoice.status === InvoiceStatus.DISPUTED && (
              <button
                onClick={() => setCorrectOpen(true)}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Corriger / Résoudre
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FIX BUG 2: CorrectInvoiceModal rendu EN DEHORS du div principal,
          au même niveau dans le fragment — z-index 60 > 50 donc il passe par-dessus */}
      {correctOpen && (
        <CorrectInvoiceModal
          businessId={businessId}
          invoice={invoice}
          onClose={() => {
            setCorrectOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}