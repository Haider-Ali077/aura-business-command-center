
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
      const res = await fetch('http://127.0.0.1:8000/widgetfetch', {
      // const res = await fetch('https://sql-database-agent.onrender.com/widgetfetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: tenantId,
        dashboard: dashboard,
      }),
    });
      const data = await res.json();
      const transformed = await Promise.all(data.map(async (w: any) => {
        const widget = {
          ...w,
          position: { x: w.position_x, y: w.position_y },
          size: { width: w.size_width, height: w.size_height },
        };
        
        // Fetch chart data for widgets with SQL queries
        if (widget.sqlQuery) {
          try {
            const chartRes = await fetch('http://127.0.0.1:8000/execute-sql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                query: widget.sqlQuery,
                database_name: `Company_${String.fromCharCode(65 + tenantId - 1)}` // Convert 1->Company_A, 2->Company_B, etc.
              }),
            });
            const chartData = await chartRes.json();
            widget.config = { ...widget.config, chartData };
          } catch (err) {
            console.error(`Failed to fetch chart data for widget ${widget.id}`, err);
          }
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

    const res = await fetch('http://127.0.0.1:8000/widgets', {
    // const res = await fetch('https://sql-database-agent.onrender.com/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      set((state) => ({
        widgets: [...state.widgets, widget],
      }));
    } else {
      const errorText = await res.text();
      console.error("Failed response:", errorText);
    }
  } catch (err) {
    console.error("Failed to add widget", err);
  }
},

  refreshData: async () => {
    const { widgets } = get();
    // Get current tenant info from auth store
    const authStore = await import('@/store/authStore');
    const session = authStore.useAuthStore.getState().session;
    
    if (!session) return;
    
    // Refresh data for all widgets with SQL queries
    const updatedWidgets = await Promise.all(
      widgets.map(async (widget) => {
        if (widget.sqlQuery) {
          try {
            const res = await fetch('http://127.0.0.1:8000/execute-sql', {
            // const res = await fetch('https://sql-database-agent.onrender.com/execute-sql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                query: widget.sqlQuery,
                database_name: session.user.database_name || `Company_${String.fromCharCode(65 + session.user.tenant_id - 1)}`
              }),
            });
            const data = await res.json();
            return { ...widget, config: { ...widget.config, chartData: data } };
          } catch (err) {
            console.error(`Failed to refresh data for widget ${widget.id}`, err);
            return widget;
          }
        }
        return widget;
      })
    );
    set({ widgets: updatedWidgets });
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
