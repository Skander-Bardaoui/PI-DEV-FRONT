import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubtaskList from './SubtaskList';

// Mock dependencies
vi.mock('../api/subtasks.api', () => ({
  subtasksApi: {
    getByTask: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    generate: vi.fn(),
    markCompleteByTeamMember: vi.fn(),
  },
}));

vi.mock('../hooks/useAIAccess', () => ({
  useAIAccess: () => ({ hasAIAccess: true, loading: false }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('SubtaskList', () => {
  const mockSubtasks = [
    {
      id: '1',
      title: 'Subtask 1',
      taskId: 'task-1',
      order: 0,
      isCompleted: false,
      isCompletedByTeamMember: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Subtask 2',
      taskId: 'task-1',
      order: 1,
      isCompleted: true,
      isCompletedByTeamMember: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    taskId: 'task-1',
    taskTitle: 'Test Task',
    taskDescription: 'Test description',
    businessId: 'business-1',
    currentMember: {
      role: 'BUSINESS_OWNER',
      collaboration_permissions: {
        create_subtask: true,
        update_subtask: true,
        delete_subtask: true,
        mark_complete_subtask: true,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { subtasksApi } = require('../api/subtasks.api');
    subtasksApi.getByTask.mockResolvedValue(mockSubtasks);
  });

  it('renders subtasks list', async () => {
    render(<SubtaskList {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Subtask 1')).toBeInTheDocument();
      expect(screen.getByText('Subtask 2')).toBeInTheDocument();
    });
  });

  it('displays progress bar', async () => {
    render(<SubtaskList {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('1/2 (50%)')).toBeInTheDocument();
    });
  });

  it('shows generate AI button for business owner', async () => {
    render(<SubtaskList {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Generate with AI')).toBeInTheDocument();
    });
  });

  it('does not show generate AI button for team member without permission', async () => {
    const props = {
      ...defaultProps,
      currentMember: {
        role: 'TEAM_MEMBER',
        collaboration_permissions: {
          create_subtask: false,
          update_subtask: false,
          delete_subtask: false,
          mark_complete_subtask: true,
        },
      },
    };
    
    render(<SubtaskList {...props} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Generate with AI')).not.toBeInTheDocument();
    });
  });

  it('generates subtasks with AI', async () => {
    const { subtasksApi } = require('../api/subtasks.api');
    subtasksApi.generate.mockResolvedValue(['Generated subtask 1', 'Generated subtask 2']);
    
    render(<SubtaskList {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Generate with AI')).toBeInTheDocument();
    });
    
    const generateButton = screen.getByText('Generate with AI');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(subtasksApi.generate).toHaveBeenCalledWith({
        taskId: 'task-1',
        taskTitle: 'Test Task',
        taskDescription: 'Test description',
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Generated subtask 1')).toBeInTheDocument();
      expect(screen.getByText('Generated subtask 2')).toBeInTheDocument();
    });
  });

  it('accepts all AI suggestions', async () => {
    const { subtasksApi } = require('../api/subtasks.api');
    subtasksApi.generate.mockResolvedValue(['Generated subtask 1']);
    subtasksApi.create.mockResolvedValue({ id: '3', title: 'Generated subtask 1' });
    
    render(<SubtaskList {...defaultProps} />);
    
    await waitFor(() => {
      const generateButton = screen.getByText('Generate with AI');
      fireEvent.click(generateButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Accept all')).toBeInTheDocument();
    });
    
    const acceptButton = screen.getByText('Accept all');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(subtasksApi.create).toHaveBeenCalled();
    });
  });

  it('adds manual subtask', async () => {
    const { subtasksApi } = require('../api/subtasks.api');
    subtasksApi.create.mockResolvedValue({ id: '3', title: 'New subtask' });
    
    render(<SubtaskList {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a subtask...')).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText('Add a subtask...');
    fireEvent.change(input, { target: { value: 'New subtask' } });
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(subtasksApi.create).toHaveBeenCalledWith({
        title: 'New subtask',
        taskId: 'task-1',
        order: 2,
      });
    });
  });

  it('toggles subtask completion for business owner', async () => {
    const { subtasksApi } = require('../api/subtasks.api');
    subtasksApi.update.mockResolvedValue({});
    
    render(<SubtaskList {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    });
    
    const checkboxes = screen.getAllByRole('button');
    const firstCheckbox = checkboxes.find(btn => btn.classList.contains('flex-shrink-0'));
    
    if (firstCheckbox) {
      fireEvent.click(firstCheckbox);
      
      await waitFor(() => {
        expect(subtasksApi.update).toHaveBeenCalled();
      });
    }
  });

  it('marks subtask complete for team member', async () => {
    const { subtasksApi } = require('../api/subtasks.api');
    subtasksApi.markCompleteByTeamMember.mockResolvedValue({
      ...mockSubtasks[0],
      isCompletedByTeamMember: true,
    });
    
    const props = {
      ...defaultProps,
      currentMember: {
        role: 'TEAM_MEMBER',
        collaboration_permissions: {
          create_subtask: false,
          update_subtask: false,
          delete_subtask: false,
          mark_complete_subtask: true,
        },
      },
    };
    
    render(<SubtaskList {...props} />);
    
    await waitFor(() => {
      expect(screen.getByText('Mark Complete')).toBeInTheDocument();
    });
    
    const markCompleteButton = screen.getByText('Mark Complete');
    fireEvent.click(markCompleteButton);
    
    await waitFor(() => {
      expect(subtasksApi.markCompleteByTeamMember).toHaveBeenCalledWith('1', 'business-1');
    });
  });

  it('deletes subtask', async () => {
    const { subtasksApi } = require('../api/subtasks.api');
    subtasksApi.delete.mockResolvedValue({});
    
    render(<SubtaskList {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    });
    
    const subtaskRow = screen.getByText('Subtask 1').closest('.group');
    fireEvent.mouseEnter(subtaskRow!);
    
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('svg'));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(subtasksApi.delete).toHaveBeenCalledWith('1');
      });
    }
  });

  it('calls onProgressUpdate when subtask is toggled', async () => {
    const mockOnProgressUpdate = vi.fn();
    const { subtasksApi } = require('../api/subtasks.api');
    subtasksApi.update.mockResolvedValue({});
    
    render(<SubtaskList {...defaultProps} onProgressUpdate={mockOnProgressUpdate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    });
    
    const checkboxes = screen.getAllByRole('button');
    const firstCheckbox = checkboxes.find(btn => btn.classList.contains('flex-shrink-0'));
    
    if (firstCheckbox) {
      fireEvent.click(firstCheckbox);
      
      await waitFor(() => {
        expect(mockOnProgressUpdate).toHaveBeenCalled();
      });
    }
  });
});
