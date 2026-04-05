// src/pages/backoffice/purchases/PurchaseInvoicesPage.tsx

import { useState } from 'react';
import {
  Plus,
  Eye,
  Check,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Scale,
  ScanLine,
  Info,
  ChevronUp,
  ChevronDown,
  FileSearch,
  Wrench,
  MessageSquare,
  Clock,
  XCircle,
  DollarSign,
  FileText,
} from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';

import {
  usePurchaseInvoices,
  useApprovePurchaseInvoice,
  useDisputePurchaseInvoice,
  useResolveDispute,
  useUpdatePayment,
} from '@/hooks/usePurchaseInvoices';

import { usePDFExport } from '@/hooks/usePDFExport';

import PurchaseInvoiceModal from '@/components/purchases/PurchaseInvoiceModal';
import CorrectInvoiceModal from '@/components/purchases/CorrectInvoiceModal';
import PDFButton from '@/components/purchases/PDFButton';
import OcrInvoiceModal from '@/components/purchases/OcrInvoiceModal';
import { InvoiceProcessGuide } from '@/components/purchases/InvoiceProcessGuide';

import {
  formatAmount,
  formatDate,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  InvoiceStatus,
  PurchaseInvoice,
} from '@/types';
import InvoiceDetailModal from '@/components/purchases/Invoicedetailmodal ';
import { PaymentModal } from '@/components/purchases/Paymentmodal';
import DisputeModal from '@/components/purchases/Disputemodal ';
import { DisputeResponsesPanel } from '@/components/purchases/DisputeResponsesPanel';
import { usePendingDisputeResponses } from '@/hooks/useDisputeResponses';

type SortField = 'invoice_number_supplier' | 'invoice_date' | 'net_amount' | 'supplier';
type SortDir   = 'asc' | 'desc';

