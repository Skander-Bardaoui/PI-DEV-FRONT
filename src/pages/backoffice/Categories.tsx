// src/pages/backoffice/Categories.tsx
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import CategoryTable from '../../components/stock/CategoryTable';
import { Category } from '../../types/category';

// Mock data
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Ordinateurs Portables',
    description: 'Laptops et notebooks de toutes marques',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'cat-2',
    name: 'Accessoires',
    description: 'Souris, claviers, casques et autres accessoires',
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'cat-3',
    name: 'Moniteurs',
    description: 'Écrans et moniteurs professionnels',
    isActive: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: 'cat-4',
    name: 'Imprimantes',
    description: 'Imprimantes laser et jet d\'encre',
    isActive: false,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'cat-5',
    name: 'Composants',
    description: 'RAM, SSD, disques durs et autres composants',
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: 'cat-6',
    name: 'Réseaux',
    description: 'Routeurs, switches et équipements réseau',
    isActive: true,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'cat-7',
    name: 'Logiciels',
    description: 'Licences et logiciels professionnels',
    isActive: true,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-09')
  },
  {
    id: 'cat-8',
    name: 'Mobilier',
    description: 'Bureaux, chaises et mobilier de bureau',
    isActive: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  }
];

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCategories = mockCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (category.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && category.isActive) ||
                          (statusFilter === 'inactive' && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalCategories = mockCategories.length;
  const activeCategories = mockCategories.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-500">Organisez vos produits par catégories</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="h-5 w-5" />
          Nouvelle catégorie
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total catégories</p>
          <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Catégories actives</p>
          <p className="text-2xl font-bold text-green-600">{activeCategories}</p>
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
              placeholder="Rechercher une catégorie..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <CategoryTable categories={filteredCategories} />

      {/* Results count */}
      <div className="text-center text-sm text-gray-500">
        Affichage de {filteredCategories.length} sur {totalCategories} catégories
      </div>
    </div>
  );
}
