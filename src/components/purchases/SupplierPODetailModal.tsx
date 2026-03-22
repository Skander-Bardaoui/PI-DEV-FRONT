// src/components/purchases/SupplierPODetailModal.tsx
// CORRECTIONS :
// - Données manquantes dans le détail (items chargés depuis useSupplierPO)
// - Modal se ferme après confirmation
// - Amélioration affichage BR

import { useState } from 'react';
import {
  X, Package, FileText, Plus, ChevronDown, ChevronUp,
  AlertCircle, Send, Check, Loader2,
} from 'lucide-react';
import { useGoodsReceiptsByPO }  from '@/hooks/useGoodsReceipts';
import {
  useSupplierPO,
  useSendSupplierPO,
  useConfirmSupplierPO,
  useCancelSupplierPO,
} from '@/hooks/useSupplierPOs';
import { usePDFExport }              from '@/hooks/usePDFExport';
import { useToast }                  from '@/components/ui/Toast';
import EditSupplierPOModal           from '@/components/purchases/EditSupplierPOModal';
import GoodsReceiptModal             from '@/components/purchases/GoodsReceiptModal';
import CreateInvoiceFromPOModal      from '@/components/purchases/CreateInvoiceFromPOModal';
import PDFButton                     from '@/components/purchases/PDFButton';
import {
  formatAmount, formatDate,
  PO_STATUS_COLORS, PO_STATUS_LABELS,
  POStatus, SupplierPO,
} from '@/types';

interface Props {
  po:         SupplierPO;
  businessId: string;
  onClose:    () => void;
}

