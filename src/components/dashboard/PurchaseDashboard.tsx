import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/api';
import { getIconByName } from '@/lib/iconUtils';
import { cache } from '@/lib/cache';
import { ConfigurableWidget } from '@/components/ConfigurableWidget';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { dataService } from '@/services/dataService';
import { sqlService } from '@/services/sqlService';

interface PurchaseMetric {
  title: string;
  value: string;
  change: number | null;
  icon: any;
  color: string;
}

const PurchaseDashboard = () => {
  const [metrics, setMetrics] = useState<PurchaseMetric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  const { session } = useAuthStore();

  const fetchWidgets = async () => {
    if (!session?.user.tenant_id) return;
    
    setIsLoadingWidgets(true);
    const startTime = Date.now();
    const widgetsCacheKey = `widgets:${session.user.tenant_id}:purchase`;
    const cachedWidgets = cache.get<any[]>(widgetsCacheKey);
    if (cachedWidgets) {
      setWidgets(cachedWidgets);
      setIsLoadingWidgets(false);
      console.log('[PurchaseDashboard] Widgets loaded from cache');
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
          dashboard: 'purchase'
        })
      });
      
      if (response.ok) {
        const widgetData = await response.json();
        
        if (widgetData.length > 0) {
          // Process widgets and fetch chart data
          const processedWidgets = await Promise.all(widgetData.map(async (w: any) => {
            const widget = {
              ...w,
              position: { x: w.position_x, y: w.position_y },
              size: { width: w.size_width, height: w.size_height },
            };
            
            // Fetch chart data for widgets with SQL queries
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
          console.log(`[PurchaseDashboard] Widgets loaded in ${Date.now() - startTime}ms`);
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
      const kpiData = await dataService.fetchKpis('purchase', session.user.tenant_id);
      
      if (kpiData.length > 0) {
        const mappedKpis = kpiData.map((kpi: any) => ({
          title: kpi.title,
          value: kpi.value,
          change: kpi.change,
          icon: getIconByName(kpi.icon),
          color: kpi.color
        }));
        setMetrics(mappedKpis);
        console.log(`[PurchaseDashboard] KPIs loaded in ${Date.now() - startTime}ms`);
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
    
    console.log('[PurchaseDashboard] Force refresh triggered');
    
    // Invalidate cache before refetch
    dataService.invalidateKpis(session.user.tenant_id, 'purchase');
    sqlService.invalidateCache(session.user.tenant_id);
    cache.invalidate(`widgets:${session.user.tenant_id}:purchase`);
    
    await Promise.all([fetchWidgets(), fetchKPIData()]);
  };

  useEffect(() => {
    if (session) {
      fetchWidgets();
      fetchKPIData();
    }
  }, [session]);

  // Listen for widget added events from chatbot
  useEffect(() => {
    const handleWidgetAdded = (event: CustomEvent) => {
      const { dashboardId } = event.detail;
      // Only refresh if the widget was added to this dashboard
      if (dashboardId === 'purchase' && session?.user.tenant_id) {
        console.log('Widget added to purchase dashboard, refreshing...');
        // Invalidate cache since new widget was added
        dataService.invalidateKpis(session.user.tenant_id, 'purchase');
        try { cache.invalidate(`widgets:${session.user.tenant_id}:purchase`); } catch (e) { /* ignore */ }
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
            <h1 className="text-3xl font-bold text-foreground">Purchase Dashboard</h1>
            <p className="text-muted-foreground mt-2">Purchase orders, supplier management, and procurement analytics</p>
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

        {/* Purchase Metrics */}
        {isLoadingMetrics ? (
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-32" />
            ))}
          </div>
        ) : metrics.length > 0 ? (
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {metrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
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
                      const Icon = IconComponent as any;
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
              );
            })}
          </div>
        ) : null}

        {/* Dynamic Widgets */}
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
                  // Remove widget from local state
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
      </div>
    </Layout>
  );
};

export default PurchaseDashboard;