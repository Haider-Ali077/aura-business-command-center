
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export interface Widget {
//   id: string;
//   title: string;
//   type: string;
//   span: number;
//   position: { x: number; y: number };
//   size: { width: number; height: number };
//   sqlQuery?: string;
//   config?: {
//     timePeriod?: string;
//     dataSource?: string;
//     chartData?: any;
//   };
// }

// interface WidgetStore {
//   widgets: Widget[];
//   addWidget: (widget: Widget) => void;
//   removeWidget: (id: string) => void;
//   updateWidget: (id: string, updates: Partial<Widget>) => void;
//   moveWidget: (id: string, position: { x: number; y: number }) => void;
//   resizeWidget: (id: string, size: { width: number; height: number }) => void;
// }

// export const useWidgetStore = create<WidgetStore>()(
//   persist(
//     (set) => ({
//       widgets: [
//         { 
//           id: '1', 
//           title: 'Revenue Trends', 
//           type: 'line', 
//           span: 2, 
//           position: { x: 0, y: 0 },
//           size: { width: 600, height: 350 },
//           sqlQuery: 'SELECT DATE_FORMAT(created_at, "%Y-%m") as name, SUM(amount) as revenue FROM orders GROUP BY DATE_FORMAT(created_at, "%Y-%m") ORDER BY name'
//         },
//         { 
//           id: '2', 
//           title: 'Customer Growth', 
//           type: 'bar', 
//           span: 1, 
//           position: { x: 2, y: 0 },
//           size: { width: 300, height: 350 },
//           sqlQuery: 'SELECT DATE_FORMAT(created_at, "%Y-%m") as name, COUNT(*) as customers FROM customers GROUP BY DATE_FORMAT(created_at, "%Y-%m") ORDER BY name'
//         },
//         { 
//           id: '3', 
//           title: 'Website Traffic', 
//           type: 'area', 
//           span: 1, 
//           position: { x: 0, y: 1 },
//           size: { width: 300, height: 350 },
//           sqlQuery: 'SELECT DATE_FORMAT(visit_date, "%Y-%m") as name, COUNT(*) as visits FROM website_visits GROUP BY DATE_FORMAT(visit_date, "%Y-%m") ORDER BY name'
//         },
//         { 
//           id: '4', 
//           title: 'Sales Distribution', 
//           type: 'pie', 
//           span: 1, 
//           position: { x: 1, y: 1 },
//           size: { width: 300, height: 350 },
//           sqlQuery: 'SELECT category as name, SUM(amount) as revenue FROM orders o JOIN products p ON o.product_id = p.id GROUP BY category'
//         },
//       ],
//       addWidget: (widget) =>
//         set((state) => ({
//           widgets: [...state.widgets, widget],
//         })),
//       removeWidget: (id) =>
//         set((state) => ({
//           widgets: state.widgets.filter((w) => w.id !== id),
//         })),
//       updateWidget: (id, updates) =>
//         set((state) => ({
//           widgets: state.widgets.map((w) =>
//             w.id === id ? { ...w, ...updates } : w
//           ),
//         })),
//       moveWidget: (id, position) =>
//         set((state) => ({
//           widgets: state.widgets.map((w) =>
//             w.id === id ? { ...w, position } : w
//           ),
//         })),
//       resizeWidget: (id, size) =>
//         set((state) => ({
//           widgets: state.widgets.map((w) =>
//             w.id === id ? { ...w, size } : w
//           ),
//         })),
//     }),
//     {
//       name: 'widget-storage',
//     }
//   )
// );


import { create } from 'zustand';
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
  fetchWidgets: (tenantId: number, dashboard: string) => Promise<void>;
  addWidget: (widget: Widget, tenantId: number, dashboard: string) => Promise<void>;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: { width: number; height: number }) => void;
  refreshData: () => Promise<void>;
}

export const useWidgetStore = create<WidgetStore>()((set, get) => ({
  widgets: [],
  loading: false,

  fetchWidgets: async (tenantId, dashboard) => {
    set({ loading: true });
    try {
      console.log('Fetching widgets with tenantId:', tenantId, 'type:', typeof tenantId);
      
      const res = await fetch(`${API_BASE_URL}/widgetfetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: tenantId,
        dashboard: dashboard,
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
            // Get tenant name from auth store for database name
            const authStore = await import('@/store/authStore');
            const session = authStore.useAuthStore.getState().session;
            const databaseName = session?.user.tenant_name || `Company_${String.fromCharCode(65 + tenantId - 1)}`;
            
            console.log(`Making execute-sql request for widget ${widget.id} with database:`, databaseName);
            
            const chartRes = await fetch(`${API_BASE_URL}/execute-sql`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                query: sqlQuery,
                database_name: databaseName
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
      set({ widgets: transformed, loading: false });
    } catch (err) {
      console.error("Failed to fetch widgets", err);
      set({ loading: false });
    }
  },

  addWidget: async (widget, tenantId, dashboard) => {
  try {
    const payload = {
      tenant_id: tenantId,
      dashboard,
      title: widget.title,
      type: widget.type,
      span: widget.span,
      position_x: widget.position?.x ?? 0,
      position_y: widget.position?.y ?? 0,
      size_width: widget.size?.width ?? 1,
      size_height: widget.size?.height ?? 1,
      sql_query: widget.sqlQuery || '',
    };

    console.log("Final payload for backend:", payload); // Debug

    const res = await fetch(`${API_BASE_URL}/widgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Widget added successfully, refreshing dashboard...");
      
      // Refresh the entire widget list to get the new widget with proper data
      await get().fetchWidgets(tenantId, dashboard);
    } else {
      const errorText = await res.text();
      console.error("Failed response:", errorText);
      throw new Error(`Failed to add widget: ${errorText}`);
    }
  } catch (err) {
    console.error("Failed to add widget", err);
    throw err;
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
    
    console.log('Refreshing data for dashboard:', dashboardType, 'tenant:', session.user.tenant_id);
    
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
}));
