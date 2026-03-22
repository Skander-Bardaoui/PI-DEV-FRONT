// src/pages/backoffice/purchases/PurchaseInvoicesPage.tsx
import { useState } from 'react';
import {
  Plus, Eye, Check, AlertTriangle, CheckCircle,
  CreditCard, ChevronUp, ChevronDown, Filter, Pencil,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  usePurchaseInvoices,
  useApprovePurchaseInvoice,
  useDisputePurchaseInvoice,
  useResolveDispute,
  useUpdatePayment,
} from '@/hooks/usePurchaseInvoices';
import { useSuppliers }      from '@/hooks/useSuppliers';
import { usePDFExport }      from '@/hooks/usePDFExport';
import PurchaseInvoiceModal  from '@/components/purchases/PurchaseInvoiceModal';
import CorrectInvoiceModal   from '@/components/purchases/CorrectInvoiceModal';

import PDFButton             from '@/components/purchases/PDFButton';
import {
  formatAmount, formatDate,
  INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS,
  InvoiceStatus, PurchaseInvoice,
} from '@/types';
import DisputeModal from '@/components/purchases/Disputemodal ';
import { PaymentModal } from '@/components/purchases/Paymentmodal';
import InvoiceDetailModal from '@/components/purchases/Invoicedetailmodal ';

type SortField = 'invoice_number_supplier' | 'invoice_date' | 'due_date' | 'net_amount' | 'supplier';
type SortDir   = 'asc' | 'desc';

const STATUS_OPTIONS = [
  { value: '',                           label: 'Tous les statuts'     },
  { value: InvoiceStatus.PENDING,         label: 'En attente'           },
  { value: InvoiceStatus.APPROVED,        label: 'Approuvées'           },
  { value: InvoiceStatus.PARTIALLY_PAID,  label: 'Partiellement payées' },
  { value: InvoiceStatus.PAID,            label: 'Payées'               },
  { value: InvoiceStatus.OVERDUE,         label: 'En retard'            },
  { value: InvoiceStatus.DISPUTED,        label: 'En litige'            },
];

