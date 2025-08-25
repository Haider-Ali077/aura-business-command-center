import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { Layout } from "@/components/Layout";
import { LoadingSkeleton, LoadingOverlay } from "@/components/ui/loading-skeleton";
import { API_BASE_URL } from "@/config/api";
import { getIconByName } from '@/lib/iconUtils';

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
  
  const { widgets, fetchWidgets, loading, refreshData } = useWidgetStore();
  const { session } = useAuthStore();

  const fetchKPIData = async () => {
    if (!session?.user.tenant_id) return;
    
    setIsLoadingKpis(true);
    try {
      const response = await fetch(`${API_BASE_URL}/kpis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: session.user.tenant_id,
          dashboard: 'executive'
        })
      });
      if (response.ok) {
        const kpiData = await response.json();
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (kpiData.length > 0) {
          // Map API data to component format
          const mappedKpis = kpiData.map((kpi: any) => ({
            title: kpi.title,
            value: kpi.value,
            change: kpi.change,
            icon: getIconByName(kpi.icon),
            color: kpi.color
          }));
          setKpis(mappedKpis);
        }
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setIsLoadingKpis(false);
    }
  };


  useEffect(() => {
    if (session?.user.tenant_id) {
      console.log('Session user data:', session.user);
      console.log('Tenant ID:', session.user.tenant_id, 'Type:', typeof session.user.tenant_id);
      fetchWidgets(session.user.tenant_id, 'executive');
      fetchKPIData();
    }
  }, [session, fetchWidgets]);

  // Listen for changes in widgets array to trigger re-renders when new widgets are added
  useEffect(() => {
    console.log('Widgets updated in ExecutiveDashboard:', widgets.length);
  }, [widgets]);


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
          onClick={() => {
            refreshData();
            fetchKPIData();
          }} 
          disabled={loading || isLoadingKpis}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(loading || isLoadingKpis) ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards Grid */}
      {isLoadingKpis ? (
        <LoadingSkeleton variant="kpi" count={4} />
      ) : kpis.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {kpis.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
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
      <LoadingOverlay isLoading={loading}>
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
        ) : !loading && kpis.length === 0 && (
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