import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBusinessId } from '../../hooks/useBusinessId';
import { categoriesApi } from '../../api/categories.api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/category';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface BusinessMember {
  id: string;
  user_id: string;
  business_id: string;
  role: string;
  stock_permissions: {
    create_product: boolean;
    update_product: boolean;
    delete_product: boolean;
    create_movement: boolean;
    delete_movement: boolean;
    create_category: boolean;
    update_category: boolean;
    delete_category: boolean;
    create_warehouse: boolean;
    update_warehouse: boolean;
    delete_warehouse: boolean;
    create_reservation: boolean;
    delete_reservation: boolean;
    create_service: boolean;
    update_service: boolean;
    delete_service: boolean;
    create_service_category: boolean;
    update_service_category: boolean;
    delete_service_category: boolean;
  };
  is_active: boolean;
}

async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

async function fetchBusinessMembers(businessId: string): Promise<BusinessMember[]> {
  const res = await fetch(`${API_URL}/businesses/${businessId}/members`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch members');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.members || []);
}

export default function Categories() {
  const { user } = useAuth();
  const { businessId, loading: loadingBusinessId, error: businessIdError } = useBusinessId();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
  });
  
  // User and member state for permissions
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentMember, setCurrentMember] = useState<BusinessMember | null>(null);

  // Load current user and member on mount
  useEffect(() => {
    async function loadUserData() {
      if (!businessId) return;
      
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
        
        const members = await fetchBusinessMembers(businessId);
        const member = members.find(m => m.user_id === user.id);
        setCurrentMember(member || null);
      } catch (err: any) {
        console.error('Failed to load user data:', err);
      }
    }
    loadUserData();
  }, [businessId]);

  // Permission checks
  const isOwner = currentUser?.role === 'BUSINESS_OWNER';
  const stock = currentMember?.stock_permissions;
  
  const canCreateCategory = isOwner || stock?.create_category === true;
  const canUpdateCategory = isOwner || stock?.update_category === true;
  const canDeleteCategory = isOwner || stock?.delete_category === true;

  useEffect(() => {
    if (businessId) {
      loadCategories();
    }
  }, [businessId, searchTerm, showActiveOnly]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // ==================== Alaa change for service type ====================
      const data = await categoriesApi.getAll(businessId!, {
        search: searchTerm || undefined,
        is_active: showActiveOnly ? true : undefined,
        category_type: 'PRODUCT',
      });
      // ====================================================================
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ==================== Alaa change for service type ====================
      const dataToSend = { ...formData, category_type: 'PRODUCT' };
      if (editingCategory) {
        await categoriesApi.update(businessId!, editingCategory.id, dataToSend);
      } else {
        await categoriesApi.create(businessId!, dataToSend);
      }
      // ====================================================================
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      await loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesApi.delete(businessId!, id);
        loadCategories();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoriesApi.update(businessId!, category.id, {
        is_active: !category.is_active,
      });
      loadCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  if (!businessId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No business associated with your account. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        {/* ==================== Alaa change for service type ==================== */}
        <h1 className="text-2xl font-bold">Product Categories</h1>
        {/* ==================================================================== */}
        {canCreateCategory && (
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Category
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded"
            />
            <span>Active only</span>
          </label>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{category.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canUpdateCategory && (
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {canDeleteCategory && (
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
