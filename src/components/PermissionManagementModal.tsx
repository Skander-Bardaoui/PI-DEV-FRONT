// src/components/PermissionManagementModal.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Users, Package } from 'lucide-react';
import { permissionsApi } from '../api/permissions.api';
import { BusinessMember, CollaborationPermissions, StockPermissions } from '../types/permissions.types';
import { useToast } from './ui/Toast';

interface PermissionManagementModalProps {
  member: BusinessMember;
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal component for managing member permissions with granular controls
 * Displays two sections: Collaboration and Stock Management
 * Each section has specific toggles for each permission type
 */
export function PermissionManagementModal({
  member,
  businessId,
  isOpen,
  onClose,
  onSuccess,
}: PermissionManagementModalProps) {
  const [collaborationPermissions, setCollaborationPermissions] = useState<CollaborationPermissions>(
    member.collaboration_permissions || {
      create_task: false,
      update_task: false,
      delete_task: false,
      add_member: false,
      kick_member: false,
      promote_member: false,
    }
  );

  const [stockPermissions, setStockPermissions] = useState<StockPermissions>(
    member.stock_permissions || {
      create_product: false,
      update_product: false,
      delete_product: false,
      create_movement: false,
      delete_movement: false,
      create_category: false,
      update_category: false,
      delete_category: false,
      create_warehouse: false,
      update_warehouse: false,
      delete_warehouse: false,
      create_reservation: false,
      delete_reservation: false,
      create_service: false,
      update_service: false,
      delete_service: false,
      create_service_category: false,
      update_service_category: false,
      delete_service_category: false,
    }
  );

  const queryClient = useQueryClient();
  const toast = useToast();

  // Mutation for updating permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: () =>
      permissionsApi.updateMemberPermissions(
        businessId,
        member.user_id,
        collaborationPermissions,
        stockPermissions
      ),
    onSuccess: () => {
      // Invalidate business members cache to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['business-members', businessId],
      });

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      toast.success('Permissions updated', `${member.user.firstName}'s permissions have been updated successfully`);
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update permissions';
      toast.error('Error', errorMessage);
    },
  });

  // Handle collaboration permission toggle
  const handleCollaborationToggle = (key: keyof CollaborationPermissions) => {
    setCollaborationPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle stock permission toggle
  const handleStockToggle = (key: keyof StockPermissions) => {
    setStockPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle save button click
  const handleSave = () => {
    updatePermissionsMutation.mutate();
  };

  // Check if anything changed
  const hasChanges =
    JSON.stringify(collaborationPermissions) !== JSON.stringify(member.collaboration_permissions) ||
    JSON.stringify(stockPermissions) !== JSON.stringify(member.stock_permissions);

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Permissions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure permissions for {member.user.firstName} {member.user.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={updatePermissionsMutation.isPending}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Collaboration Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">🤝 Collaboration</h3>
            </div>

            {/* Tasks Subsection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Tasks</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Create Task"
                  description="create new tasks in kanban"
                  isGranted={collaborationPermissions.create_task}
                  onToggle={() => handleCollaborationToggle('create_task')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Update Task"
                  description="edit and move tasks"
                  isGranted={collaborationPermissions.update_task}
                  onToggle={() => handleCollaborationToggle('update_task')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Delete Task"
                  description="delete tasks permanently"
                  isGranted={collaborationPermissions.delete_task}
                  onToggle={() => handleCollaborationToggle('delete_task')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>

            {/* Members Subsection */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Members</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Add Member"
                  description="invite new members"
                  isGranted={collaborationPermissions.add_member}
                  onToggle={() => handleCollaborationToggle('add_member')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Kick Member"
                  description="remove members"
                  isGranted={collaborationPermissions.kick_member}
                  onToggle={() => handleCollaborationToggle('kick_member')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Promote Member"
                  description="change member roles"
                  isGranted={collaborationPermissions.promote_member}
                  onToggle={() => handleCollaborationToggle('promote_member')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>
          </div>

          {/* Stock Management Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">📦 Stock Management</h3>
            </div>

            {/* Products Subsection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Products</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Create Product"
                  description="add new products"
                  isGranted={stockPermissions.create_product}
                  onToggle={() => handleStockToggle('create_product')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Update Product"
                  description="edit product details"
                  isGranted={stockPermissions.update_product}
                  onToggle={() => handleStockToggle('update_product')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Delete Product"
                  description="delete products"
                  isGranted={stockPermissions.delete_product}
                  onToggle={() => handleStockToggle('delete_product')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>

            {/* Stock Movements Subsection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Stock Movements</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Create Movement"
                  description="add stock entries and exits"
                  isGranted={stockPermissions.create_movement}
                  onToggle={() => handleStockToggle('create_movement')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Delete Movement"
                  description="cancel stock movements"
                  isGranted={stockPermissions.delete_movement}
                  onToggle={() => handleStockToggle('delete_movement')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>

            {/* Categories Subsection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Create Category"
                  description="add categories"
                  isGranted={stockPermissions.create_category}
                  onToggle={() => handleStockToggle('create_category')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Update Category"
                  description="edit categories"
                  isGranted={stockPermissions.update_category}
                  onToggle={() => handleStockToggle('update_category')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Delete Category"
                  description="delete categories"
                  isGranted={stockPermissions.delete_category}
                  onToggle={() => handleStockToggle('delete_category')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>

            {/* Warehouses Subsection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Warehouses</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Create Warehouse"
                  description="add warehouses"
                  isGranted={stockPermissions.create_warehouse}
                  onToggle={() => handleStockToggle('create_warehouse')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Update Warehouse"
                  description="edit warehouses"
                  isGranted={stockPermissions.update_warehouse}
                  onToggle={() => handleStockToggle('update_warehouse')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Delete Warehouse"
                  description="delete warehouses"
                  isGranted={stockPermissions.delete_warehouse}
                  onToggle={() => handleStockToggle('delete_warehouse')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>

            {/* Reservations Subsection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Reservations</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Create Reservation"
                  description="reserve stock"
                  isGranted={stockPermissions.create_reservation}
                  onToggle={() => handleStockToggle('create_reservation')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Delete Reservation"
                  description="cancel reservations"
                  isGranted={stockPermissions.delete_reservation}
                  onToggle={() => handleStockToggle('delete_reservation')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>

            {/* Services Subsection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Services</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Create Service"
                  description="add new services"
                  isGranted={stockPermissions.create_service}
                  onToggle={() => handleStockToggle('create_service')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Update Service"
                  description="edit service details"
                  isGranted={stockPermissions.update_service}
                  onToggle={() => handleStockToggle('update_service')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Delete Service"
                  description="delete services"
                  isGranted={stockPermissions.delete_service}
                  onToggle={() => handleStockToggle('delete_service')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>

            {/* Service Categories Subsection */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Service Categories</h4>
              <div className="space-y-3">
                <PermissionToggle
                  label="Create Service Category"
                  description="add service categories"
                  isGranted={stockPermissions.create_service_category}
                  onToggle={() => handleStockToggle('create_service_category')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Update Service Category"
                  description="edit service categories"
                  isGranted={stockPermissions.update_service_category}
                  onToggle={() => handleStockToggle('update_service_category')}
                  disabled={updatePermissionsMutation.isPending}
                />
                <PermissionToggle
                  label="Delete Service Category"
                  description="delete service categories"
                  isGranted={stockPermissions.delete_service_category}
                  onToggle={() => handleStockToggle('delete_service_category')}
                  disabled={updatePermissionsMutation.isPending}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            disabled={updatePermissionsMutation.isPending}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updatePermissionsMutation.isPending || !hasChanges}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {updatePermissionsMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable toggle component
interface PermissionToggleProps {
  label: string;
  description: string;
  isGranted: boolean;
  onToggle: () => void;
  disabled: boolean;
}

function PermissionToggle({ label, description, isGranted, onToggle, disabled }: PermissionToggleProps) {
  return (
    <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* Toggle Switch */}
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
            isGranted
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          role="switch"
          aria-checked={isGranted}
          aria-label={`Toggle ${label} permission`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              isGranted ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
