
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TenantInfo {
  id: string;
  name: string;
  database_url: string;
  company_code: string;
}

export interface UserSession {
  userId: string;
  email: string;
  tenantId: string;
  tenantInfo: TenantInfo;
  permissions: string[];
  lastAccessed: Date;
}

interface TenantStore {
  currentSession: UserSession | null;
  tenants: TenantInfo[];
  isLoading: boolean;
  error: string | null;
  setSession: (session: UserSession) => void;
  clearSession: () => void;
  fetchUserTenants: (userId: string) => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshDashboardData: () => Promise<void>;
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      tenants: [],
      isLoading: false,
      error: null,

      setSession: (session) => {
        set({ currentSession: session, error: null });
      },

      clearSession: () => {
        set({ currentSession: null, tenants: [], error: null });
      },

      fetchUserTenants: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Dummy API call to admin database
          const response = await fetch(`/api/admin/users/${userId}/tenants`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch tenants');
          }
          
          const tenants = await response.json();
          set({ tenants, isLoading: false });
          
          // Set default tenant if user has access to any
          if (tenants.length > 0 && !get().currentSession?.tenantId) {
            const defaultTenant = tenants[0];
            const session: UserSession = {
              userId,
              email: '', // Will be filled from Auth0
              tenantId: defaultTenant.id,
              tenantInfo: defaultTenant,
              permissions: ['read', 'write'], // Default permissions
              lastAccessed: new Date(),
            };
            set({ currentSession: session });
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      switchTenant: async (tenantId: string) => {
        const { tenants, currentSession } = get();
        const tenant = tenants.find(t => t.id === tenantId);
        
        if (!tenant || !currentSession) {
          throw new Error('Tenant not found or no active session');
        }

        const updatedSession: UserSession = {
          ...currentSession,
          tenantId,
          tenantInfo: tenant,
          lastAccessed: new Date(),
        };

        set({ currentSession: updatedSession });
        
        // Refresh dashboard data for new tenant
        await get().refreshDashboardData();
      },

      refreshDashboardData: async () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({ isLoading: true });
        try {
          // This will trigger data refresh in other stores
          console.log(`Refreshing data for tenant: ${currentSession.tenantInfo.name}`);
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: 'tenant-session',
      partialize: (state) => ({
        currentSession: state.currentSession,
        tenants: state.tenants,
      }),
    }
  )
);
