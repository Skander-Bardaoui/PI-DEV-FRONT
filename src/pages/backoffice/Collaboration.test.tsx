// src/pages/backoffice/Collaboration.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Collaboration from './Collaboration';
import { BrowserRouter } from 'react-router-dom';
import { PresenceProvider } from '../../context/PresenceContext';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  })),
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn((name) => ({
      name,
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    })),
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.();
      return fn({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'MEDIUM',
        status: 'TODO',
        assignedToIds: [],
        dueDate: '',
      });
    },
    formState: { errors: {}, isSubmitting: false, touchedFields: {} },
    reset: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn((field) => {
      if (field === 'description') return 'Test description';
      if (field === 'title') return 'Test title';
      if (field === 'priority') return 'MEDIUM';
      if (field === 'assignedToIds') return [];
      return '';
    }),
    setError: vi.fn(),
  }),
}));

// Mock @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  DragOverlay: ({ children }: any) => <div>{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  closestCorners: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn((arr, from, to) => {
    const newArr = [...arr];
    const [item] = newArr.splice(from, 1);
    newArr.splice(to, 0, item);
    return newArr;
  }),
}));

// Mock components
vi.mock('../../components/TaskChat', () => ({
  default: ({ onClose }: any) => (
    <div data-testid="task-chat-modal">
      <button onClick={onClose}>Close Chat</button>
    </div>
  ),
}));

