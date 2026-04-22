# Frontend Permission Enforcement

## Overview

Frontend permission enforcement has been added to protect routes based on granular permission strings (cudakp format). This provides early access control before API calls are made.

## Components Added

### 1. PermissionGuard Component
**File**: `src/components/PermissionGuard.tsx`

A React component that wraps routes and enforces permission checks before rendering.

**Features**:
- Checks authentication status
- Verifies business membership
- Validates permission strings
- Supports single or multiple permission requirements
- Supports "require all" or "require any" logic
- Shows loading spinner during permission check
- Redirects to fallback or specified route on denial

**Usage**:
```tsx
import PermissionGuard from './components/PermissionGuard';
import { PermissionType } from './types/permissions.types';

// Require UPDATE permission
<PermissionGuard requiredPermissions={[PermissionType.UPDATE]}>
  <CollaborationPage />
</PermissionGuard>

// Require either ADD_MEMBER or KICK_MEMBER (requireAll=false is default)
<PermissionGuard requiredPermissions={[PermissionType.ADD_MEMBER, PermissionType.KICK_MEMBER]}>
  <TeamPage />
</PermissionGuard>

// Require ALL permissions
<PermissionGuard 
  requiredPermissions={[PermissionType.CREATE, PermissionType.DELETE]} 
  requireAll={true}
>
  <AdminPage />
</PermissionGuard>

// Custom redirect and fallback
<PermissionGuard 
  requiredPermissions={[PermissionType.UPDATE]}
  redirectTo="/app/dashboard"
  fallback={<AccessDenied />}
>
  <Page />
</PermissionGuard>
```

### 2. useCurrentBusinessMember Hook
**File**: `src/hooks/useCurrentBusinessMember.ts`

A React hook that fetches the current user's business member record with permissions.

**Features**:
- Fetches business member data from API
- Extracts permission string
- Handles loading and error states
- Uses localStorage to get current business ID

**Usage**:
```tsx
import { useCurrentBusinessMember } from './hooks/useCurrentBusinessMember';

function MyComponent() {
  const { businessMember, isLoading, error } = useCurrentBusinessMember();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Permissions: {businessMember?.permissions}</p>
    </div>
  );
}
```

## Protected Routes

### Team Page (`/app/team`)
**Permissions Required**: `ADD_MEMBER` OR `KICK_MEMBER`
**Logic**: User must have at least one of these permissions to access team management

```tsx
<Route 
  path="team" 
  element={
    <PermissionGuard requiredPermissions={[PermissionType.ADD_MEMBER, PermissionType.KICK_MEMBER]} requireAll={false}>
      <Team />
    </PermissionGuard>
  } 
/>
```

**Who can access**:
- BUSINESS_OWNER (permissions: `cudakp`)
- BUSINESS_ADMIN (permissions: `cud---`)
- TEAM_MEMBER with ADD_MEMBER or KICK_MEMBER permission

### Collaboration Page (`/app/collaboration`)
**Permissions Required**: `UPDATE`
**Logic**: User must have UPDATE permission to access collaboration features

```tsx
<Route 
  path="collaboration" 
  element={
    <PermissionGuard requiredPermissions={[PermissionType.UPDATE]}>
      <Collaboration />
    </PermissionGuard>
  } 
/>
```

**Who can access**:
- BUSINESS_OWNER (permissions: `cudakp`)
- BUSINESS_ADMIN (permissions: `cud---`)
- TEAM_MEMBER (permissions: `--u---`)
- ACCOUNTANT (permissions: `--u---`)

## Permission String Format

```
Position: 0 1 2 3 4 5
Format:   c u d a k p
```

### Permission Types
- **Position 0 (c)**: CREATE - Create new records
- **Position 1 (u)**: UPDATE - Edit existing records
- **Position 2 (d)**: DELETE - Delete records
- **Position 3 (a)**: ADD_MEMBER - Invite new members
- **Position 4 (k)**: KICK_MEMBER - Remove members
- **Position 5 (p)**: PROMOTE - Change member roles

### Role Defaults
| Role | Permissions | Meaning |
|------|-------------|---------|
| BUSINESS_OWNER | `cudakp` | All permissions |
| BUSINESS_ADMIN | `cud---` | Create, Update, Delete |
| TEAM_MEMBER | `--u---` | Update only |
| ACCOUNTANT | `--u---` | Update only |

## How It Works

### Flow Diagram
```
User navigates to /app/collaboration
         ↓
PermissionGuard component renders
         ↓
Check authentication (useAuth hook)
         ↓
Fetch business member (useCurrentBusinessMember hook)
         ↓
Extract permission string from businessMember
         ↓
Check if permission[1] (UPDATE) != '-'
         ↓
If yes → Render <Collaboration />
If no → Redirect to /app or show fallback
```

### Step-by-Step

