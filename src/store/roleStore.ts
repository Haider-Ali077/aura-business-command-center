import { create } from 'zustand';
import { useAuthStore } from './authStore';

export interface DashboardModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  roles: string[];
}

export const dashboardModules: DashboardModule[] = [
  {
    id: 'executive',
    name: 'Executive Summary',
    icon: 'BarChart3',
    description: 'High-level KPIs across departments',
    roles: ['Admin']
  },
  {
    id: 'finance',
    name: 'Finance Analytics',
    icon: 'DollarSign',
    description: 'Revenue, expenses, profit margins, cash flow',
    roles: ['CFO']
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: 'TrendingUp',
    description: 'Sales funnel, lead conversion, revenue tracking',
    roles: ['CEO','Finance Manager','Sales user','Sales/Inventory user','Sales/Purchase user']
  },
  {
    id: 'purchase',
    name: 'Purchase',
    icon: 'ShoppingCart',
    description: 'Purchase orders, supplier management, procurement',
    roles: ['CEO','Finance Manager','Purchase user','Purchase/Inventory user','Sales/Purchase user']
  },
  {
    id: 'inventory',
    name: 'Inventory & Supply Chain',
    icon: 'Package',
    description: 'Stock levels, turnover, supplier metrics',
    roles: ['CEO','Finance Manager','Inventory user','Sales/Inventory user','Purchase/Inventory user']
  },
  {
    id: 'hr',
    name: 'Human Resources',
    icon: 'Users',
    description: 'Headcount, attrition, productivity metrics',
    roles: ['CFO']
  },
];

interface RoleStore {
  getAccessibleModules: () => DashboardModule[];
  hasModuleAccess: (moduleId: string) => boolean;
  getUserRole: () => string;
}

export const useRoleStore = create<RoleStore>(() => ({
  getAccessibleModules: () => {
    const { session } = useAuthStore.getState();
    const userRole = session?.user?.role_name || '';
    
    return dashboardModules.filter(module => 
      module.roles.includes(userRole)
    );
  },

  hasModuleAccess: (moduleId: string) => {
    const { session } = useAuthStore.getState();
    const userRole = session?.user?.role_name || '';
    
    const module = dashboardModules.find(m => m.id === moduleId);
    return module ? module.roles.includes(userRole) : false;
  },

  getUserRole: () => {
    const { session } = useAuthStore.getState();
    return session?.user?.role_name || '';
  }
}));