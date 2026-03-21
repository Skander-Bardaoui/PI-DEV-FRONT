// src/pages/backoffice/purchases/SuppliersPage.tsx
import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, RotateCcw, Eye,
  Phone, Mail, Building2,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  useSuppliers,
  useArchiveSupplier,
  useRestoreSupplier,
} from '@/hooks/useSuppliers';

import SupplierModal from '@/components/purchases/SupplierModal';
import { formatDate, Supplier } from '@/types';

export default function SuppliersPage() {
  const { user } = useAuth();
  const businessId = (user as any)?.business_id ?? '';

  const [search, setSearch]             = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage]                 = useState(1);
  const [modalOpen, setModalOpen]       = useState(false);
  const [selected, setSelected]         = useState<Supplier | null>(null);
  const [detailOpen, setDetailOpen]     = useState(false);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  // ── FIX BUG 2 : ne pas envoyer is_active quand showInactive=true ──────────
    const { data, isLoading } = useSuppliers(businessId, {
    search: search || undefined,
    ...(showInactive ? {} : { is_active: true }),
    page,
    limit: 20,
    });

  const archive = useArchiveSupplier(businessId);
  const restore = useRestoreSupplier(businessId);

  const openCreate = () => { setSelected(null); setModalOpen(true); };
  const openEdit   = (s: Supplier) => { setSelected(s); setModalOpen(true); };
  const openDetail = (s: Supplier) => { setDetailSupplier(s); setDetailOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500">Gérez vos fournisseurs et leurs informations</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouveau fournisseur
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total fournisseurs</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.data.filter(s => s.is_active).length ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Archivés</p>
          <p className="text-2xl font-bold text-gray-400">
            {data?.data.filter(s => !s.is_active).length ?? 0}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par nom, email, téléphone, catégorie, matricule..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={e => { setShowInactive(e.target.checked); setPage(1); }}
              className="h-4 w-4 text-indigo-600 rounded"
            />
            Afficher les archivés
          </label>
        </div>
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Fournisseur</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Catégorie</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Délai</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Statut</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!data?.data.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Aucun fournisseur trouvé
                    </td>
                  </tr>
                ) : data.data.map(s => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${!s.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          s.is_active ? 'bg-indigo-100' : 'bg-gray-100'
                        }`}>
                          <Building2 className={`h-5 w-5 ${s.is_active ? 'text-indigo-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          {s.matricule_fiscal && (
                            <p className="text-xs text-gray-500 font-mono">{s.matricule_fiscal}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {s.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{s.email}</span>
                          </div>
                        )}
                        {s.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" /> {s.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.category ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {s.category}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{s.payment_terms}j</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {s.is_active ? 'Actif' : 'Archivé'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openDetail(s)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Voir">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(s)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier">
                          <Edit className="h-4 w-4" />
                        </button>
                        {s.is_active ? (
                          <button onClick={() => archive.mutate(s.id)} disabled={archive.isPending}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Archiver">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button onClick={() => restore.mutate(s.id)} disabled={restore.isPending}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Restaurer">
                            <RotateCcw className="h-4 w-4" />
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

        {/* Pagination */}
        {data && (data.total_pages ?? 1) > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {data.total} fournisseurs — page {page} / {data.total_pages}
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

      {modalOpen && (
        <SupplierModal businessId={businessId} supplier={selected} onClose={() => setModalOpen(false)} />
      )}

      {detailOpen && detailSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{detailSupplier.name}</h2>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {detailSupplier.matricule_fiscal && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Matricule fiscal</span>
                  <span className="font-mono font-medium">{detailSupplier.matricule_fiscal}</span>
                </div>
              )}
              {detailSupplier.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span>{detailSupplier.email}</span>
                </div>
              )}
              {detailSupplier.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Téléphone</span>
                  <span>{detailSupplier.phone}</span>
                </div>
              )}
              {detailSupplier.rib && (
                <div className="flex justify-between">
                  <span className="text-gray-500">RIB</span>
                  <span className="font-mono">{detailSupplier.rib}</span>
                </div>
              )}
              {detailSupplier.bank_name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Banque</span>
                  <span>{detailSupplier.bank_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Délai paiement</span>
                <span className="font-medium">{detailSupplier.payment_terms} jours</span>
              </div>
              {detailSupplier.address?.city && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ville</span>
                  <span>{detailSupplier.address.city}</span>
                </div>
              )}
              {detailSupplier.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700">{detailSupplier.notes}</p>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Créé le</span>
                <span>{formatDate(detailSupplier.created_at)}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setDetailOpen(false); openEdit(detailSupplier); }}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                Modifier
              </button>
              <button onClick={() => setDetailOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}