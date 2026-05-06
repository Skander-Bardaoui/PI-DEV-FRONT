import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskChat from './TaskChat';

// Mock dependencies
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    id: 'socket-123',
  })),
}));

vi.mock('./ThreadPanel', () => ({
  default: ({ onClose }: any) => (
    <div data-testid="thread-panel">
      <button onClick={onClose}>Close Thread</button>
    </div>
  ),
}));

global.fetch = vi.fn();

describe('TaskChat', () => {
  const mockMessages = [
    {
      id: '1',
      taskId: 'task-1',
      senderId: 'user-1',
      content: 'Hello world',
      createdAt: new Date().toISOString(),
      sender: {
        id: 'user-1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    },
    {
      id: '2',
      taskId: 'task-1',
      senderId: 'user-2',
      content: 'Hi there',
      createdAt: new Date().toISOString(),
      sender: {
        id: 'user-2',
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      },
    },
  ];

  const defaultProps = {
    taskId: 'task-1',
    taskTitle: 'Test Task',
    currentUserId: 'user-1',
    onClose: vi.fn(),
    businessId: 'business-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockMessages,
    } as Response);
  });

  it('renders chat modal with task title', async () => {
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task Chat')).toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('displays messages', async () => {
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
      expect(screen.getByText('Hi there')).toBeInTheDocument();
    });
  });

  it('displays sender names', async () => {
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows empty state when no messages', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);
    
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
      expect(screen.getByText('Start the conversation!')).toBeInTheDocument();
    });
  });

  it('renders message input', async () => {
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
    });
  });

  it('sends message when send button is clicked', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessages,
    } as Response);
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '3', content: 'New message' }),
    } as Response);
    
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'New message' } });
    
    const sendButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-send')
    );
    
    if (sendButton) {
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/messages'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    }
  });

  it('disables send button when message is empty', async () => {
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      const sendButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-send')
      );
      expect(sendButton).toBeDisabled();
    });
  });

  it('opens file picker when attach button is clicked', async () => {
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      const attachButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-paperclip')
      );
      expect(attachButton).toBeInTheDocument();
    });
  });

  it('shows color picker when palette button is clicked', async () => {
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      const paletteButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-palette')
      );
      
      if (paletteButton) {
        fireEvent.click(paletteButton);
        expect(screen.getByText('Choose chat color')).toBeInTheDocument();
      }
    });
  });

  it('shows mention dropdown when @ is typed', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessages,
    } as Response);
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: '1',
          user_id: 'user-2',
          user: {
            id: 'user-2',
            email: 'user2@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
          },
        },
      ],
    } as Response);
    
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type a message/i);
      fireEvent.change(input, { target: { value: '@' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Mention team member')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-x')
      );
      
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(defaultProps.onClose).toHaveBeenCalled();
      }
    });
  });

  it('displays typing indicator', async () => {
    const { io } = require('socket.io-client');
    const mockSocket = io();
    
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
    });
    
    // Simulate typing event
    const onHandler = vi.mocked(mockSocket.on).mock.calls.find(
      call => call[0] === 'userTyping'
    )?.[1];
    
    if (onHandler) {
      onHandler({ userId: 'user-2', userName: 'Jane Smith', isTyping: true });
    }
  });

  it('opens thread panel when thread button is clicked', async () => {
    const messageWithReplies = {
      ...mockMessages[0],
      replyCount: 3,
    };
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [messageWithReplies],
    } as Response);
    
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      const threadButton = screen.getByText(/3 réponse/i);
      fireEvent.click(threadButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('thread-panel')).toBeInTheDocument();
    });
  });

  it('closes thread panel', async () => {
    const messageWithReplies = {
      ...mockMessages[0],
      replyCount: 3,
    };
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [messageWithReplies],
    } as Response);
    
    render(<TaskChat {...defaultProps} />);
    
    await waitFor(() => {
      const threadButton = screen.getByText(/3 réponse/i);
      fireEvent.click(threadButton);
    });
    
    await waitFor(() => {
      const closeThreadButton = screen.getByText('Close Thread');
      fireEvent.click(closeThreadButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('thread-panel')).not.toBeInTheDocument();
    });
  });
});
