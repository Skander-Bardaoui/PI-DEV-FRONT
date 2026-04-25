// src/types/permissions.types.ts

/**
 * Permission types matching backend enum
 * Each position in the permission string represents a specific permission
 */
export enum PermissionType {
  CREATE = 0,
  UPDATE = 1,
  DELETE = 2,
  ADD_MEMBER = 3,
  KICK_MEMBER = 4,
  PROMOTE = 5,
}

/**
 * Business member with permissions
 */
export interface BusinessMember {
  id: string;
  user_id: string;
  business_id: string;
  role: string;
  permissions: string;
  is_active: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * DTO for updating member permissions
 */
export interface UpdatePermissionsDto {
  permissions: string;
}

/**
 * Parsed permissions object for easier manipulation
 */
export interface ParsedPermissions {
  [PermissionType.CREATE]: boolean;
  [PermissionType.UPDATE]: boolean;
  [PermissionType.DELETE]: boolean;
  [PermissionType.ADD_MEMBER]: boolean;
  [PermissionType.KICK_MEMBER]: boolean;
  [PermissionType.PROMOTE]: boolean;
}

/**
 * Permission metadata for UI display
 */
export interface PermissionMetadata {
  label: string;
  description: string;
}

/**
 * Map of permission types to their UI metadata
 */
export const PERMISSION_LABELS: Record<PermissionType, string> = {
  [PermissionType.CREATE]: 'Create',
  [PermissionType.UPDATE]: 'Update',
  [PermissionType.DELETE]: 'Delete',
  [PermissionType.ADD_MEMBER]: 'Add Member',
  [PermissionType.KICK_MEMBER]: 'Kick Member',
  [PermissionType.PROMOTE]: 'Promote',
};

/**
 * Map of permission types to their descriptions
 */
export const PERMISSION_DESCRIPTIONS: Record<PermissionType, string> = {
  [PermissionType.CREATE]: 'Create new records and resources',
  [PermissionType.UPDATE]: 'Edit existing records and resources',
  [PermissionType.DELETE]: 'Delete records and resources',
  [PermissionType.ADD_MEMBER]: 'Invite new members to the business',
  [PermissionType.KICK_MEMBER]: 'Remove members from the business',
  [PermissionType.PROMOTE]: 'Change member roles and permissions',
};

/**
 * Role default permissions mapping
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string> = {
  BUSINESS_OWNER: 'cudakp',  // All permissions
  BUSINESS_ADMIN: 'cud---',  // Create, Update, Delete
  TEAM_MEMBER: '-u----',     // Update only
  ACCOUNTANT: '-u----',      // Update only
  CLIENT: '------',          // No permissions
  SUPPLIER: '------',        // No permissions
  PLATFORM_ADMIN: 'cudakp',  // All permissions
};
