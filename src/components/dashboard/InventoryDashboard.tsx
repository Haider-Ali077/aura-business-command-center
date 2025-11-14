import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuthStore } from "@/store/authStore";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { LoadingSkeleton, LoadingOverlay } from "@/components/ui/loading-skeleton";
import { API_BASE_URL } from "@/config/api";
import { getIconByName } from '@/lib/iconUtils';
import { cache } from '@/lib/cache';
import { dataService } from '@/services/dataService';
import { sqlService } from '@/services/sqlService';

interface InventoryMetric {
  title: string;
  value: string;
  change: number | null;
  icon: any;
  color: string;
}

export function InventoryDashboard() {
  const [metrics, setMetrics] = useState<InventoryMetric[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  
  const { session } = useAuthStore();

  const fetchWidgets = async () => {
    if (!session?.user.tenant_id) return;
    
    setIsLoadingWidgets(true);
    const startTime = Date.now();
    const widgetsCacheKey = `widgets:${session.user.tenant_id}:inventory`;
    const cachedWidgets = cache.get<any[]>(widgetsCacheKey);
    if (cachedWidgets) {
      setWidgets(cachedWidgets);
      setIsLoadingWidgets(false);
      console.log('[InventoryDashboard] Widgets loaded from cache');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/widgetfetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.user_id,
          tenant_id: session.user.tenant_id,
          dashboard: 'inventory'
        })
      });
      
      if (response.ok) {
        const widgetData = await response.json();
        
        if (widgetData.length > 0) {
          const processedWidgets = await Promise.all(widgetData.map(async (w: any) => {
            const widget = {
              ...w,
              position: { x: w.position_x, y: w.position_y },
              size: { width: w.size_width, height: w.size_height },
            };
            
            const sqlQuery = widget.sqlQuery || widget.sql_query;
            if (sqlQuery) {
              try {
                // Use cached sqlService instead of direct fetch
                const chartData = await sqlService.runSqlWithWidgetCache(
                  sqlQuery,
                  session.user.tenant_id,
                  widget.id
                );
                
                widget.config = { ...widget.config, chartData };
                widget.sqlQuery = sqlQuery;
              } catch (err) {
                console.error(`Failed to fetch chart data for widget ${widget.id}`, err);
              }
            }
            
            return widget;
          }));
          
          setWidgets(processedWidgets);
          try { cache.set(widgetsCacheKey, processedWidgets); } catch (e) { /* ignore */ }
          console.log(`[InventoryDashboard] Widgets loaded in ${Date.now() - startTime}ms`);
        } else {
          setWidgets([]);
        }
      }
    } catch (error) {
      console.error('Error fetching widget data:', error);
    } finally {
      setIsLoadingWidgets(false);
    }
  };

  const fetchKPIData = async () => {
    if (!session?.user.tenant_id) return;
    
    setIsLoadingMetrics(true);
    const startTime = Date.now();
    
    try {
      // Use cached dataService.fetchKpis instead of direct fetch
      const kpiData = await dataService.fetchKpis('inventory', session.user.tenant_id);
      
      if (kpiData.length > 0) {
        const mappedKpis = kpiData.map((kpi: any) => ({
          title: kpi.title,
          value: kpi.value,
          change: kpi.change,
          icon: getIconByName(kpi.icon), 
          color: kpi.color
        }));
        setMetrics(mappedKpis);
        console.log(`[InventoryDashboard] KPIs loaded in ${Date.now() - startTime}ms`);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Force refresh with cache invalidation
  const handleRefresh = async () => {
    if (!session?.user.tenant_id) return;
    
    console.log('[InventoryDashboard] Force refresh triggered');
    
    // Invalidate cache before refetch
    dataService.invalidateKpis(session.user.tenant_id, 'inventory');
    sqlService.invalidateCache(session.user.tenant_id);
    cache.invalidate(`widgets:${session.user.tenant_id}:inventory`);
    
    await Promise.all([fetchWidgets(), fetchKPIData()]);
  };

  useEffect(() => {
    if (session?.user.tenant_id) {
      fetchWidgets();
      fetchKPIData();
    }
  }, [session]);

  // Listen for changes in widgets array to trigger re-renders when new widgets are added
  useEffect(() => {
    console.log('Widgets updated in InventoryDashboard:', widgets.length);
  }, [widgets]);

  // Listen for widget added events from chatbot
  useEffect(() => {
    const handleWidgetAdded = (event: CustomEvent) => {
      const { dashboardId } = event.detail;
      if (dashboardId === 'inventory' && session?.user.tenant_id) {
        console.log('Widget added to inventory dashboard, refreshing...');
        // Invalidate cache since new widget was added
        dataService.invalidateKpis(session.user.tenant_id, 'inventory');
        try { cache.invalidate(`widgets:${session.user.tenant_id}:inventory`); } catch (e) { /* ignore */ }
        fetchWidgets();
      }
    };

    window.addEventListener('widgetAdded', handleWidgetAdded as EventListener);
    return () => {
      window.removeEventListener('widgetAdded', handleWidgetAdded as EventListener);
    };
  }, [session]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory & Supply Chain Analytics</h1>
            <p className="text-muted-foreground mt-2">Stock levels, turnover, and supply chain performance</p>
          </div>
          <Button 
            variant="gradient"
            onClick={handleRefresh}
            disabled={isLoadingWidgets || isLoadingMetrics}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(isLoadingWidgets || isLoadingMetrics) ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

      {/* Inventory Metrics */}
      {isLoadingMetrics ? (
        <LoadingSkeleton variant="kpi" count={4} />
      ) : metrics.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow">
            {/* decorative inner shadow using a soft purplish tint (inset) */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 10px 30px rgba(124,58,237,0.06), inset 0 -6px 20px rgba(99,102,241,0.04)'
              }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              {(() => {
                const Icon = metric.icon as any;
                const baseClass = 'h-5 w-5';
                const isTailwindClass = typeof metric.color === 'string' && metric.color.startsWith('text-');
                const isRawColor = typeof metric.color === 'string' && (metric.color.startsWith('#') || metric.color.startsWith('rgb'));
                const iconClass = isTailwindClass ? `${baseClass} ${metric.color}` : baseClass;
                const iconStyle = isRawColor ? { color: metric.color } : undefined;
                return <Icon className={iconClass} style={iconStyle} aria-hidden />;
              })()}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              {metric.change !== null && metric.change !== 0 && (
                <p className={`text-xs mt-1 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}% from last month
                </p>
              )}
            </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Dynamic Widgets */}
      <LoadingOverlay isLoading={isLoadingWidgets}>
        {widgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {widgets
            .sort((a, b) => {
              // Sort so tables come last
              if (a.type === 'table' && b.type !== 'table') return 1;
              if (a.type !== 'table' && b.type === 'table') return -1;
              return 0;
            })
            .map((widget) => (
            <ConfigurableWidget 
              key={widget.id} 
              widget={widget}
              data={widget.config?.chartData || []}
                onRemove={(id) => {
                  setWidgets(prev => prev.filter(w => w.id !== id));
                }}
              onUpdate={() => {}}
              onMove={() => {}}
              onResize={() => {}}
              />
            ))}
          </div>
        ) : !isLoadingWidgets && metrics.length === 0 && (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">No widgets or KPIs configured</h3>
                <p>Please contact your administrator to configure dashboard widgets and KPI metrics for this section.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </LoadingOverlay>
      </div>
    </Layout>
  );
}