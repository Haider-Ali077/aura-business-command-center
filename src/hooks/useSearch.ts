
import { useState, useEffect, useMemo } from 'react';
import { useRoleStore } from '@/store/roleStore';
import { useAuthStore } from '@/store/authStore';

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
  const { session } = useAuthStore();
  const { getAccessibleModules } = useRoleStore();
  
  // Get widgets from session-based API call
  const [widgets, setWidgets] = useState<any[]>([]);
  
  // Fetch widgets when component mounts or session changes
  useEffect(() => {
    const fetchWidgets = async () => {
      if (!session?.user.tenant_id) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/widgetfetch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: session.user.user_id,
            tenant_id: session.user.tenant_id,
            dashboard: 'all' // Get widgets from all dashboards for search
          })
        });
        
        if (response.ok) {
          const widgetData = await response.json();
          setWidgets(widgetData);
        }
      } catch (error) {
        console.error('Error fetching widgets for search:', error);
      }
    };
    
    fetchWidgets();
  }, [session]);
  
  // Memoize the accessible modules to prevent infinite re-renders
  const accessibleModules = useMemo(() => getAccessibleModules(), [getAccessibleModules]);

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

    // Get accessible dashboard IDs
    const accessibleDashboardIds = accessibleModules.map(m => m.id);

    // Search dashboard names (only accessible ones)
    const allDashboards = [
      { id: 'executive', title: 'Executive Dashboard', type: 'dashboard' as const, url: '/dashboard/executive' },
      { id: 'finance', title: 'Finance Dashboard', type: 'dashboard' as const, url: '/dashboard/finance' },
      { id: 'sales', title: 'Sales Dashboard', type: 'dashboard' as const, url: '/dashboard/sales' },
      { id: 'inventory', title: 'Inventory Dashboard', type: 'dashboard' as const, url: '/dashboard/inventory' },
      { id: 'hr', title: 'HR Dashboard', type: 'dashboard' as const, url: '/dashboard/hr' },
    ];

    const dashboardResults = allDashboards
      .filter(dashboard => accessibleDashboardIds.includes(dashboard.id))
      .filter(dashboard => 
        dashboard.title.toLowerCase().includes(query.toLowerCase())
      );

    // Search charts/cards (only from accessible dashboards)
    const chartResults: SearchResult[] = [];

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
