// src/pages/backoffice/StockMovements.tsx
import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import MovementTable from '../../components/stock/MovementTable';
import { StockMovement } from '../../types/stockMovement';

// Mock data
const mockProducts = [
  { id: '1', name: 'Laptop Dell XPS 15', sku: 'LAP-001' },
  { id: '2', name: 'Souris Logitech MX Master 3', sku: 'ACC-045' },
  { id: '3', name: 'Clavier Mécanique RGB', sku: 'ACC-023' },
  { id: '4', name: 'Écran Samsung 27" 4K', sku: 'MON-012' },
  { id: '5', name: 'Webcam HD Pro', sku: 'ACC-089' },
  { id: '6', name: 'Laptop HP ProBook 450', sku: 'LAP-002' }
];

const mockMovements: StockMovement[] = [
  {
    id: 'mov-1',
    productId: '1',
    type: 'IN',
    quantity: 15,
    reference: 'PO-2024-001',
    note: 'Commande fournisseur Dell',
    createdAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: 'mov-2',
    productId: '2',
    type: 'OUT',
    quantity: 8,
    reference: 'SO-2024-045',
    note: 'Vente client ABC Corp',
    createdAt: new Date('2024-01-14T14:20:00')
  },
  {
    id: 'mov-3',
    productId: '3',
    type: 'ADJUSTMENT',
    quantity: 3,
    reference: 'ADJ-2024-012',
    note: 'Correction inventaire',
    createdAt: new Date('2024-01-14T09:15:00')
  },
  {
    id: 'mov-4',
    productId: '4',
    type: 'IN',
    quantity: 10,
    reference: 'PO-2024-002',
    note: 'Réception Samsung',
    createdAt: new Date('2024-01-13T16:45:00')
  },
  {
    id: 'mov-5',
    productId: '5',
    type: 'OUT',
    quantity: 5,
    reference: 'SO-2024-046',
    note: 'Vente client XYZ Ltd',
    createdAt: new Date('2024-01-12T11:30:00')
  },
  {
    id: 'mov-6',
    productId: '6',
    type: 'IN',
    quantity: 20,
    reference: 'PO-2024-003',
    note: 'Commande HP',
    createdAt: new Date('2024-01-11T08:00:00')
  },
  {
    id: 'mov-7',
    productId: '1',
    type: 'OUT',
    quantity: 3,
    reference: 'SO-2024-047',
    note: 'Vente entreprise Tech Solutions',
    createdAt: new Date('2024-01-10T15:20:00')
  },
  {
    id: 'mov-8',
    productId: '2',
    type: 'ADJUSTMENT',
    quantity: 2,
    reference: 'ADJ-2024-013',
    note: 'Produits endommagés',
    createdAt: new Date('2024-01-09T13:10:00')
  }
];

export default function StockMovements() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredMovements = mockMovements.filter(movement => {
    const product = mockProducts.find(p => p.id === movement.productId);
    const matchesSearch = product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product?.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          movement.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalMovements = mockMovements.length;
  const inMovements = mockMovements.filter(m => m.type === 'IN').length;
  const outMovements = mockMovements.filter(m => m.type === 'OUT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mouvements de Stock</h1>
          <p className="text-gray-500">Historique des entrées et sorties</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="h-5 w-5" />
          Nouveau mouvement
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total mouvements</p>
          <p className="text-2xl font-bold text-gray-900">{totalMovements}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Entrées</p>
          <p className="text-2xl font-bold text-green-600">{inMovements}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Sorties</p>
          <p className="text-2xl font-bold text-red-600">{outMovements}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un mouvement..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les types</option>
              <option value="IN">Entrées</option>
              <option value="OUT">Sorties</option>
              <option value="ADJUSTMENT">Ajustements</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <MovementTable movements={filteredMovements} products={mockProducts} />

      {/* Results count */}
      <div className="text-center text-sm text-gray-500">
        Affichage de {filteredMovements.length} sur {totalMovements} mouvements
      </div>
    </div>
  );
}
