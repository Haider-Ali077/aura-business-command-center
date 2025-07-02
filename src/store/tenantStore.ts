
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
          // Call your Python admin database API
          const response = await fetch(`http://localhost:8000/api/v1/admin/users/${userId}/tenants`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
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
              permissions: ['read', 'write'], // Will come from admin DB
              lastAccessed: new Date(),
            };
            set({ currentSession: session });
          }
        } catch (error) {
          console.error('Error fetching tenants:', error);
          set({ error: (error as Error).message, isLoading: false });
          
          // Set dummy data for development
          const dummyTenants = [
            {
              id: 'company_a',
              name: 'Company A',
              database_url: 'postgresql://localhost:5432/company_a_erp',
              company_code: 'COMP_A'
            },
            {
              id: 'company_b', 
              name: 'Company B',
              database_url: 'postgresql://localhost:5432/company_b_erp',
              company_code: 'COMP_B'
            },
            {
              id: 'company_c',
              name: 'Company C', 
              database_url: 'postgresql://localhost:5432/company_c_erp',
              company_code: 'COMP_C'
            }
          ];
          
          set({ tenants: dummyTenants, isLoading: false, error: null });
          
          if (dummyTenants.length > 0) {
            const defaultTenant = dummyTenants[0];
            const session: UserSession = {
              userId,
              email: '',
              tenantId: defaultTenant.id,
              tenantInfo: defaultTenant,
              permissions: ['read', 'write'],
              lastAccessed: new Date(),
            };
            set({ currentSession: session });
          }
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
