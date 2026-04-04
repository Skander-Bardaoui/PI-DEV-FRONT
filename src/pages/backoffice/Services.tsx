// ==================== Alaa change for service type ====================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { Product, CreateProductDto, ProductType } from '../../types/product';
import { Category } from '../../types/category';
import { Plus, Edit, Trash2, Search, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function Services() {
  const { user } = useAuth();
  const businessId = user?.business_id;
  const [services, setServices] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [generatingSku, setGeneratingSku] = useState(false);
  const [skuError, setSkuError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    reference: '',
    description: '',
    category_id: '',
    unit: 'service',
    sale_price_ht: 0,
    tax_rate_id: '',
    is_stockable: false,
  });

  useEffect(() => {
    if (businessId) {
      loadServices();
      loadCategories();
    }
  }, [businessId, searchTerm, selectedCategory, showActiveOnly]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll(businessId!, {
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        is_active: showActiveOnly ? true : undefined,
        type: ProductType.SERVICE,
      });
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // ==================== Alaa change for service type ====================
      const data = await categoriesApi.getAll(businessId!, { is_active: true, category_type: 'SERVICE' });
      // ====================================================================
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...formData,
        type: ProductType.SERVICE,
        is_stockable: false,
        current_stock: 0,
        min_stock_threshold: 0,
      };

      if (editingService) {
        await productsApi.update(businessId!, editingService.id, serviceData);
        toast.success('Service updated successfully');
      } else {
        await productsApi.create(businessId!, serviceData);
        toast.success('Service created successfully');
      }
      setShowModal(false);
      setEditingService(null);
      resetForm();
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving service');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      reference: '',
      description: '',
      category_id: '',
      unit: 'service',
      sale_price_ht: 0,
      tax_rate_id: '',
      is_stockable: false,
    });
    setSkuError(null);
  };

  const handleEdit = (service: Product) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      reference: service.reference,
      description: service.description || '',
      category_id: service.category_id || '',
      unit: service.unit,
      sale_price_ht: service.sale_price_ht,
      tax_rate_id: service.tax_rate_id || '',
      is_stockable: false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    setServiceToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await productsApi.delete(businessId!, serviceToDelete);
      setServices(prev => prev.filter(s => s.id !== serviceToDelete));
      toast.success('Service deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting service');
    } finally {
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
    }
  };

  const handleToggleActive = async (service: Product) => {
    try {
      await productsApi.update(businessId!, service.id, {
        is_active: !service.is_active,
      });
      loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const handleGenerateSku = async () => {
    if (formData.reference && formData.reference.trim()) {
      const confirmed = window.confirm('This will replace your current SKU. Continue?');
      if (!confirmed) return;
    }

    setGeneratingSku(true);
    setSkuError(null);

    try {
      let categoryName: string | null = null;
      if (formData.category_id) {
        const selectedCategory = categories.find(cat => cat.id === formData.category_id);
        categoryName = selectedCategory?.name || null;
      }

      // ==================== Alaa change for service type ====================
      const result = await productsApi.generateSku(businessId!, {
        category_name: categoryName,
        brand: null,
        name: formData.name || null,
        unit: formData.unit || null,
        extra_attribute: null,
        type: 'SERVICE', // Pass SERVICE type for service SKU generation
      });
      // ====================================================================

      setFormData(prev => ({ ...prev, reference: result.sku }));
    } catch (error: any) {
      setSkuError(error.response?.data?.message || 'Failed to generate SKU');
    } finally {
      setGeneratingSku(false);
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
        <h1 className="text-2xl font-bold">Services</h1>
        <button
          onClick={() => {
            setEditingService(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Services are not tracked in inventory and do not generate stock movements.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU/Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (HT)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
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
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No services found
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{service.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.reference}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(service.sale_price_ht || 0).toFixed(3)} DT
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {service.category?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {service.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">
              {editingService ? 'Edit Service' : 'New Service'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU/Reference *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      disabled={generatingSku}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {generatingSku ? 'Generating...' : 'Generate SKU'}
                    </button>
                  </div>
                  {skuError && (
                    <p className="mt-1 text-sm text-red-600">{skuError}</p>
                  )}
                </div>

                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price HT (DT) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={formData.sale_price_ht}
                      onChange={(e) =>
                        setFormData({ ...formData, sale_price_ht: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={19}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this service? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setServiceToDelete(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ====================================================================
