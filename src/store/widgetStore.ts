import { create } from 'zustand';
import { useEffect } from 'react';
import { sqlService } from '@/services/sqlService';
import { API_BASE_URL } from '@/config/api';

export interface Widget {
  id: string;
  title: string;
  type: string;
  span: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  sqlQuery?: string;
  tableName?: string; // Table name for table widgets
  config?: {
    timePeriod?: string;
    dataSource?: string;
    chartData?: any;
    // Enhanced chart configuration
    chartConfig?: {
      xLabel?: string;
      yLabel?: string;
      dataKeys?: string[];
      colors?: string[];
      showGrid?: boolean;
      showLegend?: boolean;
    };
  };
}

interface WidgetStore {
  widgets: Widget[];
  loading: boolean;
  userId: string | null;
  fetchWidgets: (tenantId: number, dashboard: string) => Promise<void>;
  addWidget: (widget: Widget, tenantId: number, dashboard: string) => Promise<void>;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: { width: number; height: number }) => void;
  refreshData: () => Promise<void>;
  clearWidgets: () => void;
}

// User-scoped widget store factory
export const useUserScopedWidgetStore = (userId: string | null) => {
  const store = create<WidgetStore>()((set, get) => ({
    widgets: [],
    loading: false,
    userId: userId,

    fetchWidgets: async (tenantId, dashboard) => {
      // Clear widgets first to prevent state pollution
      set({ loading: true, widgets: [] });
      
      try {
        console.log('Fetching widgets with tenantId:', tenantId, 'dashboard:', dashboard, 'userId:', userId);
        
        const res = await fetch(`${API_BASE_URL}/widgetfetch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            dashboard: dashboard,
            user_id: parseInt(userId || '0'),
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('API Error:', errorData);
          throw new Error(`API Error: ${JSON.stringify(errorData)}`);
        }
        
        const data = await res.json();
        console.log('Received widget data:', data);
        
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data, data);
          set({ widgets: [], loading: false });
          return;
        }
        
        const transformed = await Promise.all(data.map(async (w: any) => {
          const widget = {
            ...w,
            position: { x: w.position_x, y: w.position_y },
            size: { width: w.size_width, height: w.size_height },
          };
          
          console.log(`Processing widget ${widget.id}:`, widget.title, 'SQL Query:', widget.sqlQuery || widget.sql_query);
          
          // Fetch chart data for widgets with SQL queries
          const sqlQuery = widget.sqlQuery || widget.sql_query;
          if (sqlQuery) {
            console.log(`Fetching chart data for widget ${widget.id} with query:`, sqlQuery);
            try {
              // Get session for user_id
              const authStore = await import('@/store/authStore');
              const session = authStore.useAuthStore.getState().session;
              
              console.log(`Making execute-sql request for widget ${widget.id} with tenant_id:`, tenantId);
              
              const chartRes = await fetch(`${API_BASE_URL}/execute-sql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  query: sqlQuery,
                  tenant_id: tenantId,
                  user_id: parseInt(userId || '0'),
                }),
              });
              
              if (!chartRes.ok) {
                const errorData = await chartRes.json();
                console.error(`Chart data API error for widget ${widget.id}:`, errorData);
                throw new Error(`Chart API Error: ${JSON.stringify(errorData)}`);
              }
              
              const chartData = await chartRes.json();
              console.log(`Received chart data for widget ${widget.id}:`, chartData);
              widget.config = { ...widget.config, chartData };
              widget.sqlQuery = sqlQuery; // Ensure sqlQuery is set correctly
            } catch (err) {
              console.error(`Failed to fetch chart data for widget ${widget.id}`, err);
            }
          } else {
            console.log(`Widget ${widget.id} has no SQL query`);
          }
          
          return widget;
        }));
        
        console.log('Transformed widgets:', transformed);
        set({ widgets: transformed, loading: false });
        
      } catch (error) {
        console.error('Error fetching widgets:', error);
        set({ widgets: [], loading: false });
      }
    },

    addWidget: async (widget, tenantId, dashboard) => {
      try {
        const authStore = await import('@/store/authStore');
        const session = authStore.useAuthStore.getState().session;
        
        if (!session) {
          throw new Error('No active session');
        }

        const response = await fetch(`${API_BASE_URL}/widgets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            dashboard: dashboard,
            title: widget.title,
            type: widget.type,
            span: widget.span,
            position_x: widget.position.x,
            position_y: widget.position.y,
            size_width: widget.size.width,
            size_height: widget.size.height,
            sql_query: widget.sqlQuery || '',
            user_id: parseInt(userId || '0'),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create widget');
        }

        const result = await response.json();
        const newWidget = { ...widget, id: result.id };
        
        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }));
      } catch (error) {
        console.error('Error adding widget:', error);
        throw error;
      }
    },

    refreshData: async () => {
      // Get current tenant info from auth store
      const authStore = await import('@/store/authStore');
      const session = authStore.useAuthStore.getState().session;
      
      if (!session) return;
      
      // Get current dashboard from the route or store the current dashboard
      const currentPath = window.location.pathname;
      const dashboardType = currentPath.split('/').pop() || 'executive';
      
      console.log('Refreshing data for dashboard:', dashboardType, 'tenant:', session.user.tenant_id, 'user:', session.user.user_id);
      
      // Re-fetch widgets from backend to get latest configuration and data
      await get().fetchWidgets(session.user.tenant_id, dashboardType);
    },

    removeWidget: (id) =>
      set((state) => ({
        widgets: state.widgets.filter((w) => w.id !== id),
      })),

    updateWidget: (id, updates) =>
      set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === id ? { ...w, ...updates } : w
        ),
      })),

    moveWidget: (id, position) =>
      set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === id ? { ...w, position } : w
        ),
      })),

    resizeWidget: (id, size) =>
      set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === id ? { ...w, size } : w
        ),
      })),

    clearWidgets: () => set({ widgets: [], loading: false }),
  }));

  // Auto-cleanup when user changes
  useEffect(() => {
    if (userId) {
      console.log(`🔄 Initializing widget store for user: ${userId}`);
      
      // Cleanup function when component unmounts or user changes
      return () => {
        console.log(`🧹 Cleaning up widget store for user: ${userId}`);
        store.getState().clearWidgets();
      };
    }
  }, [userId]);

  return store;
};

// Legacy global store for backward compatibility (deprecated)
export const useWidgetStore = create<WidgetStore>()((set, get) => ({
  widgets: [],
  loading: false,
  userId: null,

  fetchWidgets: async (tenantId, dashboard) => {
    console.warn('⚠️ Using deprecated global widget store. Please use useUserScopedWidgetStore instead.');
    set({ loading: true, widgets: [] });
    // Implementation similar to user-scoped store but with warnings
  },

  addWidget: async (widget, tenantId, dashboard) => {
    console.warn('⚠️ Using deprecated global widget store. Please use useUserScopedWidgetStore instead.');
  },

  refreshData: async () => {
    console.warn('⚠️ Using deprecated global widget store. Please use useUserScopedWidgetStore instead.');
  },

  removeWidget: (id) => set((state) => ({ widgets: state.widgets.filter((w) => w.id !== id) })),
  updateWidget: (id, updates) => set((state) => ({ widgets: state.widgets.map((w) => w.id === id ? { ...w, ...updates } : w) })),
  moveWidget: (id, position) => set((state) => ({ widgets: state.widgets.map((w) => w.id === id ? { ...w, position } : w) })),
  resizeWidget: (id, size) => set((state) => ({ widgets: state.widgets.map((w) => w.id === id ? { ...w, size } : w) })),
  clearWidgets: () => set({ widgets: [], loading: false }),
}));