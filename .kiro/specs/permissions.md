# Permissions Module Specification

## Overview
Implements granular role-based access control (RBAC) with module-specific permissions. Supports legacy 6-character permission strings and modern JSON permission objects for collaboration, stock, sales, purchases, payments, and salary modules.

## Pages and Components
- **PermissionManagementModal** - UI for editing member permissions
- **PermissionGuard** - Component-level permission check wrapper
- **PermissionUtils** - Utility class for permission manipulation

## Key Features
- Legacy 6-character permission strings (cudakp format)
- Module-specific permission objects (collaboration, stock, sales, purchases, payments, salary)
- Permission validation and parsing
- Role default permissions
- Human-readable permission labels
- Permission inheritance from roles

## State Management
- **Props**: Permissions passed as props to guards and modals
- **Context**: AuthContext provides current user with permissions
- **Local State**: useState for permission editing in modals

## API Calls
- `GET /permissions/:businessId/members` - Get all business members with permissions
- `PATCH /permissions/:businessId/members/:memberId` - Update member permissions
- `GET /permissions/:businessId/roles` - Get role default permissions

## Types and Interfaces
- `PermissionType` - Enum: CREATE, UPDATE, DELETE, ADD_MEMBER, KICK_MEMBER, PROMOTE
- `CollaborationPermissions` - Task and subtask permissions
- `StockPermissions` - Product, category, warehouse, movement permissions
- `SalesPermissions` - Client, quote, order, delivery, invoice permissions
- `PurchasePermissions` - Supplier, PO, goods receipt, invoice permissions
- `PaymentPermissions` - Client/supplier payment, schedule, account, transfer permissions
- `SalaryPermissions` - Salary creation, update, delete, proposal, payment
- `BusinessMember` - Member with all permission objects
- `UpdatePermissionsDto` - DTO for updating permissions
- `ParsedPermissions` - Parsed 6-char permission string

## Dependencies
- None (pure TypeScript utility)

## Permissions
Permission checks are performed at:
- **Route level**: ProtectedRoute checks user role
- **Component level**: PermissionGuard checks specific permissions
- **UI level**: Conditional rendering based on permissions
- **API level**: Backend validates all permission checks

### Permission Structure
**Legacy (6-char string)**: `cudakp` where each position represents:
- Position 0 (c): CREATE
- Position 1 (u): UPDATE
- Position 2 (d): DELETE
- Position 3 (a): ADD_MEMBER
- Position 4 (k): KICK_MEMBER
- Position 5 (p): PROMOTE

**Modern (JSON objects)**: Module-specific boolean flags for granular control.

### Role Defaults
- **BUSINESS_OWNER**: All permissions (cudakp)
- **BUSINESS_ADMIN**: Create, Update, Delete (cud---)
- **TEAM_MEMBER**: Update only (-u----)
- **ACCOUNTANT**: Update only (-u----)
- **CLIENT**: No permissions (------)
- **SUPPLIER**: No permissions (------)
