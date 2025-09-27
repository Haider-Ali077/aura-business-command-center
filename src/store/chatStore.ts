import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
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
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages,
        isInitialized: state.isInitialized,
        lastUpdated: state.lastUpdated,
        currentUserId: state.currentUserId,
      }),
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          if (!value) return null;
          
          try {
            const parsed = JSON.parse(value);
            // Convert timestamp strings back to Date objects
            if (parsed.state?.messages) {
              parsed.state.messages = parsed.state.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }));
            }
            if (parsed.state?.lastUpdated) {
              parsed.state.lastUpdated = new Date(parsed.state.lastUpdated);
            }
            return parsed;
          } catch (error) {
            console.error('Error parsing chat store data:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Convert Date objects to ISO strings for storage
            const serializedValue = {
              ...value,
              state: {
                ...value.state,
                messages: value.state?.messages?.map((msg: Message) => ({
                  ...msg,
                  timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
                })) || [],
                lastUpdated: value.state?.lastUpdated instanceof Date 
                  ? value.state.lastUpdated.toISOString() 
                  : value.state?.lastUpdated,
              }
            };
            localStorage.setItem(name, JSON.stringify(serializedValue));
          } catch (error) {
            console.error('Error serializing chat store data:', error);
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

// ✅ CRITICAL: Create a user-specific hook that forces isolation
export const useUserChatStore = (userId: string | null) => {
  const store = useChatStore();
  
  // Force reset ONLY when user actually changes, not on navigation
  useEffect(() => {
    if (userId && store.currentUserId !== userId) {
      // User actually changed - always reset for new user
      console.log(`🔄 User changed: ${store.currentUserId} -> ${userId}, resetting chat`);
      store.resetForNewUser(userId);
    } else if (userId && !store.isInitialized) {
      // User exists but chat not initialized (e.g., first load)
      console.log(`🚀 Initializing chat for user: ${userId}`);
      store.resetForNewUser(userId);
    }
  }, [userId, store.currentUserId, store.isInitialized]);
  
  return store;
};

// Create user-specific store instance
const createUserChatStore = (userId: string) => {
  return create<ChatStore>()(
    persist(
      (set, get) => ({
        sessionId: null,
        messages: [],
        isInitialized: false,
        lastUpdated: new Date(),
        currentUserId: userId,
        
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
        },
    
        addMessage: (message: Message) => {
          set((state) => ({ 
            messages: [...state.messages, message],
            lastUpdated: new Date()
          }));
        },
        
        setMessages: (messages: Message[]) => {
          set({ 
            messages,
            lastUpdated: new Date()
          });
        },
        
        clearChat: () => {
          const welcomeMessage = getWelcomeMessage();
          set({ 
            messages: [welcomeMessage],
            lastUpdated: new Date(),
          });
        },
        
        setSessionId: (sessionId: string) => {
          set({ sessionId });
        },
        
        markAsInitialized: () => {
          set({ isInitialized: true });
        },
        
        resetForNewUser: (newUserId: string) => {
          console.log(`🔄 Resetting chat for new user: ${newUserId}`);
          const welcomeMessage = getWelcomeMessage();
          set({
            sessionId: null,
            messages: [welcomeMessage],
            isInitialized: true,
            lastUpdated: new Date(),
            currentUserId: newUserId,
          });
        },
      }),
      {
        name: `chat-store-${userId || 'anonymous'}`,
        partialize: (state) => ({
          sessionId: state.sessionId,
          messages: state.messages,
          isInitialized: state.isInitialized,
          lastUpdated: state.lastUpdated,
          currentUserId: state.currentUserId,
        }),
      }
    )
  );
};

// Store instances cache
const storeInstances = new Map<string, ReturnType<typeof createUserChatStore>>();

// Stable store that persists during navigation and refresh
export const useStableChatStore = (userId: string | null) => {
  const storeKey = userId || 'anonymous';
  
  // Get or create store instance for this user
  if (!storeInstances.has(storeKey)) {
    storeInstances.set(storeKey, createUserChatStore(storeKey));
  }
  
  const store = storeInstances.get(storeKey)!();
  
  // Initialize chat if not already done
  useEffect(() => {
    if (userId && !store.isInitialized) {
      console.log(`🚀 Initializing chat for user: ${userId}`);
      store.initializeChat(userId);
    }
  }, [userId, store.isInitialized]);
  
  // Clear store instances on logout
  useEffect(() => {
    if (!userId) {
      console.log('🚪 User logged out, clearing all store instances');
      storeInstances.clear();
    } else if (store.currentUserId !== userId) {
      console.log(`🔄 User changed: ${store.currentUserId} -> ${userId}`);
      // Clear old instances and create new one
      storeInstances.clear();
      storeInstances.set(storeKey, createUserChatStore(storeKey));
    }
  }, [userId]);
  
  return store;
};
