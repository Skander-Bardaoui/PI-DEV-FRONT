# PermissionManagementModal Component Guide

## Overview

The `PermissionManagementModal` component provides a user-friendly interface for managing member permissions in a business. It displays 6 toggle switches representing each permission type (Create, Update, Delete, Add Member, Kick Member, Promote) and integrates with React Query for seamless data fetching and cache invalidation.

## Features

- **6 Permission Toggles**: Visual toggle switches for each permission type
- **Permission Labels & Descriptions**: Clear labels and descriptions for each permission
- **Real-time Permission String Display**: Shows the current 6-character permission string
- **Granted Permissions List**: Visual display of currently granted permissions
- **React Query Integration**: Automatic cache invalidation on successful updates
- **Loading States**: Proper loading indicators during API calls
- **Error Handling**: User-friendly error messages with toast notifications
- **Accessibility**: Full ARIA support for screen readers and keyboard navigation
- **Responsive Design**: Works on all screen sizes

## Component Props

```typescript
interface PermissionManagementModalProps {
  member: BusinessMember;        // The member whose permissions are being managed
  businessId: string;            // The business ID for API calls
  isOpen: boolean;               // Controls modal visibility
  onClose: () => void;           // Callback when modal should close
}
```

## Usage Example

```typescript
import { useState } from 'react';
import { PermissionManagementModal } from './PermissionManagementModal';
import { BusinessMember } from '../types/permissions.types';

export function MembersList() {
  const [selectedMember, setSelectedMember] = useState<BusinessMember | null>(null);

  return (
    <>
      {/* Your member list UI */}
      <button onClick={() => setSelectedMember(member)}>
        Manage Permissions
      </button>

      {selectedMember && (
        <PermissionManagementModal
          member={selectedMember}
          businessId="business-123"
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}
```

## Permission String Format

The permission string is a 6-character string where each position represents a specific permission:

```
Position: 0 1 2 3 4 5
Format:   c u d a k p
Example:  c u d - - -  (Create, Update, Delete allowed)
```

**Position Mapping**:
- Position 0 (c): Create permission
- Position 1 (u): Update permission
- Position 2 (d): Delete permission
- Position 3 (a): Add member permission
- Position 4 (k): Kick member permission
- Position 5 (p): Promote permission

**Character Values**:
- Permission letter (c, u, d, a, k, p): Permission is granted
- Dash (-): Permission is denied

## Component Behavior

### Initial State
- Loads the member's current permissions from the `member.permissions` prop
- Displays toggle states based on the permission string
- Calculates and displays the count of granted permissions

### Toggle Interaction
- Clicking a toggle switch updates the permission string in real-time
- The permission string display updates immediately
- The granted permissions list updates to reflect changes
- The save button becomes enabled when permissions change

### Save Operation
1. User clicks "Save Changes" button
2. Component validates the permission string format
3. API call is made to update permissions
4. React Query cache is invalidated for business members
5. Modal closes on success
6. Toast notification confirms the update

### Error Handling
- API errors are caught and displayed as toast notifications
- Modal remains open on error, allowing user to retry
- User can modify permissions and try saving again

### Modal Controls
- **Close Button (X)**: Closes modal without saving
- **Cancel Button**: Closes modal without saving
- **Backdrop Click**: Closes modal without saving (click outside)
- **Save Changes Button**: Saves permissions and closes modal

## Integration with React Query

The component uses React Query for cache management:

```typescript
// Invalidates the business members cache
queryClient.invalidateQueries({
  queryKey: ['business-members', businessId],
});
```

This ensures that when permissions are updated, the business members list is automatically refetched with the latest data.

## API Integration

The component uses the `permissionsApi.updateMemberPermissions` method:

```typescript
// API call signature
updateMemberPermissions(
  businessId: string,
  userId: string,
  permissions: string
): Promise<BusinessMember>
```

