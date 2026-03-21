// src/pages/backoffice/purchases/SupplierPOsPage.tsx
import { useState } from 'react';
import { Plus, Eye, Send, Check, X, Search } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  useSupplierPOs,
  useSendSupplierPO,
  useConfirmSupplierPO,
  useCancelSupplierPO,
} from '../../../hooks/useSupplierPOs';
import { formatAmount, formatDate, PO_STATUS_COLORS, PO_STATUS_LABELS, POStatus, SupplierPO } from '@/types';
import SupplierPOModal from '@/components/purchases/SupplierPOModal';
import SupplierPODetailModal from '@/components/purchases/SupplierPODetailModal';


const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: POStatus.DRAFT, label: 'Brouillon' },
  { value: POStatus.SENT, label: 'Envoyé' },
  { value: POStatus.CONFIRMED, label: 'Confirmé' },
  { value: POStatus.PARTIALLY_RECEIVED, label: 'Partiellement reçu' },
  { value: POStatus.FULLY_RECEIVED, label: 'Entièrement reçu' },
  { value: POStatus.CANCELLED, label: 'Annulé' },
];

export default function SupplierPOsPage() {
  const { user } = useAuth();
  const businessId = user?.business_id ?? '';

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(1);
  const [modalOpen, setModalOpen]       = useState(false);
  const [detailPO, setDetailPO]         = useState<SupplierPO | null>(null);

  const { data, isLoading } = useSupplierPOs(businessId, {
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const send    = useSendSupplierPO(businessId);
  const confirm = useConfirmSupplierPO(businessId);
  const cancel  = useCancelSupplierPO(businessId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bons de Commande</h1>
          <p className="text-gray-500">Gérez vos commandes fournisseurs</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouveau BC
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">N° BC</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Fournisseur</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Net TTC</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Statut</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Aucun bon de commande
                    </td>
                  </tr>
                ) : data?.data.map(po => (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{po.po_number}</td>
                    <td className="px-6 py-4 text-gray-700">{po.supplier?.name}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(po.created_at)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatAmount(po.net_amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${PO_STATUS_COLORS[po.status]}`}>
                        {PO_STATUS_LABELS[po.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailPO(po)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {po.status === POStatus.DRAFT && (
                          <button
                            onClick={() => send.mutate(po.id)}
                            disabled={send.isPending}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Envoyer"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {po.status === POStatus.SENT && (
                          <button
                            onClick={() => confirm.mutate(po.id)}
                            disabled={confirm.isPending}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Confirmer"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {[POStatus.DRAFT, POStatus.SENT].includes(po.status) && (
                          <button
                            onClick={() => {
                                if (window.confirm('Annuler ce BC ?')) cancel.mutate(po.id);
                            }}
                            disabled={cancel.isPending}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && (data.total_pages ?? 1) > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">{data.total} BCs — page {page}</p>
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

      {modalOpen && (
        <SupplierPOModal businessId={businessId} onClose={() => setModalOpen(false)} />
      )}

      {detailPO && (
        <SupplierPODetailModal
          businessId={businessId}
          po={detailPO}
          onClose={() => setDetailPO(null)}
        />
      )}
    </div>
  );
}