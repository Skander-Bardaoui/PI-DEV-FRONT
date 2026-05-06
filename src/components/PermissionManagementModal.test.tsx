import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PermissionManagementModal } from './PermissionManagementModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../api/permissions.api', () => ({
  permissionsApi: {
    updateMemberPermissions: vi.fn(),
  },
}));

vi.mock('./ui/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PermissionManagementModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockMember = {
    user_id: 'user-1',
    role: 'TEAM_MEMBER',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
    collaboration_permissions: {
      create_task: true,
      update_task: false,
      delete_task: false,
      create_subtask: false,
      update_subtask: false,
      delete_subtask: false,
      mark_complete_subtask: true,
      add_member: false,
      kick_member: false,
      promote_member: false,
    },
    stock_permissions: {
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
    },
    payment_permissions: {},
    sales_permissions: {},
    purchase_permissions: {},
  };

  const defaultProps = {
    member: mockMember,
    businessId: 'business-1',
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<PermissionManagementModal {...defaultProps} isOpen={false} />, {
      wrapper: createWrapper(),
    });
    
    expect(screen.queryByText('Manage Permissions')).not.toBeInTheDocument();
  });

  it('renders modal with member information', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
    expect(screen.getByText(/Configure permissions for John Doe/i)).toBeInTheDocument();
  });

  it('displays collaboration permissions section', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    expect(screen.getByText('🤝 Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.getByText('Delete Task')).toBeInTheDocument();
  });

  it('displays stock management permissions section', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    expect(screen.getByText('📦 Stock Management')).toBeInTheDocument();
    expect(screen.getByText('Create Product')).toBeInTheDocument();
    expect(screen.getByText('Update Product')).toBeInTheDocument();
  });

  it('displays payment management permissions section', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    expect(screen.getByText('💳 Payment Management')).toBeInTheDocument();
  });

  it('displays sales management permissions section', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    expect(screen.getByText('🛒 Sales Management')).toBeInTheDocument();
  });

  it('displays purchases management permissions section', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    expect(screen.getByText('🛒 Purchases Management')).toBeInTheDocument();
  });

  it('toggles permission when switch is clicked', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    const updateTaskSwitch = screen.getByLabelText('Toggle Update Task permission');
    fireEvent.click(updateTaskSwitch);
    
    expect(updateTaskSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('disables save button when no changes', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when changes are made', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    const updateTaskSwitch = screen.getByLabelText('Toggle Update Task permission');
    fireEvent.click(updateTaskSwitch);
    
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).not.toBeDisabled();
  });

  it('saves permissions when save button is clicked', async () => {
    const { permissionsApi } = require('../api/permissions.api');
    permissionsApi.updateMemberPermissions.mockResolvedValue({});
    
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    const updateTaskSwitch = screen.getByLabelText('Toggle Update Task permission');
    fireEvent.click(updateTaskSwitch);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(permissionsApi.updateMemberPermissions).toHaveBeenCalled();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', () => {
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(btn => btn.querySelector('svg'));
    
    if (xButton) {
      fireEvent.click(xButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('shows read-only view for business owner', () => {
    const ownerMember = {
      ...mockMember,
      role: 'BUSINESS_OWNER',
    };
    
    render(<PermissionManagementModal {...defaultProps} member={ownerMember} />, {
      wrapper: createWrapper(),
    });
    
    expect(screen.getByText('Business Owner Permissions')).toBeInTheDocument();
    expect(screen.getByText('Full Access Granted')).toBeInTheDocument();
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  it('closes business owner modal when close button is clicked', () => {
    const ownerMember = {
      ...mockMember,
      role: 'BUSINESS_OWNER',
    };
    
    render(<PermissionManagementModal {...defaultProps} member={ownerMember} />, {
      wrapper: createWrapper(),
    });
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays loading state when saving', async () => {
    const { permissionsApi } = require('../api/permissions.api');
    permissionsApi.updateMemberPermissions.mockImplementation(() => new Promise(() => {}));
    
    render(<PermissionManagementModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });
    
    const updateTaskSwitch = screen.getByLabelText('Toggle Update Task permission');
    fireEvent.click(updateTaskSwitch);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });
});
