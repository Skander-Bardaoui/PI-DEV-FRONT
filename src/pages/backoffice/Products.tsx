// src/pages/backoffice/Products.tsx
import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import ProductTable from '../../components/stock/ProductTable';
import { Product } from '../../types/product';

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Dell XPS 15',
    sku: 'LAP-001',
    description: 'Ordinateur portable haute performance',
    price: 4500,
    cost: 3200,
    quantity: 15,
    minQuantity: 10,
    isActive: true,
    categoryId: 'cat-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Souris Logitech MX Master 3',
    sku: 'ACC-045',
    description: 'Souris sans fil ergonomique',
    price: 180,
    cost: 120,
    quantity: 5,
    minQuantity: 15,
    isActive: true,
    categoryId: 'cat-2',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '3',
    name: 'Clavier Mécanique RGB',
    sku: 'ACC-023',
    description: 'Clavier gaming avec rétroéclairage',
    price: 250,
    cost: 180,
    quantity: 2,
    minQuantity: 8,
    isActive: true,
    categoryId: 'cat-2',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: '4',
    name: 'Écran Samsung 27" 4K',
    sku: 'MON-012',
    description: 'Moniteur professionnel 4K',
    price: 850,
    cost: 600,
    quantity: 4,
    minQuantity: 12,
    isActive: true,
    categoryId: 'cat-3',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '5',
    name: 'Webcam HD Pro',
    sku: 'ACC-089',
    description: 'Caméra HD pour visioconférence',
    price: 120,
    cost: 80,
    quantity: 1,
    minQuantity: 6,
    isActive: true,
    categoryId: 'cat-2',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: '6',
    name: 'Laptop HP ProBook 450',
    sku: 'LAP-002',
    description: 'Ordinateur portable professionnel',
    price: 3200,
    cost: 2400,
    quantity: 25,
    minQuantity: 15,
    isActive: true,
    categoryId: 'cat-1',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '7',
    name: 'Casque Audio Bose QC35',
    sku: 'ACC-067',
    description: 'Casque à réduction de bruit',
    price: 450,
    cost: 320,
    quantity: 18,
    minQuantity: 10,
    isActive: true,
    categoryId: 'cat-2',
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-09')
  },
  {
    id: '8',
    name: 'Imprimante HP LaserJet',
    sku: 'PRT-001',
    description: 'Imprimante laser noir et blanc',
    price: 680,
    cost: 480,
    quantity: 8,
    minQuantity: 5,
    isActive: false,
    categoryId: 'cat-4',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  }
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && product.isActive) ||
                          (statusFilter === 'inactive' && !product.isActive) ||
                          (statusFilter === 'low' && product.quantity <= product.minQuantity);
    return matchesSearch && matchesStatus;
  });

  const totalProducts = mockProducts.length;
  const activeProducts = mockProducts.filter(p => p.isActive).length;
  const lowStockProducts = mockProducts.filter(p => p.quantity <= p.minQuantity).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-500">Gérez votre catalogue de produits</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="h-5 w-5" />
          Ajouter un produit
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total produits</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Produits actifs</p>
          <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Stock faible</p>
          <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
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
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les produits</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="low">Stock faible</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <ProductTable products={filteredProducts} />

      {/* Results count */}
      <div className="text-center text-sm text-gray-500">
        Affichage de {filteredProducts.length} sur {totalProducts} produits
      </div>
    </div>
  );
}
