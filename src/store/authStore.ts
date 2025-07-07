
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  user_id: number;
  email: string;
  tenant_id: number;
  role_id: number;
  is_active: boolean;
}

export interface TenantInfo {
  id: string;
  name: string;
  database_url: string;
  company_code: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
  tenantInfo: TenantInfo;
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
          const response = await fetch('http://localhost:8000/api/auth/login', {
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
          
          // Mock tenant info - replace with actual data from your API
          const tenantInfo: TenantInfo = {
            id: data.user.tenant_id.toString(),
            name: `Company ${data.user.tenant_id}`,
            database_url: `Server=localhost;Database=company_${data.user.tenant_id}_erp;Integrated Security=true;`,
            company_code: `Company_${String.fromCharCode(64 + data.user.tenant_id)}`
          };
          
          const session: AuthSession = {
            user: data.user,
            token: data.token,
            expiresAt,
            tenantInfo
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