**Endpoint**: `PATCH /businesses/:businessId/members/:userId/permissions`

**Request Body**:
```json
{
  "permissions": "cudakp"
}
```

**Response**: Updated BusinessMember object

## Accessibility Features

- **ARIA Labels**: All toggles have descriptive aria-labels
- **ARIA Checked State**: Toggles properly indicate their checked state
- **Keyboard Navigation**: All controls are keyboard accessible
- **Screen Reader Support**: Proper semantic HTML and ARIA attributes
- **Focus Management**: Proper focus handling for modal interactions

## Styling

The component uses Tailwind CSS for styling and follows the existing design system:

- **Colors**: Indigo for primary actions, gray for secondary
- **Spacing**: Consistent padding and margins
- **Typography**: Clear hierarchy with proper font sizes
- **Responsive**: Adapts to different screen sizes

## Testing

The component includes comprehensive tests covering:

- **Rendering**: Modal visibility, content display
- **Toggle Interactions**: Permission toggling, state updates
- **Save Functionality**: API calls, loading states, success/error handling
- **Error Handling**: Error messages, retry behavior
- **Modal Controls**: Close, cancel, backdrop click
- **Permission String Validation**: Format validation
- **Accessibility**: ARIA attributes, keyboard navigation

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for this component
npm run test PermissionManagementModal

# Run tests in watch mode
npm run test:watch
```

## Requirements Mapping

This component implements the following requirements:

- **5.1**: Display modal with 6 toggle switches for each permission type
- **5.2**: Display permission management option for business owners only
- **5.4**: Load current permission string and set toggle states
- **5.5**: Set permission character when toggle is switched on
- **5.6**: Set dash when toggle is switched off
- **5.7**: Send permission string to API when save button clicked
- **5.8**: Invalidate React Query cache for business members list
- **5.9**: Display error message when API returns error
- **5.10**: Validate permission string before sending to API

## Performance Considerations

- **Memoization**: Component uses React hooks efficiently
- **Query Caching**: React Query handles caching and refetching
- **Lazy Loading**: Modal only renders when `isOpen` is true
- **Debouncing**: No debouncing needed as toggles are discrete actions

## Security Considerations

- **API Validation**: Server-side validation of permission strings
- **Authorization**: Only business owners can update permissions
- **Self-Modification Prevention**: Users cannot modify their own permissions
- **Business Isolation**: Permissions are scoped to individual businesses

## Future Enhancements

- **Bulk Permission Updates**: Update multiple members at once
- **Permission Templates**: Save and apply permission presets
- **Audit Logging**: Track permission changes with timestamps
- **Permission Inheritance**: Inherit permissions from roles
- **Conditional Permissions**: Enable/disable permissions based on conditions

## Troubleshooting

### Modal Not Appearing
- Check that `isOpen` prop is `true`
- Verify `member` prop is properly populated
- Check browser console for errors

### Toggles Not Responding
- Ensure `permissionsApi` is properly configured
- Check that API endpoint is accessible
- Verify business ID is correct

### Changes Not Saving
- Check network tab for API errors
- Verify permission string format is valid
- Check that user has permission to update members

### Cache Not Invalidating
- Verify React Query is properly configured
- Check that query key matches in cache invalidation
- Ensure QueryClient is provided to component tree

## Related Components

- **BusinessMembersList**: Displays list of business members
- **MemberDetailModal**: Shows detailed member information
- **ConfirmModal**: Confirmation dialog for destructive actions

## Related Utilities

- **PermissionUtils**: Utility functions for permission manipulation
- **permissionsApi**: API client for permission operations
- **PERMISSION_LABELS**: Permission display labels
- **PERMISSION_DESCRIPTIONS**: Permission descriptions

## Related Types

- **BusinessMember**: Business member with permissions
- **PermissionType**: Enum for permission types
- **UpdatePermissionsDto**: DTO for permission updates
- **ParsedPermissions**: Parsed permissions object
