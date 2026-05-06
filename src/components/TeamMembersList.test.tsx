/**
 * Tests for TeamMembersList component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeamMembersList } from './TeamMembersList';

// Mock hooks
vi.mock('../hooks/usePresence', () => ({
  usePresence: vi.fn(),
}));

import { usePresence } from '../hooks/usePresence';

describe('TeamMembersList', () => {
  const mockMembers = [
    {
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Developer',
      avatarUrl: 'https://example.com/avatar1.jpg',
    },
    {
      userId: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'Designer',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (usePresence as any).mockReturnValue({
      userStatuses: new Map([
        ['user-1', 'online'],
        ['user-2', 'offline'],
      ]),
      isConnected: true,
    });
  });

  it('should render list of team members', () => {
    render(<TeamMembersList businessId="business-123" members={mockMembers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display member roles', () => {
    render(<TeamMembersList businessId="business-123" members={mockMembers} />);
    
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  it('should show online status for online members', () => {
    render(<TeamMembersList businessId="business-123" members={mockMembers} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should show offline status for offline members', () => {
    render(<TeamMembersList businessId="business-123" members={mockMembers} />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should display avatar image when avatarUrl is provided', () => {
    render(<TeamMembersList businessId="business-123" members={mockMembers} />);
    
    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar1.jpg');
  });

  it('should display initials when no avatarUrl', () => {
    render(<TeamMembersList businessId="business-123" members={mockMembers} />);
    
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('should show connecting message when not connected', () => {
    (usePresence as any).mockReturnValue({
      userStatuses: new Map(),
      isConnected: false,
    });
    
    render(<TeamMembersList businessId="business-123" members={mockMembers} />);
    
    expect(screen.getByText('Connecting to real-time status...')).toBeInTheDocument();
  });

  it('should render empty list when no members', () => {
    const { container } = render(<TeamMembersList businessId="business-123" members={[]} />);
    
    const memberCards = container.querySelectorAll('.flex.items-center.gap-3');
    expect(memberCards.length).toBe(0);
  });
});
