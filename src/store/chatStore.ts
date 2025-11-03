import { create } from 'zustand';
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
  resetForNewUser: (userId: string) => void; 
  logoutAndClearSession: () => void; // ✅ New action for logout/session end
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

export const useChatStore = create<ChatStore>()((set, get) => ({
  // Initial state - in-memory only (no persistence)
  sessionId: null,
  messages: [],
  isInitialized: false,
  lastUpdated: new Date(),
  currentUserId: null,
  
  // Initialize chat for user
  initializeChat: async (userId: string) => {
    console.log(`🆕 Initializing chat for user ${userId}...`);
    
    const welcomeMessage = getWelcomeMessage();
    set({ 
      messages: [welcomeMessage],
      sessionId: null,
      isInitialized: true,
      lastUpdated: new Date(),
      currentUserId: userId,
    });
    console.log('🆕 Chat initialized with welcome message');
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
  
  // Reset for new user - clear everything
  resetForNewUser: (userId: string) => {
    console.log(`🔄 Resetting chat for new user: ${userId}`);
    
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

  // ✅ NEW: Fully clear chat/session on logout or session expiry
  logoutAndClearSession: () => {
    console.log('👋 User logged out — clearing chat session completely');
    set({
      sessionId: null,
      messages: [],
      isInitialized: false,
      lastUpdated: new Date(),
      currentUserId: null,
    });
  },
}));

// Simple hook for chat store with user isolation
export const useUserChatStore = (userId: string | null) => {
  const store = useChatStore();
  
  // Initialize or reset chat when user changes
  useEffect(() => {
    if (userId && store.currentUserId !== userId) {
      // User changed - reset for new user
      console.log(`🔄 User changed: ${store.currentUserId} -> ${userId}, resetting chat`);
      store.resetForNewUser(userId);
    } else if (userId && !store.isInitialized) {
      // User exists but chat not initialized
      console.log(`🚀 Initializing chat for user: ${userId}`);
      store.resetForNewUser(userId);
    }
  }, [userId, store.currentUserId, store.isInitialized]);
  
  return store;
};
