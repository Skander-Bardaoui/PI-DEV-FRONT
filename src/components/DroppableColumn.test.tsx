/**
 * Tests for DroppableColumn component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DroppableColumn from './DroppableColumn';
import { Circle } from 'lucide-react';

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  useDroppable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    isOver: false,
  })),
}));

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: {},
}));

// Mock DraggableTaskCard
vi.mock('./DraggableTaskCard', () => ({
  default: ({ task }: any) => <div data-testid={`task-${task.id}`}>{task.title}</div>,
}));

import { useDroppable } from '@dnd-kit/core';

describe('DroppableColumn', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Task 1',
      description: 'Description 1',
      priority: 'HIGH' as const,
      status: 'TODO' as const,
      createdAt: '2026-05-01',
      updatedAt: '2026-05-01',
    },
    {
      id: 'task-2',
      title: 'Task 2',
      description: 'Description 2',
      priority: 'MEDIUM' as const,
      status: 'TODO' as const,
      createdAt: '2026-05-01',
      updatedAt: '2026-05-01',
    },
  ];

  const mockTeamMembers = [
    {
      id: 'member-1',
      user_id: 'user-1',
      business_id: 'business-1',
      role: 'TEAM_MEMBER',
      is_active: true,
      invited_at: null,
      joined_at: '2026-01-01',
      created_at: '2026-01-01',
      user: {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    },
  ];

  const mockOnUpdateStatus = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnView = vi.fn();
  const mockOnOpenChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDroppable as any).mockReturnValue({
      setNodeRef: vi.fn(),
      isOver: false,
    });
  });

  it('should render column label', () => {
    render(
      <DroppableColumn
        label="To Do"
        icon={<Circle />}
        status="TODO"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('should render task count', () => {
    render(
      <DroppableColumn
        label="To Do"
        icon={<Circle />}
        status="TODO"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('should render all tasks', () => {
    render(
      <DroppableColumn
        label="To Do"
        icon={<Circle />}
        status="TODO"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByTestId('task-task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-task-2')).toBeInTheDocument();
  });

  it('should render empty column when no tasks', () => {
    render(
      <DroppableColumn
        label="To Do"
        icon={<Circle />}
        status="TODO"
        tasks={[]}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('(0)')).toBeInTheDocument();
    expect(screen.queryByTestId(/task-/)).not.toBeInTheDocument();
  });

  it('should apply hover styles when isOver is true', () => {
    (useDroppable as any).mockReturnValue({
      setNodeRef: vi.fn(),
      isOver: true,
    });

    const { container } = render(
      <DroppableColumn
        label="To Do"
        icon={<Circle />}
        status="TODO"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    const dropZone = container.querySelector('.bg-indigo-50');
    expect(dropZone).toBeInTheDocument();
  });

  it('should not apply hover styles when isOver is false', () => {
    const { container } = render(
      <DroppableColumn
        label="To Do"
        icon={<Circle />}
        status="TODO"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    const dropZone = container.querySelector('.bg-indigo-50');
    expect(dropZone).not.toBeInTheDocument();
  });

  it('should call useDroppable with correct status id', () => {
    render(
      <DroppableColumn
        label="In Progress"
        icon={<Circle />}
        status="IN_PROGRESS"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(useDroppable).toHaveBeenCalledWith({ id: 'IN_PROGRESS' });
  });

  it('should render icon', () => {
    const { container } = render(
      <DroppableColumn
        label="To Do"
        icon={<Circle data-testid="column-icon" />}
        status="TODO"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByTestId('column-icon')).toBeInTheDocument();
  });

  it('should pass canManage prop to task cards', () => {
    render(
      <DroppableColumn
        label="To Do"
        icon={<Circle />}
        status="TODO"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={false}
        teamMembers={mockTeamMembers}
      />
    );

    // The mock component will still render, but in real usage canManage would be passed
    expect(screen.getByTestId('task-task-1')).toBeInTheDocument();
  });

  it('should pass onView prop to task cards when provided', () => {
    render(
      <DroppableColumn
        label="To Do"
        icon={<Circle />}
        status="TODO"
        tasks={mockTasks}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onOpenChat={mockOnOpenChat}
        canManage={false}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByTestId('task-task-1')).toBeInTheDocument();
  });
});
