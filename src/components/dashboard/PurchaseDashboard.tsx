import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWidgetStore } from '@/store/widgetStore';
import { API_BASE_URL } from '@/config/api';
import { getIconByName } from '@/lib/iconUtils';
import { ConfigurableWidget } from '@/components/ConfigurableWidget';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface PurchaseMetric {
  title: string;
  value: string;
  change?: string;
  icon: any;
  color: string;
}

const PurchaseDashboard = () => {
  const [metrics, setMetrics] = useState<PurchaseMetric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const { session } = useAuthStore();
  const { widgets, loading, fetchWidgets, refreshData, removeWidget } = useWidgetStore();

  const fetchKPIData = async () => {
    if (!session?.user.tenant_id) return;
    
    setIsLoadingMetrics(true);
    try {
      const response = await fetch(`${API_BASE_URL}/kpis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: session.user.tenant_id,
          dashboard: 'purchase'
        })
      });
      if (response.ok) {
        const kpiData = await response.json();
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
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
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchWidgets(session.user.tenant_id, 'purchase');
      fetchKPIData();
    }
  }, [session, fetchWidgets]);

  const handleRefresh = () => {
    refreshData();
    fetchKPIData();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Purchase Dashboard</h1>
            <p className="text-muted-foreground mt-2">Purchase orders, supplier management, and procurement analytics</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={loading || isLoadingMetrics}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(loading || isLoadingMetrics) ? 'animate-spin' : ''}`} />
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
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                    <IconComponent className={`h-4 w-4 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                    {metric.change && (
                      <p className={`text-xs mt-1 ${Number(metric.change) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(metric.change) > 0 ? '+' : ''}{metric.change} from last month
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
                  removeWidget(id);
                  refreshData();
                }}
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
};

export default PurchaseDashboard;