export default function PurchaseInvoicesPage() {
  const { user } = useAuth();
  const businessId = (user as any)?.business_id ?? '';

  const [createOpen, setCreateOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<PurchaseInvoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<PurchaseInvoice | null>(null);
  const [disputeInvoice, setDisputeInvoice] = useState<PurchaseInvoice | null>(null);
  const [correctInvoice, setCorrectInvoice] = useState<PurchaseInvoice | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Tri ───────────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>('invoice_date');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');

  const { data, isLoading } = usePurchaseInvoices(businessId, {
    page,
    limit: 20,
  });

  const { data: pendingResponses } = usePendingDisputeResponses(businessId);
  const hasResponses = pendingResponses && pendingResponses.length > 0;

  const approve = useApprovePurchaseInvoice(businessId);
  const dispute = useDisputePurchaseInvoice(businessId);
  const resolveDisp = useResolveDispute(businessId);
  const updatePayment = useUpdatePayment(businessId);

  const { exportFacture, loading: pdfLoading } = usePDFExport();

  // ── Tri local ─────────────────────────────────────────────────────────────
  const sorted = [...(data?.data ?? [])].sort((a, b) => {
    let va: any, vb: any;
    if (sortField === 'supplier') { 
      va = a.supplier?.name ?? ''; 
      vb = b.supplier?.name ?? ''; 
    } else if (sortField === 'net_amount') {
      va = Number(a.net_amount);
      vb = Number(b.net_amount);
    } else { 
      va = a[sortField]; 
      vb = b[sortField]; 
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />)
      : <span className="h-3 w-3 inline ml-1 opacity-30">↕</span>;

  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="space-y-6">

      {/* Panneau des réponses fournisseurs */}
      {hasResponses && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-lg font-bold text-green-900">
                Réponses des Fournisseurs ({pendingResponses.length})
              </h2>
              <p className="text-sm text-green-700">
                Des fournisseurs ont répondu à vos demandes de clarification
              </p>
            </div>
          </div>
          <DisputeResponsesPanel businessId={businessId} />
        </div>
      )}

      {/* HEADER avec info explicative */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Factures fournisseurs</h1>
            <p className="text-sm text-gray-500 mt-1">Gérez et suivez toutes vos factures d'achat</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Info className="h-4 w-4" />
              Guide
            </button>

            <button
              onClick={() => window.location.href = '/app/purchases/three-way-matching'}
              className="inline-flex items-center gap-2 px-4 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FileSearch className="h-4 w-4" />
              Contrôle
            </button>

            <button
              onClick={() => setOcrOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30"
            >
              <ScanLine className="h-4 w-4" />
              Scanner
            </button>

            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Saisir
            </button>
          </div>
        </div>

        {/* Info banner pour expliquer le processus */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Info className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Comment gérer vos factures ?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-800">
                <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                    <span className="font-semibold">Facture avec BC</span>
                  </div>
                  <p className="text-blue-700 leading-relaxed">
                    Si la facture a un badge <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 rounded text-green-800 font-semibold"><FileText className="h-3 w-3" />Liée au BC</span>, cliquez sur <span className="font-semibold">Contrôler</span> pour vérifier automatiquement.
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                    <span className="font-semibold">Facture sans BC</span>
                  </div>
                  <p className="text-blue-700 leading-relaxed">
                    Si pas de BC, vérifiez manuellement puis cliquez sur <span className="font-semibold">Approuver</span> pour valider la facture.
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                    <span className="font-semibold">En cas de litige</span>
                  </div>
                  <p className="text-blue-700 leading-relaxed">
                    Si un litige est détecté, vous pouvez <span className="font-semibold">Approuver</span> la facture malgré le litige après vérification, ou <span className="font-semibold">Contacter</span> le fournisseur depuis la page de contrôle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE avec meilleure lisibilité */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4" />
            <p className="text-gray-500 text-sm">Chargement des factures...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  {[
                    { label: 'N° Facture',  field: 'invoice_number_supplier' as SortField },
                    { label: 'Fournisseur', field: 'supplier'                as SortField },
                    { label: 'Date',        field: 'invoice_date'            as SortField },
                    { label: 'Montant TTC', field: 'net_amount'              as SortField },
                  ].map(col => (
                    <th key={col.field}
                      onClick={() => toggleSort(col.field)}
                      className={`px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none transition-colors ${
                        col.field === 'net_amount' ? 'text-right' : 'text-left'
                      }`}>
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!sorted.length ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  sorted.map(inv => {
                    return (
                      <tr key={inv.id} className="hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-200">

                        <td className="px-4 py-4">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {inv.invoice_number_supplier}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900 font-medium">
                            {inv.supplier?.name}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(inv.invoice_date)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-bold text-gray-900">
                            {formatAmount(inv.net_amount)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-col items-center gap-2">
                            {/* Badge de statut principal */}
                            <div className="flex items-center gap-2">
                              {/* Icône de statut */}
                              {inv.status === InvoiceStatus.PENDING && (
                                <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                              )}
                              {inv.status === InvoiceStatus.APPROVED && (
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              )}
                              {inv.status === InvoiceStatus.DISPUTED && (
                                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                              )}
                              {inv.status === InvoiceStatus.PAID && (
                                <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              )}
                              {inv.status === InvoiceStatus.PARTIALLY_PAID && (
                                <CreditCard className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                              )}
                              {inv.status === InvoiceStatus.OVERDUE && (
                                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              )}
                              
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${INVOICE_STATUS_COLORS[inv.status]}`}
                              >
                                {INVOICE_STATUS_LABELS[inv.status]}
                              </span>
                            </div>
                            
                            {/* Badge BC si lié à un bon de commande */}
                            {inv.supplier_po_id && (
                              <span 
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium border border-green-300"
                                title="Cette facture est liée à un bon de commande"
                              >
                                <FileText className="h-3 w-3" />
                                Liée au BC
                              </span>
                            )}
                            
                            {/* Raison du litige si en litige */}
                            {inv.status === InvoiceStatus.DISPUTED && inv.dispute_reason && (
                              <div 
                                className="text-xs text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg max-w-[200px] text-center border border-orange-200 leading-tight" 
                                title={inv.dispute_reason}
                              >
                                {inv.dispute_reason.length > 50 
                                  ? inv.dispute_reason.substring(0, 50) + '...' 
                                  : inv.dispute_reason}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-center items-center gap-1">

                            {/* 1. VOIR DÉTAILS - Toujours visible */}
                            <button
                              onClick={() => setDetailInvoice(inv)}
                              title="Détails"
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* 2. CONTRÔLER - Si BC existe ET statut PENDING */}
                            {inv.supplier_po_id && inv.status === InvoiceStatus.PENDING && (
                              <button
                                onClick={() => window.location.href = `/app/purchases/three-way-matching/${inv.id}`}
                                title="Contrôler"
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <FileSearch className="h-4 w-4" />
                              </button>
                            )}

                            {/* 3. APPROUVER - Si PENDING et PAS de BC */}
                            {inv.status === InvoiceStatus.PENDING && !inv.supplier_po_id && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Voulez-vous approuver la facture ${inv.invoice_number_supplier} ?\n\nCette facture sera marquée comme validée.`)) {
                                    approve.mutate(inv.id);
                                  }
                                }}
                                disabled={approve.isPending}
                                title="Approuver"
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}

                            {/* 4. APPROUVER MALGRÉ LITIGE - Si EN LITIGE */}
                            {inv.status === InvoiceStatus.DISPUTED && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Voulez-vous approuver la facture ${inv.invoice_number_supplier} malgré le litige ?\n\nLe litige sera marqué comme résolu et la facture sera approuvée.`)) {
                                    approve.mutate(inv.id);
                                  }
                                }}
                                disabled={approve.isPending}
                                title="Approuver malgré le litige"
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}

                            {/* 5. PAYER - Si APPROVED ou PARTIALLY_PAID */}
                            {(inv.status === InvoiceStatus.APPROVED || inv.status === InvoiceStatus.PARTIALLY_PAID) && (
                              <button
                                onClick={() => setPaymentInvoice(inv)}
                                title="Payer"
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && (
          <div className="px-6 py-4 border-t-2 border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50">
            <p className="text-sm text-gray-600 font-medium">
              {data.total} facture(s) — page {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              {/* Bouton première page */}
              <button 
                onClick={() => setPage(1)} 
                disabled={page === 1}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                «
              </button>

              {/* Bouton précédent */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Précédent
              </button>

              {/* Numéros de pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - page) <= 1
                )
                .map((p, index, arr) => (
                  <span key={p} className="flex items-center">
                    {index > 0 && arr[index - 1] !== p - 1 && (
                      <span className="px-1 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                        page === p
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}

              {/* Bouton suivant */}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Suivant
              </button>

              {/* Bouton dernière page */}
              <button 
                onClick={() => setPage(totalPages)} 
                disabled={page >= totalPages}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}

      {createOpen && (
        <PurchaseInvoiceModal
          businessId={businessId}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {ocrOpen && (
        <OcrInvoiceModal
          businessId={businessId}
          onClose={() => setOcrOpen(false)}
        />
      )}

      {detailInvoice && (
        <InvoiceDetailModal
          invoice={detailInvoice}
          businessId={businessId}
          onClose={() => setDetailInvoice(null)}
        />
      )}

      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onConfirm={(paid_amount) => {
            updatePayment.mutate({
              id: paymentInvoice.id,
              dto: { paid_amount },
            });
            setPaymentInvoice(null);
          }}
        />
      )}

      {disputeInvoice && (
        <DisputeModal
          invoice={disputeInvoice}
          onClose={() => setDisputeInvoice(null)}
          onConfirm={(reason) => {
            dispute.mutate({
              id: disputeInvoice.id,
              dto: { dispute_reason: reason },
            });
            setDisputeInvoice(null);
          }}
        />
      )}

      {correctInvoice && (
        <CorrectInvoiceModal
          businessId={businessId}
          invoice={correctInvoice}
          onClose={() => setCorrectInvoice(null)}
        />
      )}

      {showGuide && (
        <InvoiceProcessGuide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}