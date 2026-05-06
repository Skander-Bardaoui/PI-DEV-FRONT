/**
 * Tests for DraggableTaskCard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DraggableTaskCard from './DraggableTaskCard';

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock SubtaskProgress component
vi.mock('./SubtaskProgress', () => ({
  default: () => <div>Subtask Progress</div>,
}));

import { useSortable } from '@dnd-kit/sortable';

describe('DraggableTaskCard', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test description',
    priority: 'HIGH' as const,
    status: 'TODO' as const,
    assignedTo: [
      {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'TEAM_MEMBER',
      },
    ],
    dueDate: '2026-05-10',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01',
  };

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
    (useSortable as any).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    });
  });

  it('should render task title', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render task description', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should render priority badge', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should render due date', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('May 10')).toBeInTheDocument();
  });

  it('should render assigned user initials', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should open chat when chat button is clicked', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    const chatButton = screen.getByTitle('Open chat');
    fireEvent.click(chatButton);

    expect(mockOnOpenChat).toHaveBeenCalledWith(mockTask);
  });

  it('should show view button when canManage is false and onView is provided', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onOpenChat={mockOnOpenChat}
        canManage={false}
        teamMembers={mockTeamMembers}
      />
    );

    const viewButton = screen.getByTitle('View subtasks');
    expect(viewButton).toBeInTheDocument();
  });

  it('should call onView when view button is clicked', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onOpenChat={mockOnOpenChat}
        canManage={false}
        teamMembers={mockTeamMembers}
      />
    );

    const viewButton = screen.getByTitle('View subtasks');
    fireEvent.click(viewButton);

    expect(mockOnView).toHaveBeenCalledWith(mockTask);
  });

  it('should show menu when more button is clicked (canManage=true)', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    const moreButton = screen.getByRole('button', { name: '' });
    fireEvent.click(moreButton);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onEdit when edit is clicked', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    const moreButton = screen.getByRole('button', { name: '' });
    fireEvent.click(moreButton);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete when delete is clicked', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    const moreButton = screen.getByRole('button', { name: '' });
    fireEvent.click(moreButton);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('task-1');
  });

  it('should call onUpdateStatus when status is changed', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    const moreButton = screen.getByRole('button', { name: '' });
    fireEvent.click(moreButton);

    const inProgressButton = screen.getByText('IN PROGRESS');
    fireEvent.click(inProgressButton);

    expect(mockOnUpdateStatus).toHaveBeenCalledWith('task-1', 'IN_PROGRESS');
  });

  it('should disable drag when canManage is false', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={false}
        teamMembers={mockTeamMembers}
      />
    );

    expect(useSortable).toHaveBeenCalledWith(
      expect.objectContaining({ disabled: true })
    );
  });

  it('should enable drag when canManage is true', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(useSortable).toHaveBeenCalledWith(
      expect.objectContaining({ disabled: false })
    );
  });

  it('should render SubtaskProgress component', () => {
    render(
      <DraggableTaskCard
        task={mockTask}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('Subtask Progress')).toBeInTheDocument();
  });

  it('should show +N indicator when more than 3 users assigned', () => {
    const taskWithManyUsers = {
      ...mockTask,
      assignedTo: [
        { id: '1', email: 'user1@test.com', firstName: 'User', lastName: 'One', role: 'TEAM_MEMBER' },
        { id: '2', email: 'user2@test.com', firstName: 'User', lastName: 'Two', role: 'TEAM_MEMBER' },
        { id: '3', email: 'user3@test.com', firstName: 'User', lastName: 'Three', role: 'TEAM_MEMBER' },
        { id: '4', email: 'user4@test.com', firstName: 'User', lastName: 'Four', role: 'TEAM_MEMBER' },
        { id: '5', email: 'user5@test.com', firstName: 'User', lastName: 'Five', role: 'TEAM_MEMBER' },
      ],
    };

    render(
      <DraggableTaskCard
        task={taskWithManyUsers}
        onUpdateStatus={mockOnUpdateStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onOpenChat={mockOnOpenChat}
        canManage={true}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