1. **User navigates** to protected route (e.g., `/app/collaboration`)
2. **PermissionGuard** component mounts
3. **useAuth** hook checks if user is authenticated
4. **useCurrentBusinessMember** hook fetches business member data
5. **Permission check** validates permission string
6. **Decision**:
   - ✅ Has permission → Render page
   - ❌ No permission → Redirect or show fallback
   - ⏳ Loading → Show spinner

## Integration with Backend

### Backend Permission Enforcement
The backend also enforces permissions on API endpoints:

**Daily Checkins**:
- `POST /checkins` → Requires UPDATE permission
- `GET /checkins/business/:businessId/today` → Requires UPDATE permission

**Collaboration Tasks**:
- `POST /tasks` → Requires CREATE permission
- `PATCH /tasks/:id` → Requires UPDATE permission
- `DELETE /tasks/:id` → Requires DELETE permission

### Layered Security
```
Frontend Permission Guard
         ↓
API Call (with JWT token)
         ↓
Backend JWT Guard
         ↓
Backend Permission Guard
         ↓
Service Layer Membership Check
         ↓
Database Operation
```

## Error Handling

### Access Denied Scenarios

1. **Not Authenticated**
   - Redirects to `/login`
   - Shows login form

2. **No Business Membership**
   - Redirects to `/app` (dashboard)
   - Shows error toast

3. **Insufficient Permissions**
   - Redirects to `/app` (dashboard)
   - Can show custom fallback component

4. **Loading State**
   - Shows spinner
   - Prevents flash of content

## Best Practices

### 1. Always Specify Required Permissions
```tsx
// ✅ Good - Clear what's required
<PermissionGuard requiredPermissions={[PermissionType.UPDATE]}>
  <Page />
</PermissionGuard>

// ❌ Bad - No permissions specified, allows everyone
<PermissionGuard>
  <Page />
</PermissionGuard>
```

### 2. Use Semantic Permission Names
```tsx
// ✅ Good - Clear intent
<PermissionGuard requiredPermissions={[PermissionType.ADD_MEMBER, PermissionType.KICK_MEMBER]}>
  <TeamManagement />
</PermissionGuard>

// ❌ Bad - Unclear what permissions mean
<PermissionGuard requiredPermissions={[3, 4]}>
  <TeamManagement />
</PermissionGuard>
```

### 3. Combine with Role-Based Guards
```tsx
// ✅ Good - Double layer of security
<ProtectedRoute allowedRoles={[Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN]}>
  <PermissionGuard requiredPermissions={[PermissionType.UPDATE]}>
    <Page />
  </PermissionGuard>
</ProtectedRoute>
```

### 4. Provide Meaningful Fallbacks
```tsx
// ✅ Good - User knows why they can't access
<PermissionGuard 
  requiredPermissions={[PermissionType.UPDATE]}
  fallback={
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <p>You don't have permission to access this page.</p>
      <p>Contact your business owner to request UPDATE permission.</p>
    </div>
  }
>
  <Page />
</PermissionGuard>
```

## Testing

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import PermissionGuard from './PermissionGuard';
import { PermissionType } from './types/permissions.types';

describe('PermissionGuard', () => {
  it('renders children when user has permission', () => {
    // Mock useAuth and useCurrentBusinessMember
    // Mock businessMember with permissions: 'cud---'
    // Render with PermissionType.CREATE
    // Assert children are rendered
  });

  it('redirects when user lacks permission', () => {
    // Mock useAuth and useCurrentBusinessMember
    // Mock businessMember with permissions: '--u---'
    // Render with PermissionType.DELETE
    // Assert redirect to /app
  });

  it('shows loading spinner during permission check', () => {
    // Mock useCurrentBusinessMember with isLoading: true
    // Assert spinner is visible
  });
});
```

### Integration Tests
```tsx
// Test full flow: navigate → check permissions → render or redirect
// Test with different permission strings
// Test with different required permissions
// Test with requireAll=true and requireAll=false
```

## Troubleshooting

### Issue: "No business selected" error
**Cause**: `currentBusinessId` not stored in localStorage
**Solution**: Ensure Team page or business selector stores business ID:
```tsx
localStorage.setItem('currentBusinessId', businessId);
```

### Issue: Permission check always fails
**Cause**: Permission string format invalid or permission position wrong
**Solution**: Verify permission string is exactly 6 characters:
```tsx
// Valid: 'cud---', 'cudakp', '--u---'
// Invalid: 'cu', 'cudakp-', 'CUDAKP'
```

### Issue: User can't access page despite having permission
**Cause**: Backend API call failing or returning 403
**Solution**: Check backend permission guard logs and ensure:
1. User is member of business
2. Permission string is correct
3. Backend guard is checking correct permission type

## Future Enhancements

1. **Permission Caching**: Cache business member data to reduce API calls
2. **Permission Preloading**: Preload permissions when user logs in
3. **Dynamic Permission UI**: Show/hide UI elements based on permissions
4. **Permission Audit Log**: Track permission changes and access attempts
5. **Permission Delegation**: Allow users to delegate permissions temporarily
