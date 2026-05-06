/**
 * Tests for DailyCheckinBanner component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DailyCheckinBanner from './DailyCheckinBanner';
import { checkinsApi } from '../api/checkins.api';

// Mock API
vi.mock('../api/checkins.api', () => ({
  checkinsApi: {
    hasCheckedInToday: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('DailyCheckinBanner', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Complete feature',
      priority: 'HIGH' as const,
      status: 'TODO' as const,
    },
    {
      id: 'task-2',
      title: 'Fix bug',
      priority: 'URGENT' as const,
      status: 'IN_PROGRESS' as const,
    },
    {
      id: 'task-3',
      title: 'Done task',
      priority: 'LOW' as const,
      status: 'DONE' as const,
    },
  ];

  const mockOnCheckinComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (checkinsApi.hasCheckedInToday as any).mockResolvedValue({ hasCheckedIn: false });
  });

  it('should not render when already checked in', async () => {
    (checkinsApi.hasCheckedInToday as any).mockResolvedValue({ hasCheckedIn: true });
    
    const { container } = render(
      <DailyCheckinBanner
        businessId="business-123"
        assignedTasks={mockTasks}
        onCheckinComplete={mockOnCheckinComplete}
      />
    );
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render greeting message', async () => {
    render(
      <DailyCheckinBanner
        businessId="business-123"
        userFirstName="John"
        assignedTasks={mockTasks}
        onCheckinComplete={mockOnCheckinComplete}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Good morning, John!/)).toBeInTheDocument();
    });
  });

  it('should display only active tasks (TODO and IN_PROGRESS)', async () => {
    render(
      <DailyCheckinBanner
        businessId="business-123"
        assignedTasks={mockTasks}
        onCheckinComplete={mockOnCheckinComplete}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Complete feature')).toBeInTheDocument();
      expect(screen.getByText('Fix bug')).toBeInTheDocument();
      expect(screen.queryByText('Done task')).not.toBeInTheDocument();
    });
  });

  it('should allow selecting tasks', async () => {
    render(
      <DailyCheckinBanner
        businessId="business-123"
        assignedTasks={mockTasks}
        onCheckinComplete={mockOnCheckinComplete}
      />
    );
    
    await waitFor(() => {
      const taskButton = screen.getByText('Complete feature').closest('button');
      expect(taskButton).toBeInTheDocument();
      
      if (taskButton) {
        fireEvent.click(taskButton);
        expect(taskButton.className).toContain('bg-white');
      }
    });
  });

  it('should submit check-in with selected tasks', async () => {
    (checkinsApi.create as any).mockResolvedValue({});
    
    render(
      <DailyCheckinBanner
        businessId="business-123"
        assignedTasks={mockTasks}
        onCheckinComplete={mockOnCheckinComplete}
      />
    );
    
    await waitFor(() => {
      const taskButton = screen.getByText('Complete feature').closest('button');
      if (taskButton) fireEvent.click(taskButton);
    });
    
    const submitButton = screen.getByText('Submit Check-in');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(checkinsApi.create).toHaveBeenCalledWith({
        businessId: 'business-123',
        taskIds: ['task-1'],
        note: undefined,
        skipped: false,
      });
    });
  });

  it('should handle skip action', async () => {
    (checkinsApi.create as any).mockResolvedValue({});
    
    render(
      <DailyCheckinBanner
        businessId="business-123"
        assignedTasks={mockTasks}
        onCheckinComplete={mockOnCheckinComplete}
      />
    );
    
    await waitFor(() => {
      const skipButton = screen.getByText('Skip for today');
      fireEvent.click(skipButton);
    });
    
    await waitFor(() => {
      expect(checkinsApi.create).toHaveBeenCalledWith({
        businessId: 'business-123',
        taskIds: [],
        skipped: true,
      });
    });
  });

  it('should show message when no active tasks', async () => {
    render(
      <DailyCheckinBanner
        businessId="business-123"
        assignedTasks={[mockTasks[2]]} // Only DONE task
        onCheckinComplete={mockOnCheckinComplete}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/You don't have any active tasks assigned/)).toBeInTheDocument();
    });
  });

  it('should allow closing the banner', async () => {
    const { container } = render(
      <DailyCheckinBanner
        businessId="business-123"
        assignedTasks={mockTasks}
        onCheckinComplete={mockOnCheckinComplete}
      />
    );
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close banner');
      fireEvent.click(closeButton);
    });
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
