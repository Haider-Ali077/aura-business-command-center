import { useState, useEffect } from 'react';
import { useWidgetStore } from '@/store/widgetStore';

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

    // Search dashboard names
    const dashboardResults: SearchResult[] = [
      { id: 'executive', title: 'Executive Dashboard', type: 'dashboard' as const, url: '/dashboard/executive' },
      { id: 'finance', title: 'Finance Dashboard', type: 'dashboard' as const, url: '/dashboard/finance' },
      { id: 'sales', title: 'Sales Dashboard', type: 'dashboard' as const, url: '/dashboard/sales' },
      { id: 'inventory', title: 'Inventory Dashboard', type: 'dashboard' as const, url: '/dashboard/inventory' },
      { id: 'hr', title: 'HR Dashboard', type: 'dashboard' as const, url: '/dashboard/hr' },
    ].filter(dashboard => 
      dashboard.title.toLowerCase().includes(query.toLowerCase())
    );

    // Simulate search delay
    setTimeout(() => {
      setResults([...dashboardResults, ...widgetResults]);
      setIsLoading(false);
    }, 200);

  }, [query, widgets]);

  return { results, isLoading };
}