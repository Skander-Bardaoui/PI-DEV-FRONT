// src/components/PermissionManagementModal.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { permissionsApi } from '../api/permissions.api';
import { BusinessMember, PermissionType } from '../types/permissions.types';
import { PermissionUtils } from '../utils/permissions';
import { PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from '../types/permissions.types';
import { useToast } from './ui/Toast';

interface PermissionManagementModalProps {
  member: BusinessMember;
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback after successful update
}

/**
 * Modal component for managing member permissions
 * Displays 6 toggle switches for each permission type
 * Integrates with React Query for data fetching and cache invalidation
 */
export function PermissionManagementModal({
  member,
  businessId,
  isOpen,
  onClose,
  onSuccess,
}: PermissionManagementModalProps) {
  const [permissions, setPermissions] = useState(member.permissions);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Mutation for updating permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: (newPermissions: string) =>
      permissionsApi.updateMemberPermissions(businessId, member.user_id, newPermissions),
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

  // Handle permission toggle
  const handlePermissionToggle = (type: PermissionType, granted: boolean) => {
    const newPermissions = PermissionUtils.setPermission(permissions, type, granted);
    setPermissions(newPermissions);
  };

  // Handle save button click
  const handleSave = () => {
    // Validate permission string before sending
    if (!PermissionUtils.validatePermissionString(permissions)) {
      toast.error('Invalid permissions', 'The permission string format is invalid');
      return;
    }

    updatePermissionsMutation.mutate(permissions);
  };

  // Parse current permissions
  const parsedPermissions = PermissionUtils.parsePermissions(permissions);

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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
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
          <div className="space-y-4">
            {/* Permission Toggles */}
            {Object.entries(PERMISSION_LABELS).map(([typeStr, label]) => {
              const type = parseInt(typeStr) as PermissionType;
              const isGranted = parsedPermissions[type];
              const description = PERMISSION_DESCRIPTIONS[type];

              return (
                <div
                  key={type}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-900 cursor-pointer">
                      {label}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>

                  {/* Toggle Switch */}
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handlePermissionToggle(type, !isGranted)}
                      disabled={updatePermissionsMutation.isPending}
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
            })}
          </div>

          {/* Permission String Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Permission String
            </p>
            <div className="mt-2 flex items-center justify-between">
              <code className="text-lg font-mono font-bold text-gray-900">{permissions}</code>
              <div className="text-xs text-gray-600">
                <span className="font-semibold">{PermissionUtils.getGrantedPermissions(permissions).length}</span>
                {' '}of 6 permissions granted
              </div>
            </div>
          </div>

          {/* Granted Permissions List */}
          {PermissionUtils.getGrantedPermissions(permissions).length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                Granted Permissions
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PermissionUtils.getGrantedPermissions(permissions).map((perm) => (
                  <span
                    key={perm}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          )}
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
            disabled={updatePermissionsMutation.isPending || permissions === member.permissions}
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
