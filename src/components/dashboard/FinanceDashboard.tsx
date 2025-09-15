import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { API_BASE_URL } from "@/config/api";
import { getIconByName } from '@/lib/iconUtils';

interface FinanceMetric {
  title: string;
  value: string;
  change: number | null;
  icon: any;
  color: string;
}

interface ChartData {
  name?: string;
  [key: string]: any;
}

export function FinanceDashboard() {
  const [metrics, setMetrics] = useState<FinanceMetric[]>([]);
  
  const { widgets, fetchWidgets, loading, refreshData } = useWidgetStore();
  const { session } = useAuthStore();

  const fetchKPIData = async () => {
    if (!session?.user.tenant_id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/kpis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.user_id,
          tenant_id: session.user.tenant_id,
          dashboard: 'finance'
        })
      });
      if (response.ok) {
        const kpiData = await response.json();
        
        if (kpiData.length > 0) {
          const mappedKpis = kpiData.map((kpi: any) => ({
            title: kpi.title,
            value: kpi.value,
            change: kpi.change,
            icon: getIconByName(kpi.icon),
            color: kpi.color
          }));
          setMetrics(mappedKpis);
        }
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };


  useEffect(() => {
    if (session?.user.tenant_id) {
      fetchWidgets(session.user.tenant_id, 'finance');
      fetchKPIData();
    }
  }, [session, fetchWidgets]);

  // Listen for changes in widgets array to trigger re-renders when new widgets are added
  useEffect(() => {
    console.log('Widgets updated in FinanceDashboard:', widgets.length);
  }, [widgets]);


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Finance Analytics</h1>
            <p className="text-muted-foreground mt-2">Financial performance and cash flow analysis</p>
          </div>
          <Button 
            variant="gradient"
            onClick={() => {
              refreshData();
              fetchKPIData();
            }} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

      {/* Finance Metrics */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
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
              onRemove={() => {}}
              onUpdate={() => {}}
              onMove={() => {}}
              onResize={() => {}}
            />
          ))}
        </div>
      ) : !loading && metrics.length === 0 && (
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
}