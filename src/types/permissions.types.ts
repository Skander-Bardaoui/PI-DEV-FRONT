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
 * Collaboration permissions structure
 */
export interface CollaborationPermissions {
  create_task: boolean;
  update_task: boolean;
  delete_task: boolean;
  add_member: boolean;
  kick_member: boolean;
  promote_member: boolean;
}

/**
 * Stock permissions structure
 */
export interface StockPermissions {
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
}

/**
 * Payment permissions structure
 */
export interface PaymentPermissions {
  create_client_payment: boolean;
  delete_client_payment: boolean;
  create_supplier_payment: boolean;
  delete_supplier_payment: boolean;
  create_schedule: boolean;
  update_schedule: boolean;
  delete_schedule: boolean;
  pay_installment: boolean;
  create_account: boolean;
  update_account: boolean;
  delete_account: boolean;
  create_transfer: boolean;
  delete_transfer: boolean;
}

/**
 * Salary permissions structure
 */
export interface SalaryPermissions {
  create_salary: boolean;
  update_salary: boolean;
  delete_salary: boolean;
  send_proposal: boolean;
  pay_salary: boolean;
}

/**
 * Business member with permissions
 */
export interface BusinessMember {
  id: string;
  user_id: string;
  business_id: string;
  role: string;
  collaboration_permissions: CollaborationPermissions;
  stock_permissions: StockPermissions;
  payment_permissions: PaymentPermissions;
  salary_permissions?: SalaryPermissions; // Optional for backward compatibility
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
  collaboration_permissions?: CollaborationPermissions;
  stock_permissions?: StockPermissions;
  payment_permissions?: PaymentPermissions;
  salary_permissions?: SalaryPermissions;
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
