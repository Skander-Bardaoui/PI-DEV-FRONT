// src/components/purchases/SupplierPODetailModal.tsx
//
// ANOMALIE 5 CORRIGÉE : canInvoice trop permissif
//
// PROBLÈME : canInvoice incluait POStatus.CONFIRMED — on pouvait créer une facture
//   sur un BC confirmé mais dont aucune marchandise n'avait encore été réceptionnée.
//   En logique métier tunisienne, une facture fournisseur doit correspondre à une
//   livraison effective (bon de réception signé). Facturer avant réception = risque fiscal.
//
// CORRECTION : canInvoice ne s'active que pour PARTIALLY_RECEIVED et FULLY_RECEIVED.
//   L'utilisateur doit d'abord créer un BR avant de créer la facture.
//   Un tooltip explicatif est affiché si le BC est CONFIRMED mais pas encore réceptionné.

import { useState } from 'react';
import {
  X, Package, FileText, Plus, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import { useGoodsReceiptsByPO } from '@/hooks/useGoodsReceipts';
import {
  useSendSupplierPO,
  useConfirmSupplierPO,
  useCancelSupplierPO,
} from '@/hooks/useSupplierPOs';
import { usePDFExport }      from '@/hooks/usePDFExport';
import EditSupplierPOModal   from '@/components/purchases/EditSupplierPOModal';
import GoodsReceiptModal     from '@/components/purchases/GoodsReceiptModal';
import CreateInvoiceFromPOModal from '@/components/purchases/CreateInvoiceFromPOModal';
import PDFButton             from '@/components/purchases/PDFButton';
import {
  formatAmount, formatDate,
  PO_STATUS_COLORS, PO_STATUS_LABELS,
  POStatus, SupplierPO,
} from '@/types';

interface Props {
  po:          SupplierPO;
  businessId:  string;
  onClose:     () => void;
}

export default function SupplierPODetailModal({ po, businessId, onClose }: Props) {
  const [editOpen,        setEditOpen]        = useState(false);
  const [grOpen,          setGrOpen]          = useState(false);
  const [invoiceOpen,     setInvoiceOpen]      = useState(false);
  const [showItems,       setShowItems]       = useState(true);
  const [showReceipts,    setShowReceipts]    = useState(true);

  const { data: receipts } = useGoodsReceiptsByPO(businessId, po.id);
  const send    = useSendSupplierPO(businessId);
  const confirm = useConfirmSupplierPO(businessId);
  const cancel  = useCancelSupplierPO(businessId);
  const { exportBC, loading: pdfLoading } = usePDFExport();

  // ANOMALIE 5 CORRIGÉE : CONFIRMED retiré de canInvoice
  // Avant : [CONFIRMED, PARTIALLY_RECEIVED, FULLY_RECEIVED]
  // Après : [PARTIALLY_RECEIVED, FULLY_RECEIVED] uniquement
  // Raison : la facture doit correspondre à une réception réelle (BR signé).
  //   Un BC confirmé sans BR ne justifie pas encore une facture fournisseur.
  const canInvoice = [
    POStatus.PARTIALLY_RECEIVED,
    POStatus.FULLY_RECEIVED,
  ].includes(po.status);

  // Indique si le BC est confirmé mais pas encore réceptionné (pour le tooltip)
  const isConfirmedNotReceived = po.status === POStatus.CONFIRMED;

  const canReceive = [
    POStatus.CONFIRMED,
    POStatus.PARTIALLY_RECEIVED,
  ].includes(po.status);

  const canEdit    = po.status === POStatus.DRAFT;
  const canSend    = po.status === POStatus.DRAFT;
  const canConfirm = po.status === POStatus.SENT;
  const canCancel  = [POStatus.DRAFT, POStatus.SENT].includes(po.status);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{po.po_number}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${PO_STATUS_COLORS[po.status]}`}>
                  {PO_STATUS_LABELS[po.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{po.supplier?.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">

            {/* Infos générales */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fournisseur</p>
                <p className="font-medium">{po.supplier?.name}</p>
              </div>
              {po.expected_delivery && (
                <div>
                  <p className="text-gray-500">Livraison prévue</p>
                  <p className="font-medium">{formatDate(po.expected_delivery)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Créé le</p>
                <p className="font-medium">{formatDate(po.created_at)}</p>
              </div>
            </div>

            {/* Lignes BC */}
            <div>
              <button
                onClick={() => setShowItems(v => !v)}
                className="flex items-center gap-2 font-semibold text-gray-900 mb-3 w-full text-left"
              >
                <Package className="h-4 w-4" />
                Lignes du bon de commande ({po.items?.length ?? 0})
                {showItems ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
              </button>
              {showItems && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-gray-500">Description</th>
                        <th className="text-center px-4 py-2 text-gray-500">Commandé</th>
                        <th className="text-center px-4 py-2 text-gray-500">Reçu</th>
                        <th className="text-center px-4 py-2 text-gray-500">Reliquat</th>
                        <th className="text-right px-4 py-2 text-gray-500">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(po.items ?? []).map(item => {
                        const reliquat = Number(item.quantity_ordered) - Number(item.quantity_received);
                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-gray-900">{item.description}</td>
                            <td className="px-4 py-2 text-center">{item.quantity_ordered}</td>
                            <td className="px-4 py-2 text-center text-green-600">{item.quantity_received}</td>
                            <td className={`px-4 py-2 text-center font-medium ${reliquat > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                              {reliquat > 0 ? reliquat.toFixed(3) : '✓'}
                            </td>
                            <td className="px-4 py-2 text-right">{formatAmount(item.line_total_ht)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Totaux */}
            <div className="bg-gray-50 rounded-xl p-4 ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total HT</span><span>{formatAmount(po.subtotal_ht)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA</span><span>{formatAmount(po.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Timbre fiscal</span><span>{formatAmount(po.timbre_fiscal)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
                <span>Net TTC</span><span>{formatAmount(po.net_amount)}</span>
              </div>
            </div>

            {/* Bons de réception */}
            {(receipts?.length ?? 0) > 0 && (
              <div>
                <button
                  onClick={() => setShowReceipts(v => !v)}
                  className="flex items-center gap-2 font-semibold text-gray-900 mb-3 w-full text-left"
                >
                  <FileText className="h-4 w-4" />
                  Bons de réception ({receipts?.length ?? 0})
                  {showReceipts ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                </button>
                {showReceipts && (
                  <div className="space-y-2">
                    {receipts?.map(gr => (
                      <div key={gr.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
                        <div>
                          <p className="font-mono font-medium text-green-800">{gr.gr_number}</p>
                          <p className="text-green-700 text-xs">{formatDate(gr.receipt_date)}</p>
                        </div>
                        <span className="text-xs text-green-600">{gr.items?.length ?? 0} ligne(s)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {po.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{po.notes}</p>
              </div>
            )}
          </div>

          {/* Footer — boutons d'action */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <div className="flex flex-wrap gap-2">
              <PDFButton variant="ghost" label="PDF BC" loading={pdfLoading} onClick={() => exportBC(po)} />

              {canEdit && (
                <button onClick={() => setEditOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Modifier
                </button>
              )}
              {canSend && (
                <button onClick={() => send.mutate(po.id)} disabled={send.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  Envoyer au fournisseur
                </button>
              )}
              {canConfirm && (
                <button onClick={() => confirm.mutate(po.id)} disabled={confirm.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                  Confirmer
                </button>
              )}
              {canReceive && (
                <button onClick={() => setGrOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Bon de réception
                </button>
              )}

              {/* ANOMALIE 5 : bouton "Créer facture" désactivé si pas encore réceptionné */}
              {canInvoice ? (
                <button onClick={() => setInvoiceOpen(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Créer une facture
                </button>
              ) : isConfirmedNotReceived ? (
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50" title="Créez d'abord un bon de réception avant de facturer">
                  <AlertCircle className="h-4 w-4" />
                  Créer une facture (réception requise)
                </div>
              ) : null}

              {canCancel && (
                <button onClick={() => cancel.mutate(po.id)} disabled={cancel.isPending}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50">
                  Annuler le BC
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {editOpen    && <EditSupplierPOModal po={po} businessId={businessId} onClose={() => setEditOpen(false)} />}
      {grOpen      && <GoodsReceiptModal po={po} businessId={businessId} onClose={() => setGrOpen(false)} />}
      {invoiceOpen && <CreateInvoiceFromPOModal po={po} businessId={businessId} onClose={() => setInvoiceOpen(false)} />}
    </>
  );
}