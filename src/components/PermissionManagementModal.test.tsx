// src/components/PermissionManagementModal.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PermissionManagementModal } from './PermissionManagementModal';
import { permissionsApi } from '../api/permissions.api';
import { ToastProvider } from './ui/Toast';
import { BusinessMember, PermissionType } from '../types/permissions.types';

// Mock the API
vi.mock('../api/permissions.api');

// Mock toast
vi.mock('./ui/Toast', async () => {
  const actual = await vi.importActual('./ui/Toast');
  return {
    ...actual,
    useToast: () => ({
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    }),
  };
});

// Test data
const mockMember: BusinessMember = {
  id: 'member-1',
  user_id: 'user-1',
  business_id: 'business-1',
  role: 'BUSINESS_ADMIN',
  permissions: 'cud---',
  is_active: true,
  user: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('PermissionManagementModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={false}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
      expect(screen.getByText(/Configure permissions for John Doe/)).toBeInTheDocument();
    });

    it('should display all 6 permission toggles', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Add Member')).toBeInTheDocument();
      expect(screen.getByText('Kick Member')).toBeInTheDocument();
      expect(screen.getByText('Promote')).toBeInTheDocument();
    });

    it('should display permission descriptions', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Create new records and resources')).toBeInTheDocument();
      expect(screen.getByText('Edit existing records and resources')).toBeInTheDocument();
      expect(screen.getByText('Delete records and resources')).toBeInTheDocument();
    });

    it('should display current permission string', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('cud---')).toBeInTheDocument();
    });

    it('should display count of granted permissions', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/3 of 6 permissions granted/)).toBeInTheDocument();
    });

    it('should display granted permissions list', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Toggle Interactions', () => {
    it('should toggle permission on when clicked', async () => {
      const user = userEvent.setup();
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Find the toggle for "Add Member" (position 3, currently off)
      const toggles = screen.getAllByRole('switch');
      const addMemberToggle = toggles[3]; // Add Member is at index 3

      await user.click(addMemberToggle);

      // Permission string should update to include 'a' at position 3
      await waitFor(() => {
        expect(screen.getByText('cuda--')).toBeInTheDocument();
      });
    });

    it('should toggle permission off when clicked', async () => {
      const user = userEvent.setup();
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Find the toggle for "Create" (position 0, currently on)
      const toggles = screen.getAllByRole('switch');
      const createToggle = toggles[0];

      await user.click(createToggle);

      // Permission string should update to remove 'c' at position 0
      await waitFor(() => {
        expect(screen.getByText('-ud---')).toBeInTheDocument();
      });
    });

    it('should update granted permissions list when toggling', async () => {
      const user = userEvent.setup();
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Initially 3 permissions granted
      expect(screen.getByText(/3 of 6 permissions granted/)).toBeInTheDocument();

      // Toggle on "Add Member"
      const toggles = screen.getAllByRole('switch');
      await userEvent.click(toggles[3]);

      // Now 4 permissions granted
      await waitFor(() => {
        expect(screen.getByText(/4 of 6 permissions granted/)).toBeInTheDocument();
      });
    });

    it('should disable toggles while saving', async () => {
      const user = userEvent.setup();
      vi.mocked(permissionsApi.updateMemberPermissions).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]);

      // Click save
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Toggles should be disabled
      await waitFor(() => {
        toggles.forEach((toggle) => {
          expect(toggle).toBeDisabled();
        });
      });
    });
  });

  describe('Save Functionality', () => {
    it('should disable save button when no changes made', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when permissions changed', async () => {
      const user = userEvent.setup();
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]);

      // Save button should be enabled
      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).not.toBeDisabled();
    });

    it('should call API with correct parameters on save', async () => {
      const user = userEvent.setup();
      const mockUpdatePermissions = vi.fn().mockResolvedValue(mockMember);
      vi.mocked(permissionsApi.updateMemberPermissions).mockImplementation(
        mockUpdatePermissions
      );

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]); // Add Member

      // Click save
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // API should be called with correct parameters
      await waitFor(() => {
        expect(mockUpdatePermissions).toHaveBeenCalledWith(
          'business-1',
          'user-1',
          'cuda--'
        );
      });
    });

    it('should show loading state while saving', async () => {
      const user = userEvent.setup();
      vi.mocked(permissionsApi.updateMemberPermissions).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]);

      // Click save
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });

    it('should close modal on successful save', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      vi.mocked(permissionsApi.updateMemberPermissions).mockResolvedValue(
        mockMember
      );

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={onClose}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]);

      // Click save
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Modal should close
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to update permissions';
      vi.mocked(permissionsApi.updateMemberPermissions).mockRejectedValue({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]);

      // Click save
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should not close modal on API error', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      vi.mocked(permissionsApi.updateMemberPermissions).mockRejectedValue({
        response: {
          data: {
            message: 'API Error',
          },
        },
      });

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={onClose}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]);

      // Click save
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Modal should not close
      await waitFor(() => {
        expect(onClose).not.toHaveBeenCalled();
      });
    });

    it('should validate permission string before sending', async () => {
      const user = userEvent.setup();
      const mockUpdatePermissions = vi.fn();
      vi.mocked(permissionsApi.updateMemberPermissions).mockImplementation(
        mockUpdatePermissions
      );

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]);

      // Click save
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // API should be called with valid permission string
      await waitFor(() => {
        expect(mockUpdatePermissions).toHaveBeenCalledWith(
          'business-1',
          'user-1',
          expect.stringMatching(/^[cud\-][cud\-][cud\-][ak\-][ak\-][p\-]$/)
        );
      });
    });
  });

  describe('Modal Controls', () => {
    it('should close modal when close button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={onClose}
        />,
        { wrapper: createWrapper() }
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should close modal when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={onClose}
        />,
        { wrapper: createWrapper() }
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should close modal when clicking outside', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { container } = render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={onClose}
        />,
        { wrapper: createWrapper() }
      );

      const backdrop = container.querySelector('.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close modal when clicking inside content', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={onClose}
        />,
        { wrapper: createWrapper() }
      );

      const title = screen.getByText('Manage Permissions');
      await user.click(title);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should disable close button while saving', async () => {
      const user = userEvent.setup();
      vi.mocked(permissionsApi.updateMemberPermissions).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Toggle a permission
      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[3]);

      // Click save
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Close button should be disabled
      const closeButton = screen.getByRole('button', { name: /close/i });
      await waitFor(() => {
        expect(closeButton).toBeDisabled();
      });
    });
  });

  describe('Permission String Validation', () => {
    it('should handle all permission combinations correctly', async () => {
      const user = userEvent.setup();
      const testCases = [
        { permissions: 'cudakp', count: 6 }, // All permissions
        { permissions: '------', count: 0 }, // No permissions
        { permissions: 'c-----', count: 1 }, // Only create
        { permissions: '-u----', count: 1 }, // Only update
        { permissions: '--d---', count: 1 }, // Only delete
        { permissions: '---a--', count: 1 }, // Only add member
        { permissions: '----k-', count: 1 }, // Only kick member
        { permissions: '-----p', count: 1 }, // Only promote
      ];

      for (const testCase of testCases) {
        const testMember = { ...mockMember, permissions: testCase.permissions };

        const { unmount } = render(
          <PermissionManagementModal
            member={testMember}
            businessId="business-1"
            isOpen={true}
            onClose={vi.fn()}
          />,
          { wrapper: createWrapper() }
        );

        expect(screen.getByText(testCase.permissions)).toBeInTheDocument();
        expect(
          screen.getByText(new RegExp(`${testCase.count} of 6 permissions granted`))
        ).toBeInTheDocument();

        unmount();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for toggles', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      const toggles = screen.getAllByRole('switch');
      expect(toggles[0]).toHaveAttribute('aria-label', 'Toggle Create permission');
      expect(toggles[1]).toHaveAttribute('aria-label', 'Toggle Update permission');
      expect(toggles[2]).toHaveAttribute('aria-label', 'Toggle Delete permission');
    });

    it('should have proper ARIA checked state', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      const toggles = screen.getAllByRole('switch');
      // First 3 should be checked (cud---)
      expect(toggles[0]).toHaveAttribute('aria-checked', 'true');
      expect(toggles[1]).toHaveAttribute('aria-checked', 'true');
      expect(toggles[2]).toHaveAttribute('aria-checked', 'true');
      // Last 3 should not be checked
      expect(toggles[3]).toHaveAttribute('aria-checked', 'false');
      expect(toggles[4]).toHaveAttribute('aria-checked', 'false');
      expect(toggles[5]).toHaveAttribute('aria-checked', 'false');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <PermissionManagementModal
          member={mockMember}
          businessId="business-1"
          isOpen={true}
          onClose={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      const heading = screen.getByText('Manage Permissions');
      expect(heading.tagName).toBe('H2');
    });
  });
});
