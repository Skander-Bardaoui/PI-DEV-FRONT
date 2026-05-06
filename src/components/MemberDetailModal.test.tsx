/**
 * Tests for MemberDetailModal component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberDetailModal from './MemberDetailModal';

describe('MemberDetailModal', () => {
  const mockMember = {
    id: 'member-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'TEAM_MEMBER',
    assigned: 10,
    completed: 7,
    overdue: 2,
    inTime: 5,
    activityScore: 75,
  };

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Task 1',
      priority: 'HIGH' as const,
      status: 'TODO' as const,
      dueDate: '2026-05-10',
    },
    {
      id: 'task-2',
      title: 'Task 2',
      priority: 'MEDIUM' as const,
      status: 'IN_PROGRESS' as const,
      dueDate: '2026-05-15',
    },
    {
      id: 'task-3',
      title: 'Task 3',
      priority: 'LOW' as const,
      status: 'DONE' as const,
      dueDate: '2026-05-01',
    },
  ];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render member name', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render member email', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should render formatted role', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Team Member')).toBeInTheDocument();
  });

  it('should render member initials', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render stats cards', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();

    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    expect(screen.getByText('In Time')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render activity score', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Activity Score')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render tasks by status', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('should render task priorities', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('should render task due dates', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/5\/10\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/5\/15\/2026/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    const backdrop = document.querySelector('.fixed.inset-0');
    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    const modal = document.querySelector('.bg-white.rounded-2xl');
    fireEvent.click(modal!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should display "No tasks assigned" when tasks array is empty', () => {
    const memberWithNoTasks = { ...mockMember, assigned: 0 };

    render(
      <MemberDetailModal
        member={memberWithNoTasks}
        tasks={[]}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('No tasks assigned')).toBeInTheDocument();
  });

  it('should group tasks by status', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('To Do (1)')).toBeInTheDocument();
    expect(screen.getByText('In Progress (1)')).toBeInTheDocument();
    expect(screen.getByText('Done (1)')).toBeInTheDocument();
  });

  it('should show overdue badge for overdue tasks', () => {
    const overdueTasks = [
      {
        id: 'task-overdue',
        title: 'Overdue Task',
        priority: 'HIGH' as const,
        status: 'TODO' as const,
        dueDate: '2026-01-01', // Past date
      },
    ];

    render(
      <MemberDetailModal
        member={mockMember}
        tasks={overdueTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('should not show overdue badge for completed tasks', () => {
    const completedTasks = [
      {
        id: 'task-done',
        title: 'Done Task',
        priority: 'HIGH' as const,
        status: 'DONE' as const,
        dueDate: '2026-01-01', // Past date but task is done
      },
    ];

    render(
      <MemberDetailModal
        member={mockMember}
        tasks={completedTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('should apply correct progress bar color based on activity score', () => {
    const { container } = render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    const progressBar = container.querySelector('.bg-green-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('should apply yellow color for medium activity score', () => {
    const memberWithMediumScore = { ...mockMember, activityScore: 50 };

    const { container } = render(
      <MemberDetailModal
        member={memberWithMediumScore}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    const progressBar = container.querySelector('.bg-yellow-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('should apply red color for low activity score', () => {
    const memberWithLowScore = { ...mockMember, activityScore: 30 };

    const { container } = render(
      <MemberDetailModal
        member={memberWithLowScore}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    const progressBar = container.querySelector('.bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render "Assigned Tasks" heading', () => {
    render(
      <MemberDetailModal
        member={mockMember}
        tasks={mockTasks}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Assigned Tasks')).toBeInTheDocument();
  });
});
