// src/pages/backoffice/purchases/GoodsReceiptsPage.tsx
import { useState } from 'react';
import { Eye, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useSupplierPOs } from '@/hooks/useSupplierPOs';
import { useGoodsReceiptsByPO } from '@/hooks/useGoodsReceipts';
import { usePDFExport } from '@/hooks/usePDFExport';
import PDFButton from '@/components/purchases/PDFButton';

import SupplierPODetailModal from '@/components/purchases/SupplierPODetailModal';
import { formatDate, GoodsReceipt, PO_STATUS_COLORS, PO_STATUS_LABELS, POStatus, SupplierPO } from '@/types';


// ── Sous-composant : ligne d'un BC avec ses BRs dépliables ───────────────────
function PORow({ businessId, po }: { businessId: string; po: SupplierPO }) {
  const [open, setOpen] = useState(false);
  const [detailPO, setDetailPO] = useState(false);

  const { data: receipts, isLoading } = useGoodsReceiptsByPO(
    businessId,
    open ? po.id : '',
  );

  const canReceive = [POStatus.CONFIRMED, POStatus.PARTIALLY_RECEIVED].includes(po.status);

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            {open
              ? <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              : <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            }
            <span className="font-mono font-medium text-gray-900">{po.po_number}</span>
          </div>
        </td>

        <td className="px-4 py-4 text-gray-700 text-sm">{po.supplier?.name}</td>
        <td className="px-4 py-4 text-gray-600 text-sm">{formatDate(po.created_at)}</td>

        <td className="px-4 py-4 text-center">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${PO_STATUS_COLORS[po.status]}`}>
            {PO_STATUS_LABELS[po.status]}
          </span>
        </td>

        <td className="px-4 py-4 text-center text-sm text-gray-600">
          {po.items?.reduce((s, i) => s + Number(i.quantity_ordered), 0)} /
          {po.items?.reduce((s, i) => s + Number(i.quantity_received), 0)} reçus
        </td>

        <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setDetailPO(true)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Voir détail et créer BR"
          >
            <Eye className="h-4 w-4" />
          </button>
        </td>
      </tr>

      {/* Bons de réception dépliables */}
      {open && (
        <tr>
          <td colSpan={6} className="px-0 py-0 bg-indigo-50/30">
            <div className="px-8 py-3">
              {isLoading ? (
                <p className="text-sm text-gray-500 py-2">Chargement...</p>
              ) : !receipts?.length ? (
                <p className="text-sm text-gray-500 py-2 italic">
                  Aucun bon de réception pour ce BC
                  {canReceive && ' — ouvrez le détail pour en créer un'}
                </p>
              ) : (
                <div className="space-y-2">
                  {receipts.map(gr => (
                    <GRCard key={gr.id} gr={gr} />
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {detailPO && (
        <SupplierPODetailModal
          businessId={businessId}
          po={po}
          onClose={() => setDetailPO(false)}
        />
      )}
    </>
  );
}


// ── Sous-composant : carte d'un bon de réception ─────────────────────────────
function GRCard({ gr }: { gr: GoodsReceipt }) {

  const [open, setOpen] = useState(false);
  const { exportBR, loading } = usePDFExport();

  return (
    <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden">

      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-indigo-50/50 transition-colors"
      >

        <div className="flex items-center gap-3">
          <Package className="h-4 w-4 text-indigo-400 flex-shrink-0" />

          <div>
            <span className="font-mono font-medium text-gray-900 text-sm">
              {gr.gr_number}
            </span>

            <span className="ml-3 text-xs text-gray-500">
              {formatDate(gr.receipt_date)} · {gr.items?.length} ligne(s)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">

          {/* Télécharger PDF BR */}
          <PDFButton
            variant="icon"
            label="Télécharger BR PDF"
            loading={loading}
            onClick={(e) => {
              e.stopPropagation();
              exportBR(gr);
            }}
          />

          {open
            ? <ChevronDown className="h-4 w-4 text-gray-400" />
            : <ChevronRight className="h-4 w-4 text-gray-400" />
          }

        </div>
      </button>

      {open && gr.items?.length > 0 && (
        <div className="border-t border-indigo-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Description</th>
                <th className="text-center px-4 py-2 text-xs text-gray-500">Qté reçue</th>
                <th className="text-right px-4 py-2 text-xs text-gray-500">PU HT</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {gr.items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-gray-700">
                    {item.supplier_po_item?.description ?? '—'}
                  </td>

                  <td className="px-4 py-2 text-center font-medium text-green-700">
                    {item.quantity_received}
                  </td>

                  <td className="px-4 py-2 text-right text-gray-600">
                    {Number(item.unit_price_ht).toFixed(3)} TND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {gr.notes && (
            <p className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
              Note : {gr.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}


// ── Page principale ───────────────────────────────────────────────────────────
export default function GoodsReceiptsPage() {
  const { user } = useAuth();
  const businessId = (user as any)?.business_id ?? '';

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSupplierPOs(businessId, {
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const STATUS_OPTIONS = [
    { value: '', label: 'Tous les BCs' },
    { value: POStatus.CONFIRMED, label: 'Confirmés' },
    { value: POStatus.PARTIALLY_RECEIVED, label: 'Partiellement reçus' },
    { value: POStatus.FULLY_RECEIVED, label: 'Entièrement reçus' },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bons de Réception</h1>
        <p className="text-gray-500">
          Historique des réceptions par bon de commande. Cliquez sur un BC pour voir ses BRs.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              statusFilter === opt.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

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
                  <th className="text-left px-4 py-4 text-sm font-semibold text-gray-900">N° BC</th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-gray-900">Fournisseur</th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-900">Statut</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-900">Réception</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!data?.data.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Aucun bon de commande trouvé
                    </td>
                  </tr>
                ) : data.data.map(po => (
                  <PORow key={po.id} businessId={businessId} po={po} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && (data.total_pages ?? 1) > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">{data.total} BCs</p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= (data.total_pages ?? 1)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}