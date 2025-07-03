
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TenantInfo {
  id: string;
  name: string;
  database_url: string;
  company_code: string;
}

export interface UserSession {
  userId: number;
  email: string;
  tenantId: number;
  roleId: number;
  tenantInfo: TenantInfo;
  lastAccessed: Date;
}

interface TenantStore {
  currentSession: UserSession | null;
  tenants: TenantInfo[];
  isLoading: boolean;
  error: string | null;
  setSession: (session: UserSession) => void;
  clearSession: () => void;
  fetchUserTenants: (userId: number, tenantId: number) => Promise<void>;
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

      fetchUserTenants: async (userId: number, tenantId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`http://localhost:8000/api/v1/admin/users/${userId}/tenants`, {
            headers: {
              'Content-Type': 'application/json',
              'X-User-ID': userId.toString(),
              'X-Tenant-ID': tenantId.toString(),
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch tenants');
          }
          
          const tenants = await response.json();
          set({ tenants, isLoading: false });
        } catch (error) {
          console.error('Error fetching tenants:', error);
          set({ error: (error as Error).message, isLoading: false });
          
          // Set dummy data for development
          const dummyTenants = [
            {
              id: 'company_a',
              name: 'Company A',
              database_url: 'Server=localhost;Database=company_a_erp;Integrated Security=true;',
              company_code: 'COMP_A'
            },
            {
              id: 'company_b', 
              name: 'Company B',
              database_url: 'Server=localhost;Database=company_b_erp;Integrated Security=true;',
              company_code: 'COMP_B'
            },
            {
              id: 'company_c',
              name: 'Company C', 
              database_url: 'Server=localhost;Database=company_c_erp;Integrated Security=true;',
              company_code: 'COMP_C'
            }
          ];
          
          set({ tenants: dummyTenants, isLoading: false, error: null });
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
          tenantId: parseInt(tenantId),
          tenantInfo: tenant,
          lastAccessed: new Date(),
        };

        set({ currentSession: updatedSession });
        
        await get().refreshDashboardData();
      },

      refreshDashboardData: async () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({ isLoading: true });
        try {
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
