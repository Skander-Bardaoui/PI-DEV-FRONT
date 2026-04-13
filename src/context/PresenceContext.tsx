import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePresence } from '../hooks/usePresence';
import { useAuth } from '../hooks/useAuth';

interface PresenceContextType {
  onlineUsers: string[];
  userStatuses: Map<string, 'online' | 'offline'>;
  isConnected: boolean;
  setCurrentBusinessId: (businessId: string | null) => void;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const usePresenceContext = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresenceContext must be used within PresenceProvider');
  }
  return context;
};

interface PresenceProviderProps {
  children: ReactNode;
}

export const PresenceProvider: React.FC<PresenceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);
  
  // Initialize with user's business_id or from localStorage
  useEffect(() => {
    console.log('🔍 PresenceProvider - User:', user);
    console.log('🔍 User keys:', user ? Object.keys(user) : 'null');
    
    // If user is null (logged out), clear business ID
    if (!user) {
      console.log('🚪 User logged out, clearing presence connection');
      setCurrentBusinessId(null);
      localStorage.removeItem('currentBusinessId');
      return;
    }
    
    // Try multiple sources for businessId
    let businessId = null;
    
    if (user) {
      // Check user object for business_id (try multiple possible field names)
      businessId = user.business_id || (user as any).businessId || (user as any).business?.id;
      console.log('📍 Business ID from user.business_id:', user.business_id);
      console.log('📍 Business ID from user (any field):', businessId);
      
      // Store in localStorage for persistence
      if (businessId) {
        localStorage.setItem('currentBusinessId', businessId);
      }
    }
    
    // Fallback to localStorage
    if (!businessId) {
      businessId = localStorage.getItem('currentBusinessId');
      console.log('📍 Business ID from localStorage:', businessId);
    }
    
    if (businessId) {
      console.log('✅ Setting business ID for presence:', businessId);
      setCurrentBusinessId(businessId);
    } else {
      console.warn('⚠️ No business ID found for presence connection');
      console.warn('⚠️ User object structure:', JSON.stringify(user, null, 2));
    }
  }, [user]);
  
  const { onlineUsers, userStatuses, isConnected } = usePresence(currentBusinessId);
  
  // Log connection status
  useEffect(() => {
    console.log('🔌 Presence connection status:', { isConnected, currentBusinessId, onlineUsersCount: onlineUsers.length });
  }, [isConnected, currentBusinessId, onlineUsers]);

  return (
    <PresenceContext.Provider value={{ onlineUsers, userStatuses, isConnected, setCurrentBusinessId }}>
      {children}
    </PresenceContext.Provider>
  );
};
