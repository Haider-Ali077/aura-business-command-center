
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addWidget: (widget: Widget) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: { width: number; height: number }) => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      widgets: [
        { 
          id: '1', 
          title: 'Revenue Trends', 
          type: 'line', 
          span: 2, 
          position: { x: 0, y: 0 },
          size: { width: 600, height: 350 },
          sqlQuery: 'SELECT DATE_FORMAT(created_at, "%Y-%m") as name, SUM(amount) as revenue FROM orders GROUP BY DATE_FORMAT(created_at, "%Y-%m") ORDER BY name'
        },
        { 
          id: '2', 
          title: 'Customer Growth', 
          type: 'bar', 
          span: 1, 
          position: { x: 2, y: 0 },
          size: { width: 300, height: 350 },
          sqlQuery: 'SELECT DATE_FORMAT(created_at, "%Y-%m") as name, COUNT(*) as customers FROM customers GROUP BY DATE_FORMAT(created_at, "%Y-%m") ORDER BY name'
        },
        { 
          id: '3', 
          title: 'Website Traffic', 
          type: 'area', 
          span: 1, 
          position: { x: 0, y: 1 },
          size: { width: 300, height: 350 },
          sqlQuery: 'SELECT DATE_FORMAT(visit_date, "%Y-%m") as name, COUNT(*) as visits FROM website_visits GROUP BY DATE_FORMAT(visit_date, "%Y-%m") ORDER BY name'
        },
        { 
          id: '4', 
          title: 'Sales Distribution', 
          type: 'pie', 
          span: 1, 
          position: { x: 1, y: 1 },
          size: { width: 300, height: 350 },
          sqlQuery: 'SELECT category as name, SUM(amount) as revenue FROM orders o JOIN products p ON o.product_id = p.id GROUP BY category'
        },
      ],
      addWidget: (widget) =>
        set((state) => ({
          widgets: [...state.widgets, widget],
        })),
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
    }),
    {
      name: 'widget-storage',
    }
  )
);