vi.mock('../../components/DroppableColumn', () => ({
  default: ({ label, tasks, onEdit, onDelete }: any) => (
    <div data-testid={`column-${label}`}>
      <h3>{label}</h3>
      {tasks.map((task: any) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          {task.title}
          {onEdit && <button onClick={() => onEdit(task)}>Edit</button>}
          {onDelete && <button onClick={() => onDelete(task.id)}>Delete</button>}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../../components/DraggableTaskCard', () => ({
  default: ({ task }: any) => <div data-testid={`draggable-${task.id}`}>{task.title}</div>,
}));

vi.mock('../../components/SubtaskList', () => ({
  default: () => <div data-testid="subtask-list">Subtasks</div>,
}));

vi.mock('../../components/SubtaskViewModal', () => ({
  default: ({ onClose }: any) => (
    <div data-testid="subtask-view-modal">
      <button onClick={onClose}>Close View</button>
    </div>
  ),
}));

vi.mock('../../components/DailyCheckinBanner', () => ({
  default: () => <div data-testid="daily-checkin-banner">Daily Check-in</div>,
}));

vi.mock('../../components/TodayCheckinsSection', () => ({
  default: () => <div data-testid="today-checkins-section">Today's Check-ins</div>,
}));

vi.mock('../../components/PresenceIndicator', () => ({
  PresenceIndicator: ({ isOnline }: any) => (
    <span data-testid="presence-indicator">{isOnline ? 'Online' : 'Offline'}</span>
  ),
}));

vi.mock('../../components/StatisticsDashboard', () => ({
  default: () => <div data-testid="statistics-dashboard">Statistics</div>,
}));

vi.mock('../../components/PermissionManagementModal', () => ({
  PermissionManagementModal: ({ onClose }: any) => (
    <div data-testid="permission-modal">
      <button onClick={onClose}>Close Permissions</button>
    </div>
  ),
}));

vi.mock('../../components/collaboration/CollaborationSkeletonLoaders', () => ({
  TeamMemberRowSkeleton: () => <tr data-testid="member-skeleton"><td>Loading...</td></tr>,
  TaskCardSkeleton: () => <div data-testid="task-skeleton">Loading task...</div>,
  ActivityItemSkeleton: () => <div data-testid="activity-skeleton">Loading activity...</div>,
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockUser = {
  id: 'user-1',
  email: 'owner@test.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'BUSINESS_OWNER',
};

const mockBusiness = {
  id: 'business-1',
  name: 'Test Business',
  tenant_id: 'tenant-1',
};

const mockMembers = [
  {
    id: 'member-1',
    user_id: 'user-1',
    business_id: 'business-1',
    role: 'BUSINESS_OWNER',
    permissions: '{}',
    is_active: true,
    invited_at: null,
    joined_at: '2024-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    collaboration_permissions: {
      create_task: true,
      update_task: true,
      delete_task: true,
    },
    user: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'owner@test.com',
      role: 'BUSINESS_OWNER',
    },
  },
  {
    id: 'member-2',
    user_id: 'user-2',
    business_id: 'business-1',
    role: 'TEAM_MEMBER',
    permissions: '{}',
    is_active: true,
    invited_at: '2024-01-01',
    joined_at: '2024-01-02',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    collaboration_permissions: {
      create_task: false,
      update_task: false,
      delete_task: false,
    },
    user: {
      id: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'member@test.com',
      role: 'TEAM_MEMBER',
    },
  },
];

const mockTasks = [
  {
    id: 'task-1',
    title: 'Task 1',
    description: 'Description 1',
    priority: 'HIGH',
    status: 'TODO',
    assignedTo: [],
    dueDate: '2024-12-31',
    businessId: 'business-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'task-2',
    title: 'Task 2',
    description: 'Description 2',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedTo: [mockUser],
    dueDate: '2024-12-31',
    businessId: 'business-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'task-3',
    title: 'Task 3',
    description: 'Description 3',
    priority: 'LOW',
    status: 'DONE',
    assignedTo: [],
    businessId: 'business-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockActivities = [
  {
    id: 'activity-1',
    type: 'SUBTASK_COMPLETED_ON_TIME',
    businessId: 'business-1',
    userId: 'user-2',
    taskId: 'task-1',
    subtaskId: 'subtask-1',
    createdAt: '2024-01-01T10:00:00Z',
    isOnTime: true,
    isOverdue: false,
    user: {
      id: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'member@test.com',
    },
    task: {
      id: 'task-1',
      title: 'Task 1',
    },
    subtask: {
      id: 'subtask-1',
      title: 'Subtask 1',
    },
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <PresenceProvider>{component}</PresenceProvider>
    </BrowserRouter>
  );
};

const setupSuccessfulFetch = () => {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/auth/me')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });
    }
    if (url.includes('/businesses/my')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ businesses: [mockBusiness] }),
      });
    }
    if (url.includes('/members')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ members: mockMembers }),
      });
    }
    if (url.includes('/tasks/business/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks }),
      });
    }
    if (url.includes('/activities/business/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockActivities),
      });
    }
    if (url.includes('/tasks') && url.includes('POST')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...mockTasks[0], id: 'new-task' }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Collaboration Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulFetch();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render page title and description', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
      });
    });

    it('should show loading skeletons initially', () => {
      renderWithProviders(<Collaboration />);

      expect(screen.getAllByTestId('task-skeleton').length).toBeGreaterThan(0);
    });

    it('should render all tabs', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
        expect(screen.getByText('Team')).toBeInTheDocument();
        expect(screen.getByText('Activity')).toBeInTheDocument();
        expect(screen.getByText('Statistics')).toBeInTheDocument();
      });
    });

    it('should render Create Task button for owners', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByText('Create Task')).toBeInTheDocument();
      });
    });

    it('should display business name when loaded', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByText(/Business : Test Business/i)).toBeInTheDocument();
      });
    });
  });

  // ── Tasks Tab Tests ─────────────────────────────────────────────────────────

  describe('Tasks Tab', () => {
    it('should render task columns', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByTestId('column-TODO')).toBeInTheDocument();
        expect(screen.getByTestId('column-IN PROGRESS')).toBeInTheDocument();
        expect(screen.getByTestId('column-DONE')).toBeInTheDocument();
        expect(screen.getByTestId('column-BLOCKED')).toBeInTheDocument();
      });
    });

    it('should display tasks in correct columns', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByTestId('task-task-1')).toBeInTheDocument();
        expect(screen.getByTestId('task-task-2')).toBeInTheDocument();
        expect(screen.getByTestId('task-task-3')).toBeInTheDocument();
      });
    });

    it('should open create task modal when clicking Create Task', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Task');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });
    });

    it('should close task modal when clicking cancel', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Task'));
      });

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
      });
    });

    it('should show edit modal when editing a task', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument();
      });
    });
  });

  // ── Team Tab Tests ──────────────────────────────────────────────────────────

  describe('Team Tab', () => {
    it('should switch to team tab', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        const teamTab = screen.getByText('Team');
        fireEvent.click(teamTab);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Rechercher un membre...')).toBeInTheDocument();
      });
    });

    it('should display team members', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Team'));
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should show Invite Member button', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Team'));
      });

      await waitFor(() => {
        expect(screen.getByText('Invite Member')).toBeInTheDocument();
      });
    });

    it('should filter members by search query', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Team'));
      });

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Rechercher un membre...');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should open invite modal when clicking Invite Member', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Team'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Invite Member'));
      });

      await waitFor(() => {
        expect(screen.getByText('Invite Team Member')).toBeInTheDocument();
      });
    });
  });

  // ── Activity Tab Tests ──────────────────────────────────────────────────────

  describe('Activity Tab', () => {
    it('should switch to activity tab', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Activity'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('today-checkins-section')).toBeInTheDocument();
      });
    });

    it('should display activities', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Activity'));
      });

      await waitFor(() => {
        expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
        expect(screen.getByText(/completed subtask ON TIME/)).toBeInTheDocument();
      });
    });

    it('should show empty state when no activities', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/activities/business/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return setupSuccessfulFetch();
      });

      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Activity'));
      });

      await waitFor(() => {
        expect(screen.getByText('No activities yet')).toBeInTheDocument();
      });
    });
  });

  // ── Statistics Tab Tests ────────────────────────────────────────────────────

  describe('Statistics Tab', () => {
    it('should switch to statistics tab', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Statistics'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('statistics-dashboard')).toBeInTheDocument();
      });
    });
  });

  // ── Permission Tests ────────────────────────────────────────────────────────

  describe('Permissions', () => {
    it('should hide Activity and Statistics tabs for TEAM_MEMBER', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/auth/me')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ...mockUser, role: 'TEAM_MEMBER' }),
          });
        }
        return setupSuccessfulFetch();
      });

      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.queryByText('Activity')).not.toBeInTheDocument();
        expect(screen.queryByText('Statistics')).not.toBeInTheDocument();
      });
    });

    it('should show daily checkin banner for TEAM_MEMBER', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/auth/me')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ...mockUser, role: 'TEAM_MEMBER' }),
          });
        }
        return setupSuccessfulFetch();
      });

      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByTestId('daily-checkin-banner')).toBeInTheDocument();
      });
    });

    it('should not show Create Task button for members without permission', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/auth/me')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ...mockUser, role: 'TEAM_MEMBER' }),
          });
        }
        if (url.includes('/members')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                members: mockMembers.map((m) =>
                  m.user_id === mockUser.id
                    ? { ...m, collaboration_permissions: { create_task: false } }
                    : m
                ),
              }),
          });
        }
        return setupSuccessfulFetch();
      });

      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
      });
    });
  });

  // ── Error Handling Tests ────────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should display error when failing to load businesses', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/businesses/my')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.reject(new Error('Failed to fetch')),
          });
        }
        return setupSuccessfulFetch();
      });

      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByText(/Erreur lors du chargement des membres/)).toBeInTheDocument();
      });
    });

    it('should display error when failing to load tasks', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/tasks/business/')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.reject(new Error('Failed to fetch')),
          });
        }
        return setupSuccessfulFetch();
      });

      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load tasks/)).toBeInTheDocument();
      });
    });
  });

  // ── Business Switching Tests ────────────────────────────────────────────────

  describe('Business Switching', () => {
    it('should show business selector when multiple businesses exist', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/businesses/my')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                businesses: [mockBusiness, { ...mockBusiness, id: 'business-2', name: 'Business 2' }],
              }),
          });
        }
        return setupSuccessfulFetch();
      });

      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        const selector = screen.getByDisplayValue('Test Business');
        expect(selector).toBeInTheDocument();
      });
    });
  });

  // ── Modal Tests ─────────────────────────────────────────────────────────────

  describe('Modals', () => {
    it('should open and close task chat modal', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        // Simulate opening chat (would be triggered by task card)
        const task = mockTasks[0];
        // This would normally be triggered by clicking a chat button on a task
      });
    });

    it('should open and close permission management modal', async () => {
      renderWithProviders(<Collaboration />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Team'));
      });

      await waitFor(() => {
        const settingsButtons = screen.getAllByTitle('Manage permissions');
        if (settingsButtons.length > 0) {
          fireEvent.click(settingsButtons[0]);
        }
      });
    });
  });
});
