
import { useEffect, useState } from 'react';
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddWidgetDialog } from "@/components/AddWidgetDialog";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { Settings, RefreshCw } from "lucide-react";
import { useWidgetStore } from "@/store/widgetStore";
import { dataService, AnalyticsData } from '@/services/dataService';
import { useTenantStore } from '@/store/tenantStore';

const Analytics = () => {
  const { widgets, addWidget, removeWidget, updateWidget } = useWidgetStore();
  const { currentSession } = useTenantStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    if (!currentSession) return;
    
    setIsLoading(true);
    try {
      const data = await dataService.fetchAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [currentSession?.tenantId]);

  const handleAddWidget = (widget: { id: string; title: string; type: string; span: number }) => {
    const newWidget = {
      ...widget,
      position: { x: 0, y: 0 },
      size: { width: widget.span === 2 ? 600 : 300, height: 300 }
    };
    addWidget(newWidget);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Customize your analytics view for {currentSession?.tenantInfo.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={fetchAnalyticsData} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <AddWidgetDialog onAddWidget={handleAddWidget} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <ConfigurableWidget
              key={widget.id}
              widget={widget}
              data={analyticsData}
              onRemove={removeWidget}
              onUpdate={updateWidget}
            />
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                ${analyticsData.length > 0 ? 
                  Math.round(analyticsData.reduce((sum, item) => sum + item.revenue, 0) / analyticsData.length).toLocaleString() : 
                  '24,500'
                }
              </div>
              <p className="text-sm text-gray-600 mt-1">Average Revenue</p>
              <div className="text-xs text-green-600 mt-2">↗ +15.3%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.length > 0 ? 
                  analyticsData.reduce((sum, item) => sum + item.customers, 0).toLocaleString() : 
                  '1,847'
                }
              </div>
              <p className="text-sm text-gray-600 mt-1">Total Customers</p>
              <div className="text-xs text-green-600 mt-2">↗ +8.2%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.length > 0 ? 
                  analyticsData.reduce((sum, item) => sum + item.orders, 0).toLocaleString() : 
                  '633'
                }
              </div>
              <p className="text-sm text-gray-600 mt-1">Monthly Orders</p>
              <div className="text-xs text-red-600 mt-2">↘ -2.1%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">23.5%</div>
              <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
              <div className="text-xs text-green-600 mt-2">↗ +5.4%</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
