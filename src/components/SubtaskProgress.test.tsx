/**
 * Tests for SubtaskProgress component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubtaskProgress from './SubtaskProgress';

// Mock dependencies
vi.mock('../api/subtasks.api', () => ({
  subtasksApi: {
    getTaskProgress: vi.fn(),
  },
}));

import { subtasksApi } from '../api/subtasks.api';

describe('SubtaskProgress', () => {
  const mockProgress = {
    completed: 3,
    total: 5,
    percentage: 60,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (subtasksApi.getTaskProgress as any).mockResolvedValue(mockProgress);
  });

  it('should not render when loading', () => {
    const { container } = render(<SubtaskProgress taskId="task-1" />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when total is 0', async () => {
    (subtasksApi.getTaskProgress as any).mockResolvedValue({
      completed: 0,
      total: 0,
      percentage: 0,
    });

    const { container } = render(<SubtaskProgress taskId="task-1" />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render compact version', async () => {
    render(<SubtaskProgress taskId="task-1" compact={true} />);

    await waitFor(() => {
      expect(screen.getByText('3/5')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  it('should render full version', async () => {
    render(<SubtaskProgress taskId="task-1" compact={false} />);

    await waitFor(() => {
      expect(screen.getByText('Subtasks Progress')).toBeInTheDocument();
      expect(screen.getByText('3/5 (60%)')).toBeInTheDocument();
    });
  });

  it('should display progress bar in compact mode', async () => {
    const { container } = render(<SubtaskProgress taskId="task-1" compact={true} />);

    await waitFor(() => {
      const progressBar = container.querySelector('.bg-gradient-to-r');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '60%' });
    });
  });

  it('should display progress bar in full mode', async () => {
    const { container } = render(<SubtaskProgress taskId="task-1" compact={false} />);

    await waitFor(() => {
      const progressBar = container.querySelector('.bg-gradient-to-r');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '60%' });
    });
  });

  it('should display CheckCircle icon', async () => {
    const { container } = render(<SubtaskProgress taskId="task-1" />);

    await waitFor(() => {
      expect(container.querySelector('.lucide-check-circle-2')).toBeInTheDocument();
    });
  });

  it('should call getTaskProgress with correct taskId', async () => {
    render(<SubtaskProgress taskId="task-123" />);

    await waitFor(() => {
      expect(subtasksApi.getTaskProgress).toHaveBeenCalledWith('task-123');
    });
  });

  it('should handle API error gracefully', async () => {
    (subtasksApi.getTaskProgress as any).mockRejectedValue(new Error('API Error'));

    const { container } = render(<SubtaskProgress taskId="task-1" />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should show 100% progress when all completed', async () => {
    (subtasksApi.getTaskProgress as any).mockResolvedValue({
      completed: 5,
      total: 5,
      percentage: 100,
    });

    render(<SubtaskProgress taskId="task-1" compact={true} />);

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('should show 0% progress when none completed', async () => {
    (subtasksApi.getTaskProgress as any).mockResolvedValue({
      completed: 0,
      total: 5,
      percentage: 0,
    });

    render(<SubtaskProgress taskId="task-1" compact={true} />);

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('should have smaller height in compact mode', async () => {
    const { container } = render(<SubtaskProgress taskId="task-1" compact={true} />);

    await waitFor(() => {
      const progressBar = container.querySelector('.h-1\\.5');
      expect(progressBar).toBeInTheDocument();
    });
  });

  it('should have larger height in full mode', async () => {
    const { container } = render(<SubtaskProgress taskId="task-1" compact={false} />);

    await waitFor(() => {
      const progressBar = container.querySelector('.h-2');
      expect(progressBar).toBeInTheDocument();
    });
  });

  it('should have transition animation', async () => {
    const { container } = render(<SubtaskProgress taskId="task-1" />);

    await waitFor(() => {
      const progressBar = container.querySelector('.transition-all');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
