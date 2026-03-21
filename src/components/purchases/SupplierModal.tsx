// src/components/purchases/SupplierModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateSupplier, useUpdateSupplier } from '../../hooks/useSuppliers';
import { CreateSupplierDto, Supplier } from '@/types';

interface Props {
  businessId: string;
  supplier:   Supplier | null;
  onClose:    () => void;
}

export default function SupplierModal({ businessId, supplier, onClose }: Props) {
  const isEdit = !!supplier;
  const create = useCreateSupplier(businessId);
  const update = useUpdateSupplier(businessId, supplier?.id ?? '');

  const [form, setForm] = useState<CreateSupplierDto>({
    name:             '',
    matricule_fiscal: '',
    email:            '',
    phone:            '',
    rib:              '',
    bank_name:        '',
    payment_terms:    30,
    category:         '',
    notes:            '',
    address: { street: '', city: '', postal_code: '', country: 'Tunisie' },
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (supplier) {
      setForm({
        name:             supplier.name,
        matricule_fiscal: supplier.matricule_fiscal ?? '',
        email:            supplier.email ?? '',
        phone:            supplier.phone ?? '',
        rib:              supplier.rib ?? '',
        bank_name:        supplier.bank_name ?? '',
        payment_terms:    supplier.payment_terms,
        category:         supplier.category ?? '',
        notes:            supplier.notes ?? '',
        address: {
          street:      supplier.address?.street ?? '',
          city:        supplier.address?.city ?? '',
          postal_code: supplier.address?.postal_code ?? '',
          country:     supplier.address?.country ?? 'Tunisie',
        },
      });
    }
  }, [supplier]);

  const set = (key: keyof CreateSupplierDto, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  const setAddr = (key: string, value: string) =>
    setForm(f => ({ ...f, address: { ...f.address, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const dto: CreateSupplierDto = {
      ...form,
      matricule_fiscal: form.matricule_fiscal || undefined,
      email:            form.email || undefined,
      phone:            form.phone || undefined,
      rib:              form.rib || undefined,
      bank_name:        form.bank_name || undefined,
      category:         form.category || undefined,
      notes:            form.notes || undefined,
    };

    try {
      if (isEdit) {
        await update.mutateAsync(dto);
      } else {
        await create.mutateAsync(dto);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Une erreur est survenue');
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {Array.isArray(error) ? error.join(', ') : error}
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur *</label>
            <input
              type="text" required value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Société Exemple SARL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Matricule fiscal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matricule fiscal</label>
              <input
                type="text" value={form.matricule_fiscal}
                onChange={e => set('matricule_fiscal', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="1234567/A/B/C/000"
              />
            </div>
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <input
                type="text" value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Matières premières, IT..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="contact@fournisseur.tn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel" value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="+216 71 000 000"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text" value={form.address?.street}
              onChange={e => setAddr('street', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
              placeholder="Rue"
            />
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.address?.city}
                onChange={e => setAddr('city', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ville" />
              <input type="text" value={form.address?.postal_code}
                onChange={e => setAddr('postal_code', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Code postal" />
              <input type="text" value={form.address?.country}
                onChange={e => setAddr('country', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Pays" />
            </div>
          </div>

          {/* Banque */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RIB</label>
              <input type="text" value={form.rib}
                onChange={e => set('rib', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="07 123 0123456789 12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banque</label>
              <input type="text" value={form.bank_name}
                onChange={e => set('bank_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="STB, BNA, BIAT..." />
            </div>
          </div>

          {/* Délai paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Délai de paiement (jours)
            </label>
            <input type="number" min={0} max={365} value={form.payment_terms}
              onChange={e => set('payment_terms', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={3} value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Informations complémentaires..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {isPending ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}