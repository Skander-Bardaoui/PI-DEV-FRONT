// src/components/PermissionManagementModal.integration.example.tsx
// This file demonstrates how to integrate PermissionManagementModal into existing components

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { PermissionManagementModal } from './PermissionManagementModal';
import { permissionsApi } from '../api/permissions.api';
import { BusinessMember } from '../types/permissions.types';
import { useAuth } from '../hooks/useAuth'; // Assuming this hook exists

/**
 * Example 1: Integration with BusinessMembersList
 * Shows how to add permission management to a member list
 */
export function BusinessMembersListWithPermissions({
  businessId,
}: {
  businessId: string;
}) {
  const [selectedMember, setSelectedMember] = useState<BusinessMember | null>(null);
  const { user } = useAuth();

  // Fetch business members
  const { data: members, isLoading } = useQuery({
    queryKey: ['business-members', businessId],
    queryFn: () => permissionsApi.getBusinessMembers(businessId),
  });

  // Check if current user is business owner
  const isBusinessOwner = user?.role === 'BUSINESS_OWNER';

  // Check if user can manage permissions for a member
  const canManagePermissions = (member: BusinessMember): boolean => {
    // Only business owners can manage permissions
    if (!isBusinessOwner) return false;
    // Cannot manage own permissions
    if (member.user_id === user?.id) return false;
    return true;
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Member List */}
      {members?.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
              {member.user.firstName[0]}
              {member.user.lastName[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {member.user.firstName} {member.user.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {member.role} • {member.permissions}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canManagePermissions(member) && (
              <button
                onClick={() => setSelectedMember(member)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Permissions
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Permission Management Modal */}
      {selectedMember && (
        <PermissionManagementModal
          member={selectedMember}
          businessId={businessId}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

/**
 * Example 2: Integration with MemberDetailModal
 * Shows how to add permission management to a member detail view
 */
export function MemberDetailWithPermissions({
  member,
  businessId,
  onClose,
}: {
  member: BusinessMember;
  businessId: string;
  onClose: () => void;
}) {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const { user } = useAuth();

  const isBusinessOwner = user?.role === 'BUSINESS_OWNER';
  const canManagePermissions =
    isBusinessOwner && member.user_id !== user?.id;

  return (
    <>
      <div className="space-y-6">
        {/* Member Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {member.user.firstName} {member.user.lastName}
          </h2>
          <p className="text-gray-600">{member.user.email}</p>
        </div>

        {/* Member Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="text-lg font-semibold text-gray-900">{member.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Permissions</p>
            <p className="text-lg font-mono font-bold text-gray-900">
              {member.permissions}
            </p>
          </div>
        </div>

        {/* Permission Management Button */}
        {canManagePermissions && (
          <button
            onClick={() => setShowPermissionModal(true)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Manage Permissions
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Close
        </button>
      </div>

      {/* Permission Management Modal */}
      {showPermissionModal && (
        <PermissionManagementModal
          member={member}
          businessId={businessId}
          isOpen={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
        />
      )}
    </>
  );
}

/**
 * Example 3: Standalone Permission Manager
 * Shows how to use the modal as a standalone component
 */
export function StandalonePermissionManager({
  businessId,
  userId,
}: {
  businessId: string;
  userId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch the specific member
  const { data: member, isLoading } = useQuery({
    queryKey: ['business-member', businessId, userId],
    queryFn: () => permissionsApi.getBusinessMember(businessId, userId),
    enabled: isOpen, // Only fetch when modal is open
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!member) {
    return <div>Member not found</div>;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Manage Permissions
      </button>

      {member && (
        <PermissionManagementModal
          member={member}
          businessId={businessId}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

/**
 * Example 4: Permission Management with Confirmation
 * Shows how to add a confirmation step before updating permissions
 */
export function PermissionManagerWithConfirmation({
  member,
  businessId,
  isOpen,
  onClose,
}: {
  member: BusinessMember;
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingPermissions, setPendingPermissions] = useState<string | null>(null);

  const handlePermissionChange = (newPermissions: string) => {
    // Show confirmation if permissions are being significantly changed
    if (newPermissions !== member.permissions) {
      setPendingPermissions(newPermissions);
      setShowConfirmation(true);
    }
  };

  return (
    <>
      <PermissionManagementModal
        member={member}
        businessId={businessId}
        isOpen={isOpen}
        onClose={onClose}
      />

      {/* Confirmation Modal */}
      {showConfirmation && pendingPermissions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900">
              Confirm Permission Change
            </h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to change permissions from{' '}
              <code className="font-mono font-bold">{member.permissions}</code> to{' '}
              <code className="font-mono font-bold">{pendingPermissions}</code>?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Proceed with permission update
                  setShowConfirmation(false);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Example 5: Permission Manager with Audit Log
 * Shows how to display permission change history
 */
export function PermissionManagerWithAuditLog({
  member,
  businessId,
  isOpen,
  onClose,
  auditLog,
}: {
  member: BusinessMember;
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  auditLog?: Array<{
    timestamp: string;
    changedBy: string;
    oldPermissions: string;
    newPermissions: string;
  }>;
}) {
  return (
    <div className="space-y-6">
      <PermissionManagementModal
        member={member}
        businessId={businessId}
        isOpen={isOpen}
        onClose={onClose}
      />

      {/* Audit Log */}
      {auditLog && auditLog.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Permission Change History</h3>
          <div className="space-y-3">
            {auditLog.map((entry, index) => (
              <div key={index} className="text-sm border-l-2 border-gray-200 pl-4">
                <p className="text-gray-600">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
                <p className="text-gray-900 font-medium">
                  Changed by {entry.changedBy}
                </p>
                <p className="text-gray-600">
                  <code className="font-mono">{entry.oldPermissions}</code>
                  {' → '}
                  <code className="font-mono">{entry.newPermissions}</code>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: Bulk Permission Manager
 * Shows how to manage permissions for multiple members
 */
export function BulkPermissionManager({
  businessId,
  members,
}: {
  businessId: string;
  members: BusinessMember[];
}) {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<BusinessMember | null>(null);

  const toggleMemberSelection = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  return (
    <div className="space-y-4">
      {/* Member Selection */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Select Members</h3>
        <div className="space-y-2">
          {members.map((member) => (
            <label key={member.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedMembers.has(member.id)}
                onChange={() => toggleMemberSelection(member.id)}
                className="rounded border-gray-300"
              />
              <span className="text-gray-900">
                {member.user.firstName} {member.user.lastName}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMembers.size > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            Bulk Actions ({selectedMembers.size} selected)
          </h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Apply Template
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Reset to Role Defaults
            </button>
          </div>
        </div>
      )}

      {/* Individual Permission Manager */}
      {selectedMember && (
        <PermissionManagementModal
          member={selectedMember}
          businessId={businessId}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
