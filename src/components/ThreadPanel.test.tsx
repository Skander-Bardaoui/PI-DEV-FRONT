import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThreadPanel from './ThreadPanel';

global.fetch = vi.fn();

describe('ThreadPanel', () => {
  const mockParentMessage = {
    id: 'msg-1',
    taskId: 'task-1',
    senderId: 'user-1',
    content: 'Parent message',
    createdAt: new Date().toISOString(),
    sender: {
      id: 'user-1',
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const mockReplies = [
    {
      id: 'reply-1',
      taskId: 'task-1',
      senderId: 'user-2',
      content: 'First reply',
      parentMessageId: 'msg-1',
      createdAt: new Date().toISOString(),
      sender: {
        id: 'user-2',
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      },
    },
  ];

  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };

  const mockTeamMembers = [
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
  ];

  const defaultProps = {
    parentMessage: mockParentMessage,
    taskId: 'task-1',
    currentUserId: 'user-1',
    socket: mockSocket as any,
    onClose: vi.fn(),
    teamMembers: mockTeamMembers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ replies: mockReplies }),
    } as Response);
  });

  it('renders thread panel with parent message', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    expect(screen.getByText('Fil de discussion')).toBeInTheDocument();
    expect(screen.getByText('Parent message')).toBeInTheDocument();
  });

  it('displays reply count', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('1 réponse')).toBeInTheDocument();
    });
  });

  it('displays replies', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('First reply')).toBeInTheDocument();
    });
  });

  it('shows empty state when no replies', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ replies: [] }),
    } as Response);
    
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Aucune réponse pour le moment')).toBeInTheDocument();
      expect(screen.getByText('Soyez le premier à répondre!')).toBeInTheDocument();
    });
  });

  it('renders reply input', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Répondre...')).toBeInTheDocument();
    });
  });

  it('sends reply when send button is clicked', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ replies: mockReplies }),
    } as Response);
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'reply-2', content: 'New reply' }),
    } as Response);
    
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Répondre...')).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText('Répondre...');
    fireEvent.change(input, { target: { value: 'New reply' } });
    
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

  it('disables send button when reply is empty', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      const sendButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-send')
      );
      expect(sendButton).toBeDisabled();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
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

  it('shows mention dropdown when @ is typed', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Répondre...');
      fireEvent.change(input, { target: { value: '@' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Mentionner un membre')).toBeInTheDocument();
    });
  });

  it('inserts mention when team member is selected', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Répondre...');
      fireEvent.change(input, { target: { value: '@' } });
    });
    
    await waitFor(() => {
      const memberButton = screen.getByText('Jane Smith');
      fireEvent.click(memberButton);
    });
    
    const input = screen.getByPlaceholderText('Répondre...') as HTMLTextAreaElement;
    expect(input.value).toContain('Jane Smith');
  });

  it('displays file attachment button', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      const attachButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-paperclip')
      );
      expect(attachButton).toBeInTheDocument();
    });
  });

  it('displays mention button', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      const mentionButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-at-sign')
      );
      expect(mentionButton).toBeInTheDocument();
    });
  });

  it('listens for new replies via socket', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('newReply', expect.any(Function));
    });
  });

  it('cleans up socket listeners on unmount', async () => {
    const { unmount } = render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalled();
    });
    
    unmount();
    
    expect(mockSocket.off).toHaveBeenCalledWith('newReply', expect.any(Function));
  });

  it('displays parent message sender name', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays reply sender names', async () => {
    render(<ThreadPanel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
});
