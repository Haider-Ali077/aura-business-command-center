import { create } from 'zustand';
import { API_BASE_URL } from '@/config/api';
import { useEffect } from 'react';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  chart?: any;
}

export interface ChatSession {
  sessionId: string | null;
  messages: Message[];
  isInitialized: boolean;
  lastUpdated: Date;
}

interface ChatStore {
  // State
  sessionId: string | null;
  messages: Message[];
  isInitialized: boolean;
  lastUpdated: Date;
  currentUserId: string | null; // Track current user
  
  // Actions
  initializeChat: (userId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearChat: () => void;
  setSessionId: (sessionId: string) => void;
  markAsInitialized: () => void;
  resetForNewUser: (userId: string) => void; // ✅ NEW: Force reset for user change
}

// Helper function to convert backend message format to frontend format
const convertBackendMessage = (backendMsg: any): Message => {
  return {
    id: backendMsg.id || String(Date.now() + Math.random()),
    type: backendMsg.role === 'user' ? 'user' : 'bot',
    content: backendMsg.content || '',
    timestamp: new Date(backendMsg.timestamp || Date.now()),
    chart: backendMsg.metadata?.structured_data || null,
  };
};

// Helper function to get welcome message
const getWelcomeMessage = (): Message => ({
  id: '1',
  type: 'bot',
  content: `Hello! I'm Intellyca, your AI-powered business intelligence assistant. What would you like to explore today?`,
  timestamp: new Date(),
});

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state - START EMPTY, no welcome message
  sessionId: null,
  messages: [], // Start with NO messages
  isInitialized: false, // Start as not initialized
  lastUpdated: new Date(),
  currentUserId: null, // Track current user
  
  // Initialize chat - ALWAYS start completely fresh
  initializeChat: async (userId: string) => {
    console.log(`🆕 Starting completely fresh chat for user ${userId}...`);
    
    // ✅ FORCE: Clear everything and start empty
    set({
      sessionId: null,
      messages: [], // Start with NO messages
      isInitialized: false,
      lastUpdated: new Date(),
      currentUserId: null,
    });
    
    // Now add welcome message
    const welcomeMessage = getWelcomeMessage();
    set({ 
      messages: [welcomeMessage],
      sessionId: null,
      isInitialized: true,
      lastUpdated: new Date(),
      currentUserId: userId,
    });
    console.log('🆕 Fresh chat started - completely empty start');
  },
  
  // Add a new message to the chat
  addMessage: (message: Message) => {
    set((state) => ({ 
      messages: [...state.messages, message],
      lastUpdated: new Date()
    }));
  },
  
  // Set all messages (for bulk operations)
  setMessages: (messages: Message[]) => {
    set({ 
      messages,
      lastUpdated: new Date()
    });
  },
  
  // Clear chat - back to welcome message
  clearChat: () => {
    const welcomeMessage = getWelcomeMessage();
    set({ 
      messages: [welcomeMessage],
      lastUpdated: new Date(),
    });
  },
  
  // Set session ID
  setSessionId: (sessionId: string) => {
    set({ sessionId });
  },
  
  // Mark chat as initialized
  markAsInitialized: () => {
    set({ isInitialized: true });
  },
  
  // ✅ CRITICAL: Force reset for user change - start completely empty
  resetForNewUser: (userId: string) => {
    console.log(`🔄 Resetting chat for new user: ${userId} - starting completely empty`);
    
    // First clear everything
    set({
      sessionId: null,
      messages: [], // Start completely empty
      isInitialized: false,
      lastUpdated: new Date(),
      currentUserId: null,
    });
    
    // Then add welcome message
    const welcomeMessage = getWelcomeMessage();
    set({
      sessionId: null,
      messages: [welcomeMessage],
      isInitialized: true,
      lastUpdated: new Date(),
      currentUserId: userId,
    });
    
    console.log('🔄 Chat reset complete - fresh start for new user');
  },
}));

// ✅ CRITICAL: Create a user-specific hook that forces isolation
export const useUserChatStore = (userId: string | null) => {
  const store = useChatStore();
  
  // Force reset ONLY when user actually changes, not on navigation
  useEffect(() => {
    if (userId && store.currentUserId !== userId) {
      // Only reset if we have a different user AND the current user has messages
      // This prevents resetting when the same user navigates between pages
      if (store.currentUserId && store.messages.length > 1) {
        console.log(`🔄 User actually changed: ${store.currentUserId} -> ${userId}, resetting chat`);
        store.resetForNewUser(userId);
      } else if (!store.currentUserId) {
        // First time initialization
        console.log(`🚀 First time initialization for user: ${userId}`);
        store.resetForNewUser(userId);
      }
    }
  }, [userId]); // Remove store.currentUserId dependency to prevent unnecessary resets
  
  return store;
};

// ✅ ADDITIONAL: Create a more stable store that persists during navigation
export const useStableChatStore = (userId: string | null) => {
  const store = useChatStore();
  
  // Only reset on actual user change, preserve during navigation
  useEffect(() => {
    if (userId && store.currentUserId && store.currentUserId !== userId) {
      // User actually changed (different account)
      console.log(`🔄 Different user detected: ${store.currentUserId} -> ${userId}`);
      store.resetForNewUser(userId);
    } else if (userId && !store.currentUserId) {
      // First time for this user
      console.log(`🚀 First time for user: ${userId}`);
      store.resetForNewUser(userId);
    }
    // If same user, do nothing - preserve messages during navigation
  }, [userId]);
  
  return store;
};