export default function PurchaseInvoicesPage() {
  const { user }   = useAuth();
  const businessId = (user as any)?.business_id ?? '';

  // Filtres
  const [statusFilter,   setStatusFilter]   = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [showFilters,    setShowFilters]    = useState(false);
  const [page,           setPage]           = useState(1);

  // ANOMALIE 4 : tri géré comme paramètre API, pas en JS local
  const [sortField, setSortField] = useState<SortField>('invoice_date');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');

  // Modals
  const [createOpen,     setCreateOpen]     = useState(false);
  const [detailInvoice,  setDetailInvoice]  = useState<PurchaseInvoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<PurchaseInvoice | null>(null);
  const [disputeInvoice, setDisputeInvoice] = useState<PurchaseInvoice | null>(null);
  const [correctInvoice, setCorrectInvoice] = useState<PurchaseInvoice | null>(null);

  // ANOMALIE 4 : sort_field et sort_dir passés à l'API → tri côté backend sur toutes les pages
  const { data, isLoading } = usePurchaseInvoices(businessId, {
    status:      statusFilter   || undefined,
    supplier_id: supplierFilter || undefined,
    date_from:   dateFrom       || undefined,
    date_to:     dateTo         || undefined,
    sort_field:  sortField,
    sort_dir:    sortDir,
    page,
    limit: 20,
  });

  const { data: suppliersData } = useSuppliers(businessId, { is_active: true, limit: 100 });

  const approve       = useApprovePurchaseInvoice(businessId);
  const dispute       = useDisputePurchaseInvoice(businessId);
  const resolveDisp   = useResolveDispute(businessId);
  const updatePayment = useUpdatePayment(businessId);

  const { exportFacture, loading: pdfLoading } = usePDFExport();

  // ANOMALIE 4 : plus de tri local JS — on passe tout à l'API
  // Quand on change le tri, on retourne à la page 1 pour éviter l'incohérence
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1); // retour page 1 obligatoire quand le tri change
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? (sortDir === 'asc'
          ? <ChevronUp   className="h-3 w-3 inline ml-1" />
          : <ChevronDown className="h-3 w-3 inline ml-1" />)
      : <span className="h-3 w-3 inline ml-1 opacity-30">↕</span>;

  const hasActiveFilters = statusFilter || supplierFilter || dateFrom || dateTo;

  const clearFilters = () => {
    setStatusFilter(''); setSupplierFilter('');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  const overdueCount = data?.data.filter(i => i.status === InvoiceStatus.OVERDUE).length ?? 0;

  // ANOMALIE 4 : les données sont déjà triées par le backend — pas de .sort() ici
  const invoices = data?.data ?? [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures Fournisseurs</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} facture(s) fournisseur</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
              hasActiveFilters
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres {hasActiveFilters && '(actifs)'}
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Saisir une facture
          </button>
        </div>
      </div>

      {/* Alerte OVERDUE */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 font-medium">
            {overdueCount} facture{overdueCount > 1 ? 's' : ''} en retard de paiement
          </p>
          <button
            onClick={() => { setStatusFilter(InvoiceStatus.OVERDUE); setPage(1); }}
            className="ml-auto text-xs text-red-700 underline hover:no-underline"
          >
            Filtrer
          </button>
        </div>
      )}

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
              <select value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fournisseur</label>
              <select value={supplierFilter}
                onChange={e => { setSupplierFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">Tous les fournisseurs</option>
                {suppliersData?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date de</label>
              <input type="date" value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date à</label>
              <input type="date" value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 underline">
              Effacer tous les filtres
            </button>
          )}
        </div>
      )}

      {/* Pills statut */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(opt => (
          <button key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              statusFilter === opt.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}>
            {opt.label}
            {opt.value && (
              <span className="ml-1 text-xs opacity-70">
                ({data?.data.filter(i => i.status === opt.value).length ?? 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Note sur le tri */}
      {data && data.total > 20 && (
        <p className="text-xs text-gray-400 text-right">
          Le tri s'applique sur l'ensemble des {data.total} factures (toutes les pages).
        </p>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {([
                    { label: 'N° Facture',   field: 'invoice_number_supplier' },
                    { label: 'Fournisseur',  field: 'supplier'                },
                    { label: 'Date facture', field: 'invoice_date'            },
                    { label: 'Échéance',     field: 'due_date'                },
                    { label: 'Net TTC',      field: 'net_amount'              },
                  ] as { label: string; field: SortField }[]).map(col => (
                    <th key={col.field}
                      onClick={() => toggleSort(col.field)}
                      className="text-left px-4 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                  <th className="text-right px-4 py-4 text-sm font-semibold text-gray-900">Reste à payer</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-900">Statut</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!invoices.length ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : invoices.map(inv => {
                  const remaining = Math.round(
                    (Number(inv.net_amount) - Number(inv.paid_amount)) * 1000,
                  ) / 1000;
                  const isOverdue = inv.status === InvoiceStatus.OVERDUE;
                  return (
                    <tr key={inv.id}
                      className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50/40' : ''}`}>
                      <td className="px-4 py-4 font-mono text-sm font-medium text-gray-900">
                        {inv.invoice_number_supplier}
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-sm">{inv.supplier?.name}</td>
                      <td className="px-4 py-4 text-gray-600 text-sm">{formatDate(inv.invoice_date)}</td>
                      <td className={`px-4 py-4 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900 text-sm">
                        {formatAmount(inv.net_amount)}
                      </td>
                      <td className={`px-4 py-4 text-right font-semibold text-sm ${
                        remaining <= 0 ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {formatAmount(remaining)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${INVOICE_STATUS_COLORS[inv.status]}`}>
                          {INVOICE_STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setDetailInvoice(inv)} title="Voir détail"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <PDFButton variant="icon" label="PDF" loading={pdfLoading} onClick={() => exportFacture(inv)} />
                          {inv.status === InvoiceStatus.PENDING && (
                            <button onClick={() => approve.mutate(inv.id)} disabled={approve.isPending}
                              title="Approuver"
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {[InvoiceStatus.APPROVED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE].includes(inv.status) && (
                            <button onClick={() => setPaymentInvoice(inv)} title="Enregistrer un paiement"
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                              <CreditCard className="h-4 w-4" />
                            </button>
                          )}
                          {![InvoiceStatus.PAID, InvoiceStatus.DISPUTED].includes(inv.status) && (
                            <button onClick={() => setDisputeInvoice(inv)} title="Mettre en litige"
                              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}
                          {inv.status === InvoiceStatus.DISPUTED && (
                            <>
                              <button onClick={() => setCorrectInvoice(inv)} title="Corriger / Résoudre"
                                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => resolveDisp.mutate(inv.id)} disabled={resolveDisp.isPending}
                                title="Résoudre sans correction"
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && (data.total_pages ?? 1) > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {data.total} factures — page {page} / {data.total_pages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
                Précédent
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= (data.total_pages ?? 1)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {createOpen && <PurchaseInvoiceModal businessId={businessId} onClose={() => setCreateOpen(false)} />}
      {detailInvoice && <InvoiceDetailModal invoice={detailInvoice} businessId={businessId} onClose={() => setDetailInvoice(null)} />}
      {paymentInvoice && (
        <PaymentModal invoice={paymentInvoice} onClose={() => setPaymentInvoice(null)}
          onConfirm={(paid_amount) => {
            updatePayment.mutate({ id: paymentInvoice.id, dto: { paid_amount } });
            setPaymentInvoice(null);
          }} />
      )}
      {disputeInvoice && (
        <DisputeModal invoice={disputeInvoice} onClose={() => setDisputeInvoice(null)}
          onConfirm={(reason) => {
            dispute.mutate({ id: disputeInvoice.id, dto: { dispute_reason: reason } });
            setDisputeInvoice(null);
          }} />
      )}
      {correctInvoice && (
        <CorrectInvoiceModal businessId={businessId} invoice={correctInvoice}
          onClose={() => setCorrectInvoice(null)} />
      )}
    </div>
  );
}