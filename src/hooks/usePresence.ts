import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UserStatus {
  userId: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
}

interface UsePresenceReturn {
  onlineUsers: string[];
  userStatuses: Map<string, 'online' | 'offline'>;
  isConnected: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const usePresence = (businessId: string | null): UsePresenceReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<string, 'online' | 'offline'>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!businessId) {
      return;
    }

    console.log('🔌 Connecting to presence WebSocket...', { businessId, API_BASE });

    // Connect to WebSocket root (no namespace) - same as messages gateway
    // Use withCredentials to send HTTP-only cookies
    const newSocket = io(API_BASE, {
      withCredentials: true,
      query: {
        businessId,
        presence: 'true', // Flag to identify presence connections
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to presence server');
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from presence server:', reason);
      setIsConnected(false);
    });

    // Listen for online users list
    newSocket.on('onlineUsers', (users: string[]) => {
      console.log('👥 Online users:', users);
      setOnlineUsers(users);
      
      // Update user statuses
      const newStatuses = new Map<string, 'online' | 'offline'>();
      users.forEach(userId => {
        newStatuses.set(userId, 'online');
      });
      setUserStatuses(newStatuses);
    });

    // Listen for user status changes
    newSocket.on('userStatusChanged', (data: UserStatus) => {
      console.log('🔄 User status changed:', data);
      
      setUserStatuses(prev => {
        const newStatuses = new Map(prev);
        newStatuses.set(data.userId, data.status);
        return newStatuses;
      });

      if (data.status === 'online') {
        setOnlineUsers(prev => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      } else {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      }
    });

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('heartbeat');
      }
    }, 30000);

    setSocket(newSocket);

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      newSocket.disconnect();
    };
  }, [businessId]);

  return {
    onlineUsers,
    userStatuses,
    isConnected,
  };
};
