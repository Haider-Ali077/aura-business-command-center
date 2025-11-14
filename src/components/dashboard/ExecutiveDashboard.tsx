import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { useAuthStore } from "@/store/authStore";
import { Layout } from "@/components/Layout";
import { LoadingSkeleton, LoadingOverlay } from "@/components/ui/loading-skeleton";
import { API_BASE_URL } from "@/config/api";
import { getIconByName } from '@/lib/iconUtils';
import { cache } from '@/lib/cache';
import { dataService } from '@/services/dataService';
import { sqlService } from '@/services/sqlService';

interface ExecutiveKPI {
  title: string;
  value: string;
  change: number | null;
  icon: any;
  color: string;
}

interface ChartData {
  name?: string;
  value?: number;
  [key: string]: any;
}

export function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  
  const { session } = useAuthStore();

  const fetchWidgets = async () => {
    if (!session?.user.tenant_id) return;
    
    setIsLoadingWidgets(true);
    const startTime = Date.now();
    const widgetsCacheKey = `widgets:${session.user.tenant_id}:executive`;
    const cachedWidgets = cache.get<any[]>(widgetsCacheKey);
    if (cachedWidgets) {
      setWidgets(cachedWidgets);
      setIsLoadingWidgets(false);
      console.log('[ExecutiveDashboard] Widgets loaded from cache');
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
          dashboard: 'executive'
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
          console.log(`[ExecutiveDashboard] Widgets loaded in ${Date.now() - startTime}ms`);
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
    
    setIsLoadingKpis(true);
    const startTime = Date.now();
    
    try {
      // Use cached dataService.fetchKpis (no artificial delay!)
      const kpiData = await dataService.fetchKpis(
        'executive',
        session.user.tenant_id
      );
      
      if (kpiData.length > 0) {
        const mappedKpis = kpiData.map((kpi: any) => ({
          title: kpi.title,
          value: kpi.value,
          change: kpi.change,
          icon: getIconByName(kpi.icon),
          color: kpi.color
        }));
        setKpis(mappedKpis);
        console.log(`[ExecutiveDashboard] KPIs loaded in ${Date.now() - startTime}ms`);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setIsLoadingKpis(false);
    }
  };

  // Force refresh (invalidates cache first)
  const handleRefresh = async () => {
    if (!session?.user.tenant_id) return;
    
    console.log('[ExecutiveDashboard] Force refresh triggered');
    
    // Invalidate cache before refetch
    dataService.invalidateKpis(session.user.tenant_id, 'executive');
    sqlService.invalidateCache(session.user.tenant_id);
    cache.invalidate(`widgets:${session.user.tenant_id}:executive`);
    
    // Fetch fresh data
    await Promise.all([fetchWidgets(), fetchKPIData()]);
  };

  useEffect(() => {
    if (session?.user.tenant_id) {
      console.log('Session user data:', session.user);
      console.log('Tenant ID:', session.user.tenant_id, 'User ID:', session.user.user_id);
      fetchWidgets();
      fetchKPIData();
    }
  }, [session]);

  // Listen for changes in widgets array to trigger re-renders when new widgets are added
  useEffect(() => {
    console.log('Widgets updated in ExecutiveDashboard:', widgets.length);
  }, [widgets]);

  // Listen for widget added events from chatbot
  useEffect(() => {
    const handleWidgetAdded = (event: CustomEvent) => {
      const { dashboardId } = event.detail;
      if (dashboardId === 'executive' && session?.user.tenant_id) {
        console.log('Widget added to executive dashboard, refreshing...');
        // Invalidate cache since new widget was added
        dataService.invalidateKpis(session.user.tenant_id, 'executive');
        // Invalidate widgets cache so fetchWidgets will refetch from server
        try { cache.invalidate(`widgets:${session.user.tenant_id}:executive`); } catch (e) { /* ignore */ }
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
          <h1 className="text-3xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-2">High-level overview of company performance</p>
        </div>
        <Button 
          variant="gradient"
          onClick={handleRefresh} 
          disabled={isLoadingWidgets || isLoadingKpis}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(isLoadingWidgets || isLoadingKpis) ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards Grid */}
      {isLoadingKpis ? (
        <LoadingSkeleton variant="kpi" count={4} />
      ) : kpis.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {kpis.map((kpi, index) => (
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
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                {
                  // Render icon with color from DB. Support both Tailwind text- classes and raw color values like '#7c3aed' or 'rgb(124,58,237)'.
                }
                {(() => {
                  const Icon = kpi.icon as any;
                  const baseClass = 'h-5 w-5';
                  const isTailwindClass = typeof kpi.color === 'string' && kpi.color.startsWith('text-');
                  const isRawColor = typeof kpi.color === 'string' && (kpi.color.startsWith('#') || kpi.color.startsWith('rgb'));
                  const iconClass = isTailwindClass ? `${baseClass} ${kpi.color}` : baseClass;
                  const iconStyle = isRawColor ? { color: kpi.color } : undefined;
                  return <Icon className={iconClass} style={iconStyle} aria-hidden />;
                })()}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                {kpi.change !== null && kpi.change !== 0 && (
                  <div className="flex items-center mt-1">
                    {kpi.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={`text-xs ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(kpi.change)}% from last month
                    </span>
                  </div>
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
                onRemove={() => {}}
                onUpdate={() => {}}
                onMove={() => {}}
                onResize={() => {}}
              />
            ))}
          </div>
        ) : !isLoadingWidgets && !isLoadingKpis && kpis.length === 0 && widgets.length === 0 && (
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