export default function SupplierPODetailModal({ po: initialPO, businessId, onClose }: Props) {
  const [editOpen,    setEditOpen]    = useState(false);
  const [grOpen,      setGrOpen]      = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [showItems,   setShowItems]   = useState(true);
  const [showReceipts,setShowReceipts]= useState(true);

  const toast = useToast();

  // FIX : recharger le BC complet avec ses items depuis l'API
  // initialPO peut ne pas avoir les items si chargé depuis la liste
  const { data: fullPO, isLoading: poLoading } = useSupplierPO(businessId, initialPO.id);
  const po = fullPO ?? initialPO;

  const { data: receipts } = useGoodsReceiptsByPO(businessId, po.id);

  const send    = useSendSupplierPO(businessId);
  const confirm = useConfirmSupplierPO(businessId);
  const cancel  = useCancelSupplierPO(businessId);
  const { exportBC, loading: pdfLoading } = usePDFExport();

  const canEdit    = po.status === POStatus.DRAFT;
  const canSend    = po.status === POStatus.DRAFT;
  const canConfirm = po.status === POStatus.SENT;
  const canCancel  = [POStatus.DRAFT, POStatus.SENT].includes(po.status);
  const canReceive = [POStatus.CONFIRMED, POStatus.PARTIALLY_RECEIVED].includes(po.status);
  const canInvoice = [POStatus.PARTIALLY_RECEIVED, POStatus.FULLY_RECEIVED].includes(po.status);
  const isConfirmedNoReceipt = po.status === POStatus.CONFIRMED;

  // FIX : fermer le modal après confirmation
  const handleConfirm = async () => {
    try {
      await confirm.mutateAsync(po.id);
      toast.success('BC confirmé', `${po.po_number} est maintenant confirmé`);
      onClose(); // ← FERMER LE MODAL
    } catch (err: any) {
      toast.error('Erreur', err?.response?.data?.message ?? 'Impossible de confirmer ce BC');
    }
  };

  const handleSend = async () => {
    try {
      await send.mutateAsync(po.id);
      toast.success('BC envoyé', `${po.po_number} envoyé au fournisseur`);
      onClose(); // ← FERMER AUSSI après envoi
    } catch (err: any) {
      toast.error('Erreur', err?.response?.data?.message ?? 'Impossible d\'envoyer ce BC');
    }
  };

  const handleCancel = async () => {
    try {
      await cancel.mutateAsync(po.id);
      toast.warning('BC annulé', `${po.po_number} a été annulé`);
      onClose();
    } catch (err: any) {
      toast.error('Erreur', err?.response?.data?.message ?? 'Impossible d\'annuler ce BC');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
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

          {poLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="p-6 space-y-6">

              {/* Infos générales */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Fournisseur</p>
                  <p className="font-medium text-gray-900">{po.supplier?.name ?? '—'}</p>
                  {po.supplier?.matricule_fiscal && (
                    <p className="text-xs text-gray-400 font-mono">{po.supplier.matricule_fiscal}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Créé le</p>
                  <p className="font-medium">{formatDate(po.created_at)}</p>
                </div>
                {po.expected_delivery && (
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Livraison prévue</p>
                    <p className="font-medium">{formatDate(po.expected_delivery)}</p>
                  </div>
                )}
                {po.supplier?.email && (
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Email fournisseur</p>
                    <p className="text-sm">{po.supplier.email}</p>
                  </div>
                )}
                {po.supplier?.phone && (
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Téléphone</p>
                    <p className="text-sm">{po.supplier.phone}</p>
                  </div>
                )}
                {po.supplier?.payment_terms !== undefined && (
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Délai paiement</p>
                    <p className="font-medium">{po.supplier.payment_terms} jours</p>
                  </div>
                )}
              </div>

              {/* Lignes BC */}
              <div>
                <button
                  onClick={() => setShowItems(v => !v)}
                  className="flex items-center gap-2 font-semibold text-gray-900 mb-3 w-full text-left hover:text-indigo-600 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Lignes du bon de commande ({po.items?.length ?? 0})
                  {showItems ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                </button>

                {showItems && (
                  <>
                    {!po.items?.length ? (
                      <p className="text-sm text-gray-400 italic py-4 text-center">Aucune ligne</p>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Description</th>
                              <th className="text-center px-4 py-2.5 text-gray-500 font-medium">Commandé</th>
                              <th className="text-center px-4 py-2.5 text-gray-500 font-medium">Reçu</th>
                              <th className="text-center px-4 py-2.5 text-gray-500 font-medium">Reliquat</th>
                              <th className="text-right px-4 py-2.5 text-gray-500 font-medium">PU HT</th>
                              <th className="text-center px-4 py-2.5 text-gray-500 font-medium">TVA</th>
                              <th className="text-right px-4 py-2.5 text-gray-500 font-medium">Total HT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {po.items.map(item => {
                              const reliquat = Number(item.quantity_ordered) - Number(item.quantity_received);
                              const isComplete = reliquat <= 0;
                              return (
                                <tr key={item.id} className={isComplete ? 'bg-green-50/30' : ''}>
                                  <td className="px-4 py-3 text-gray-900 font-medium">{item.description}</td>
                                  <td className="px-4 py-3 text-center">{Number(item.quantity_ordered).toFixed(3)}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={Number(item.quantity_received) > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                      {Number(item.quantity_received).toFixed(3)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {isComplete ? (
                                      <span className="text-green-600 font-medium">✓</span>
                                    ) : (
                                      <span className="text-orange-600 font-medium">{reliquat.toFixed(3)}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">{formatAmount(item.unit_price_ht)}</td>
                                  <td className="px-4 py-3 text-center">{item.tax_rate_value}%</td>
                                  <td className="px-4 py-3 text-right font-medium">{formatAmount(item.line_total_ht)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
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
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Net TTC</span><span className="text-indigo-700">{formatAmount(po.net_amount)}</span>
                </div>
              </div>

              {/* Bons de réception */}
              <div>
                <button
                  onClick={() => setShowReceipts(v => !v)}
                  className="flex items-center gap-2 font-semibold text-gray-900 mb-3 w-full text-left hover:text-indigo-600 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Bons de réception ({receipts?.length ?? 0})
                  {showReceipts ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                </button>

                {showReceipts && (
                  <>
                    {!receipts?.length ? (
                      <p className="text-sm text-gray-400 italic py-2 text-center">Aucune réception enregistrée</p>
                    ) : (
                      <div className="space-y-2">
                        {receipts.map(gr => (
                          <div key={gr.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
                            <div>
                              <p className="font-mono font-medium text-green-800">{gr.gr_number}</p>
                              <p className="text-green-600 text-xs">{formatDate(gr.receipt_date)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-700 text-xs">{gr.items?.length ?? 0} ligne(s)</p>
                              <p className="text-green-600 text-xs">
                                {gr.items?.reduce((s: number, i: any) => s + Number(i.quantity_received), 0).toFixed(3)} unités
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Notes */}
              {po.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
                  <p className="text-sm text-amber-800">{po.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer — boutons d'action */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <PDFButton variant="ghost" label="PDF BC" loading={pdfLoading} onClick={() => exportBC(po)} />

              {canEdit && (
                <button onClick={() => setEditOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Modifier
                </button>
              )}

              {canSend && (
                <button
                  onClick={handleSend}
                  disabled={send.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Envoyer au fournisseur
                </button>
              )}

              {/* FIX : handleConfirm ferme le modal */}
              {canConfirm && (
                <button
                  onClick={handleConfirm}
                  disabled={confirm.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  {confirm.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Confirmer
                </button>
              )}

              {canReceive && (
                <button onClick={() => setGrOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1 transition-colors">
                  <Plus className="h-4 w-4" /> Bon de réception
                </button>
              )}

              {canInvoice ? (
                <button onClick={() => setInvoiceOpen(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 flex items-center gap-1 transition-colors">
                  <FileText className="h-4 w-4" /> Créer une facture
                </button>
              ) : isConfirmedNoReceipt ? (
                <div
                  title="Créez d'abord un bon de réception avant de facturer"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                >
                  <AlertCircle className="h-4 w-4" />
                  Créer facture (réception requise)
                </div>
              ) : null}

              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancel.isPending}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Annuler le BC
                </button>
              )}

              <button onClick={onClose}
                className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {editOpen    && <EditSupplierPOModal po={po} businessId={businessId} onClose={() => setEditOpen(false)} />}
      {grOpen      && <GoodsReceiptModal  po={po} businessId={businessId} onClose={() => setGrOpen(false)} />}
      {invoiceOpen && <CreateInvoiceFromPOModal po={po} businessId={businessId} onClose={() => setInvoiceOpen(false)} />}
    </>
  );
}