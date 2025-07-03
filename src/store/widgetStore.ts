
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Widget {
  id: string;
  title: string;
  type: string;
  span: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config?: {
    timePeriod?: string;
    dataSource?: string;
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
          size: { width: 600, height: 350 }
        },
        { 
          id: '2', 
          title: 'Customer Growth', 
          type: 'bar', 
          span: 1, 
          position: { x: 0, y: 1 },
          size: { width: 300, height: 350 }
        },
        { 
          id: '3', 
          title: 'Website Traffic', 
          type: 'area', 
          span: 1, 
          position: { x: 1, y: 0 },
          size: { width: 300, height: 350 }
        },
        { 
          id: '4', 
          title: 'Sales Distribution', 
          type: 'pie', 
          span: 1, 
          position: { x: 1, y: 1 },
          size: { width: 300, height: 350 }
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
