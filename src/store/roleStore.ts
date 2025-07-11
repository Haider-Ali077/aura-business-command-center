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
    roles: ['CEO', 'CFO', 'COO', 'Executive', 'Manager']
  },
  {
    id: 'finance',
    name: 'Finance Analytics',
    icon: 'DollarSign',
    description: 'Revenue, expenses, profit margins, cash flow',
    roles: ['CFO', 'Finance Manager', 'Finance Analyst', 'Accountant']
  },
  {
    id: 'sales',
    name: 'Sales & CRM',
    icon: 'TrendingUp',
    description: 'Sales funnel, lead conversion, revenue tracking',
    roles: ['Sales Manager', 'Sales Rep', 'CRM Manager', 'VP Sales']
  },
  {
    id: 'inventory',
    name: 'Inventory & Supply Chain',
    icon: 'Package',
    description: 'Stock levels, turnover, supplier metrics',
    roles: ['Inventory Manager', 'Supply Chain Manager', 'Operations']
  },
  {
    id: 'hr',
    name: 'Human Resources',
    icon: 'Users',
    description: 'Headcount, attrition, productivity metrics',
    roles: ['HR Manager', 'HR Analyst', 'People Operations']
  }
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
      module.roles.includes(userRole) || userRole === 'Admin'
    );
  },

  hasModuleAccess: (moduleId: string) => {
    const { session } = useAuthStore.getState();
    const userRole = session?.user?.role_name || '';
    
    if (userRole === 'Admin') return true;
    
    const module = dashboardModules.find(m => m.id === moduleId);
    return module ? module.roles.includes(userRole) : false;
  },

  getUserRole: () => {
    const { session } = useAuthStore.getState();
    return session?.user?.role_name || '';
  }
}));