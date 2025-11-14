import { create } from 'zustand';
import { useEffect } from 'react';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  chart?: any;
}

// Storage key helper - scoped to user
const getStorageKey = (userId: string | null): string => {
  return userId ? `chat_history_${userId}` : 'chat_history_anonymous';
};

// Serialize messages for storage (convert Date to string)
const serializeMessages = (messages: Message[]): any[] => {
  return messages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp.toISOString(),
  }));
};

// Deserialize messages from storage (convert string back to Date)
const deserializeMessages = (stored: any[]): Message[] => {
  return stored.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
  }));
};

// Load messages from localStorage
const loadMessagesFromStorage = (userId: string | null): Message[] | null => {
  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return deserializeMessages(parsed);
    }
  } catch (error) {
    console.error('Error loading chat history from storage:', error);
  }
  return null;
};

// Save messages to localStorage
const saveMessagesToStorage = (userId: string | null, messages: Message[]): void => {
  const key = getStorageKey(userId);
  try {
    const serialized = serializeMessages(messages);
    localStorage.setItem(key, JSON.stringify(serialized));
  } catch (error) {
    console.error('Error saving chat history to storage:', error);
    // If storage quota exceeded, try to clear old data
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, clearing old chat history');
      try {
        // Clear storage for this user and try again
        localStorage.removeItem(key);
        const serialized = serializeMessages(messages);
        localStorage.setItem(key, JSON.stringify(serialized));
      } catch (retryError) {
        console.error('Failed to save after clearing storage:', retryError);
      }
    }
  }
};

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
  // Initial state - load from storage if available
  sessionId: null,
  messages: [],
  isInitialized: false,
  lastUpdated: new Date(),
  currentUserId: null,
  
  // Initialize chat for user
  initializeChat: async (userId: string) => {
    console.log(`🆕 Initializing chat for user ${userId}...`);
    
    // Try to load existing messages from storage
    const storedMessages = loadMessagesFromStorage(userId);
    
    if (storedMessages && storedMessages.length > 0) {
      console.log(`📦 Loaded ${storedMessages.length} messages from storage`);
      set({ 
        messages: storedMessages,
        sessionId: null,
        isInitialized: true,
        lastUpdated: new Date(),
        currentUserId: userId,
      });
    } else {
      // No stored messages, start with welcome message
      const welcomeMessage = getWelcomeMessage();
      set({ 
        messages: [welcomeMessage],
        sessionId: null,
        isInitialized: true,
        lastUpdated: new Date(),
        currentUserId: userId,
      });
      // Save welcome message to storage
      saveMessagesToStorage(userId, [welcomeMessage]);
    }
    console.log('🆕 Chat initialized');
  },

  // Add a new message to the chat
  addMessage: (message: Message) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      // Save to storage
      saveMessagesToStorage(state.currentUserId, newMessages);
      return { 
        messages: newMessages,
        lastUpdated: new Date()
      };
    });
  },
  
  // Set all messages (for bulk operations)
  setMessages: (messages: Message[]) => {
    const state = get();
    // Save to storage
    saveMessagesToStorage(state.currentUserId, messages);
    set({ 
      messages,
      lastUpdated: new Date()
    });
  },
  
  // Clear chat - back to welcome message
  clearChat: () => {
    const welcomeMessage = getWelcomeMessage();
    set((state) => {
      const newMessages = [welcomeMessage];
      // Save cleared state to storage
      saveMessagesToStorage(state.currentUserId, newMessages);
      return {
        messages: newMessages,
        lastUpdated: new Date(),
      };
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
  
  // Reset for new user - load their chat history or start fresh
  resetForNewUser: (userId: string) => {
    console.log(`🔄 Resetting chat for new user: ${userId}`);
    
    // Try to load existing messages from storage for this user
    const storedMessages = loadMessagesFromStorage(userId);
    
    if (storedMessages && storedMessages.length > 0) {
      console.log(`📦 Loaded ${storedMessages.length} messages from storage for user ${userId}`);
      set({
        sessionId: null,
        messages: storedMessages,
        isInitialized: true,
        lastUpdated: new Date(),
        currentUserId: userId,
      });
    } else {
      // No stored messages, start with welcome message
      const welcomeMessage = getWelcomeMessage();
      set({
        sessionId: null,
        messages: [welcomeMessage],
        isInitialized: true,
        lastUpdated: new Date(),
        currentUserId: userId,
      });
      // Save welcome message to storage
      saveMessagesToStorage(userId, [welcomeMessage]);
    }
    
    console.log('🔄 Chat reset complete for new user');
  },

  // ✅ NEW: Fully clear chat/session on logout or session expiry
  logoutAndClearSession: () => {
    console.log('👋 User logged out — clearing chat session completely');
    const state = get();
    // Clear storage for current user
    if (state.currentUserId) {
      try {
        const key = getStorageKey(state.currentUserId);
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error clearing chat storage:', error);
      }
    }
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
    // Handle logout: userId becomes null
    if (!userId && store.currentUserId) {
      // User logged out - clear chat session
      console.log(`👋 User logged out (userId: ${store.currentUserId}), clearing chat session`);
      store.logoutAndClearSession();
    } 
    // Handle login/new user: userId exists and is different from current
    else if (userId && store.currentUserId !== userId) {
      // User changed - reset for new user
      console.log(`🔄 User changed: ${store.currentUserId} -> ${userId}, resetting chat`);
      store.resetForNewUser(userId);
    } 
    // Handle initialization: userId exists but chat not initialized
    else if (userId && !store.isInitialized) {
      // User exists but chat not initialized
      console.log(`🚀 Initializing chat for user: ${userId}`);
      store.resetForNewUser(userId);
    }
  }, [userId, store.currentUserId, store.isInitialized]);
  
  return store;
};
