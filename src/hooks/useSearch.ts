import { useState, useEffect } from 'react';
import { useWidgetStore } from '@/store/widgetStore';
import { useRoleStore } from '@/store/roleStore';

export interface SearchResult {
  id: string;
  title: string;
  type: 'widget' | 'dashboard' | 'data';
  description?: string;
  url?: string;
  data?: any;
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { widgets } = useWidgetStore();
  const { getAccessibleModules } = useRoleStore();
  const accessibleModules = getAccessibleModules();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Search widgets
    const widgetResults: SearchResult[] = widgets
      .filter(widget => 
        widget.title.toLowerCase().includes(query.toLowerCase()) ||
        widget.type.toLowerCase().includes(query.toLowerCase())
      )
      .map(widget => ({
        id: widget.id,
        title: widget.title,
        type: 'widget' as const,
        description: `${widget.type} chart`,
        data: widget
      }));

    // Search dashboard names (only accessible ones)
    const allDashboards = [
      { id: 'executive', title: 'Executive Dashboard', type: 'dashboard' as const, url: '/dashboard/executive' },
      { id: 'finance', title: 'Finance Dashboard', type: 'dashboard' as const, url: '/dashboard/finance' },
      { id: 'sales', title: 'Sales Dashboard', type: 'dashboard' as const, url: '/dashboard/sales' },
      { id: 'inventory', title: 'Inventory Dashboard', type: 'dashboard' as const, url: '/dashboard/inventory' },
      { id: 'hr', title: 'HR Dashboard', type: 'dashboard' as const, url: '/dashboard/hr' },
    ];

    const dashboardResults = allDashboards
      .filter(dashboard => {
        // Always include executive dashboard
        if (dashboard.id === 'executive') return true;
        // Check if user has access to this dashboard
        return accessibleModules.some(module => module.id === dashboard.id);
      })
      .filter(dashboard => 
        dashboard.title.toLowerCase().includes(query.toLowerCase())
      );

    // Search charts/cards (only from accessible dashboards)
    const chartResults: SearchResult[] = [];
    const accessibleDashboardIds = accessibleModules.map(m => m.id);
    accessibleDashboardIds.push('executive'); // Always include executive

    // Add default charts/cards for accessible dashboards
    const defaultCharts = {
      finance: ['Cash Flow Analysis', 'Budget vs Actual', 'Revenue Trends', 'AR Aging'],
      inventory: ['Stock Levels', 'Turnover Rate', 'Category Distribution', 'Reorder Status'],
      sales: ['Sales Performance', 'Monthly Trends', 'Regional Sales', 'Top Products'],
      hr: ['Employee Count', 'Attendance Rate', 'Department Distribution', 'Performance Metrics'],
      executive: ['Key Metrics', 'Revenue Overview', 'Department Performance', 'Growth Trends']
    };

    accessibleDashboardIds.forEach(dashboardId => {
      const charts = defaultCharts[dashboardId as keyof typeof defaultCharts] || [];
      charts
        .filter(chart => chart.toLowerCase().includes(query.toLowerCase()))
        .forEach(chart => {
          chartResults.push({
            id: `${dashboardId}-${chart}`,
            title: chart,
            type: 'data' as const,
            description: `Chart from ${dashboardId} dashboard`,
            url: `/dashboard/${dashboardId}`
          });
        });
    });

    // Simulate search delay
    setTimeout(() => {
      setResults([...dashboardResults, ...widgetResults, ...chartResults]);
      setIsLoading(false);
    }, 200);

  }, [query, widgets, accessibleModules]);

  return { results, isLoading };
}