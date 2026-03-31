import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { warehousesApi } from '../../api/warehouses.api';
import { Warehouse, CreateWarehouseDto } from '../../types/warehouse';
import {
  Plus,
  Warehouse as WarehouseIcon,
  MapPin,
  Edit,
  Trash2,
  Package,
} from 'lucide-react';

export default function Warehouses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const businessId = user?.business_id;

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<CreateWarehouseDto>({
    name: '',
    code: '',
    description: '',
    address: '',
    is_active: true,
  });

  useEffect(() => {
    if (businessId) {
      loadWarehouses();
    }
  }, [businessId]);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehousesApi.getAll(businessId!);
      setWarehouses(data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await warehousesApi.update(businessId!, editingWarehouse.id, formData);
      } else {
        await warehousesApi.create(businessId!, formData);
      }
      setShowModal(false);
      resetForm();
      loadWarehouses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving warehouse');
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      description: warehouse.description || '',
      address: warehouse.address || '',
      is_active: warehouse.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await warehousesApi.delete(businessId!, id);
      loadWarehouses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting warehouse');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      address: '',
      is_active: true,
    });
    setEditingWarehouse(null);
  };

  if (!businessId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No business associated with your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <p className="text-gray-600 mt-1">Manage your storage locations</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Warehouse
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading warehouses...</p>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <WarehouseIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No warehouses yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first warehouse to organize your inventory
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Warehouse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <div
              key={warehouse.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <WarehouseIcon size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{warehouse.name}</h3>
                      <p className="text-sm text-gray-500">{warehouse.code}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      warehouse.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {warehouse.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {warehouse.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {warehouse.description}
                  </p>
                )}

                {warehouse.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2">{warehouse.address}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    onClick={() => navigate(`/app/warehouses/${warehouse.id}`)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Package size={16} />
                    View Stock
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(warehouse)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(warehouse.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingWarehouse ? 'Edit Warehouse' : 'New Warehouse'}
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
                  placeholder="Main Warehouse"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="WH01"
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
                  placeholder="Optional description"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Physical address"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
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
                  {editingWarehouse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
