// src/pages/backoffice/purchases/SuppliersPage.tsx
import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, RotateCcw, Eye,
  Phone, Mail, Building2, ChevronUp, ChevronDown, Filter,
} from 'lucide-react';
import { useAuth }             from '../../../hooks/useAuth';
import {
  useSuppliers,
  useArchiveSupplier,
  useRestoreSupplier,
} from '@/hooks/useSuppliers';
import { useSupplierPOs }      from '@/hooks/useSupplierPOs';
import { usePurchaseInvoices } from '@/hooks/usePurchaseInvoices';
import { usePDFExport }        from '@/hooks/usePDFExport';
import SupplierModal           from '@/components/purchases/SupplierModal';
import PDFButton               from '@/components/purchases/PDFButton';
import { formatDate, Supplier } from '@/types';


// ── Types tri ────────────────────────────────────────────────────────────────
type SortField = 'name' | 'payment_terms' | 'category' | 'created_at';
type SortDir   = 'asc' | 'desc';

// ── Options catégories (adapter selon vos données) ────────────────────────────
const CATEGORY_OPTIONS = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'Matières premières',  label: 'Matières premières'  },
  { value: 'Services',            label: 'Services'            },
  { value: 'Fournitures',         label: 'Fournitures'         },
  { value: 'IT',                  label: 'IT'                  },
  { value: 'Logistique',          label: 'Logistique'          },
];

export default function SuppliersPage() {
  const { user } = useAuth();
  const businessId = (user as any)?.business_id ?? '';

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [search,         setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showInactive,   setShowInactive]   = useState(false);
  const [showFilters,    setShowFilters]    = useState(false);
  const [page,           setPage]           = useState(1);

  // ── Tri ───────────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir,   setSortDir]   = useState<SortDir>('asc');

  // ── Modals ────────────────────────────────────────────────────────────────
  const [modalOpen,      setModalOpen]      = useState(false);
  const [selected,       setSelected]       = useState<Supplier | null>(null);
  const [detailOpen,     setDetailOpen]     = useState(false);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  // ── Data liste ────────────────────────────────────────────────────────────
  const { data, isLoading } = useSuppliers(businessId, {
    search:   search || undefined,
    category: categoryFilter || undefined,
    // FIX : quand showInactive=true → ne pas envoyer is_active (retourner tous)
    //        quand showInactive=false → envoyer is_active=true (actifs uniquement)
    ...(showInactive ? {} : { is_active: true }),
    page,
    limit: 20,
  });

  const archive = useArchiveSupplier(businessId);
  const restore = useRestoreSupplier(businessId);

  // ── PDF relevé de compte ──────────────────────────────────────────────────
  const { exportReleve, loading: pdfLoading } = usePDFExport();
  const { data: posData } = useSupplierPOs(businessId, {
    supplier_id: detailSupplier?.id,
    limit: 100,
  });
  const { data: invData } = usePurchaseInvoices(businessId, {
    supplier_id: detailSupplier?.id,
    limit: 100,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const openCreate = () => { setSelected(null); setModalOpen(true); };
  const openEdit   = (s: Supplier) => { setSelected(s); setModalOpen(true); };
  const openDetail = (s: Supplier) => { setDetailSupplier(s); setDetailOpen(true); };

  // ── Tri local ─────────────────────────────────────────────────────────────
  const sorted = [...(data?.data ?? [])].sort((a, b) => {
    let va: any, vb: any;
    if      (sortField === 'payment_terms') { va = Number(a.payment_terms); vb = Number(b.payment_terms); }
    else if (sortField === 'category')      { va = a.category ?? ''; vb = b.category ?? ''; }
    else if (sortField === 'created_at')    { va = a.created_at; vb = b.created_at; }
    else { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
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
      ? (sortDir === 'asc'
          ? <ChevronUp   className="h-3 w-3 inline ml-1" />
          : <ChevronDown className="h-3 w-3 inline ml-1" />)
      : <span className="h-3 w-3 inline ml-1 opacity-30">↕</span>;

  const hasActiveFilters = search || categoryFilter || showInactive;

  const clearFilters = () => {
    setSearch(''); setCategoryFilter('');
    setShowInactive(false); setPage(1);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500 text-sm">
            {data?.total ?? 0} fournisseur(s) au total
          </p>
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
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
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
          <p className="text-sm text-gray-500">
            {showInactive ? 'Archivés affichés' : 'Affichés'}
          </p>
          <p className="text-2xl font-bold text-gray-900">{data?.data.length ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">sur {data?.total ?? 0} au total</p>
        </div>
      </div>

      {/* ── Filtres avancés dépliables ──────────────────────────────────────── */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Nom, MF, email, téléphone..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {/* Catégorie */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {/* Toggle archivés */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer py-2">
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
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>
      )}

      {/* Barre de recherche rapide (toujours visible) */}
      {!showFilters && (
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
      )}

      {/* ── Tableau ─────────────────────────────────────────────────────────── */}
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
                  {/* Colonnes triables */}
                  {[
                    { label: 'Fournisseur', field: 'name'          as SortField },
                    { label: 'Catégorie',   field: 'category'      as SortField },
                    { label: 'Délai',       field: 'payment_terms' as SortField },
                  ].map(col => (
                    <th
                      key={col.field}
                      onClick={() => toggleSort(col.field)}
                      className="text-left px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none transition-colors"
                    >
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Contact</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Statut</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!sorted.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Aucun fournisseur trouvé
                    </td>
                  </tr>
                ) : sorted.map(s => (
                  <tr
                    key={s.id}
                    className={`hover:bg-gray-50 transition-colors ${!s.is_active ? 'opacity-60' : ''}`}
                  >
                    {/* Nom + MF */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
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

                    {/* Catégorie */}
                    <td className="px-6 py-4">
                      {s.category ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {s.category}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>

                    {/* Délai */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{s.payment_terms}j</span>
                    </td>

                    {/* Contact */}
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

                    {/* Statut */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {s.is_active ? 'Actif' : 'Archivé'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openDetail(s)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {s.is_active ? (
                          <button
                            onClick={() => archive.mutate(s.id)}
                            disabled={archive.isPending}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Archiver"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => restore.mutate(s.id)}
                            disabled={restore.isPending}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Restaurer"
                          >
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

      {/* ── Modal Création / Modification ──────────────────────────────────── */}
      {modalOpen && (
        <SupplierModal
          businessId={businessId}
          supplier={selected}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── Modal Détail ────────────────────────────────────────────────────── */}
      {detailOpen && detailSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{detailSupplier.name}</h2>
              <button
                onClick={() => setDetailOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
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
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Modifier
              </button>
              <PDFButton
                variant="ghost"
                label="Relevé PDF"
                loading={pdfLoading}
                onClick={() => exportReleve(
                  detailSupplier,
                  posData?.data ?? [],
                  invData?.data ?? [],
                )}
              />
              <button
                onClick={() => setDetailOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}