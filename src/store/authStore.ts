
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  user_id: number;
  email: string;
  tenant_id: number; // This is the tenant ID as an integer from the database
  tenant_name: string; // This is also the database name for SQL queries
  role_name: string; // This is the role name from the database query
  is_active: boolean;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isSessionExpired: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // const response = await fetch('http://localhost:8000/api/auth/login', {
            const response = await fetch('https://sql-database-agent.onrender.com/api/auth/login', {
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

          set({ session, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          });
        }
      },

      logout: () => {
        set({ session: null, error: null });
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
    }),
    {
      name: 'auth-session',
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
);
