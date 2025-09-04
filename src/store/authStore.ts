
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE_URL } from '@/config/api';

export interface User {
  user_id: number;
  email: string;
  tenant_id: number; // This is the tenant ID as an integer from the database
  tenant_name: string; // This is also the database name for SQL queries
  role_name: string; // This is the role name from the database query
  is_active: boolean;
  user_name?: string;
  profile_picture?: string | null;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

interface AuthStore {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isSessionExpired: () => boolean;
  clearError: () => void;
  updateActivity: () => void;
  checkInactivity: () => void;
  updateProfilePicture: (profilePicture: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      error: null,
      lastActivity: Date.now(),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now
          
          const session: AuthSession = {
            user: data.user,
            token: data.token,
            expiresAt
          };

          set({ session, isLoading: false, lastActivity: Date.now() });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          });
        }
      },

      logout: () => {
        const { session } = get();
        
        // Clear chatbot history before logging out
        if (session?.user?.user_id) {
          try {
            const userId = session.user.user_id;
            localStorage.removeItem(`intellyca-${userId}-chat-messages`);
            localStorage.removeItem(`intellyca-${userId}-chat-open`);
            console.log('Cleared chatbot history for user:', userId);
          } catch (error) {
            console.error('Error clearing chatbot history on logout:', error);
          }
        }
        
        set({ session: null, error: null, lastActivity: Date.now() });
      },

      isAuthenticated: () => {
        const { session } = get();
        if (!session) return false;
        return !get().isSessionExpired();
      },

      isSessionExpired: () => {
        const { session } = get();
        if (!session) return true;
        return new Date() > new Date(session.expiresAt);
      },

      clearError: () => {
        set({ error: null });
      },

      updateActivity: () => {
        set({ lastActivity: Date.now() });
      },

      checkInactivity: () => {
        const { lastActivity, session } = get();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        if (session && Date.now() - lastActivity > thirtyMinutes) {
          get().logout();
        }
      },

      updateProfilePicture: (profilePicture: string | null) => {
        const currentSession = get().session;
        if (currentSession) {
          set({
            session: {
              ...currentSession,
              user: {
                ...currentSession.user,
                profile_picture: profilePicture
              }
            }
          });
        }
      },
    }),
    {
      name: 'auth-session',
      partialize: (state) => ({
        session: state.session,
        lastActivity: state.lastActivity,
      }),
    }
  )
);
