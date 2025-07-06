
import { useEffect, useState } from 'react';
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddWidgetDialog } from "@/components/AddWidgetDialog";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { Settings, RefreshCw } from "lucide-react";
import { useWidgetStore } from "@/store/widgetStore";
import { dataService, AnalyticsData } from '@/services/dataService';
import { useAuthStore } from '@/store/authStore';

const Analytics = () => {
  const { widgets, addWidget, removeWidget, updateWidget, moveWidget, resizeWidget } = useWidgetStore();
  const { session } = useAuthStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    if (!session) return;
    
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
  }, [session]);

  const handleAddWidget = (widget: { id: string; title: string; type: string; span: number }) => {
    const newWidget = {
      ...widget,
      position: { x: 0, y: 0 },
      size: { width: widget.span === 2 ? 600 : 400, height: 350 },
      sqlQuery: `SELECT 'Sample' as name, 100 as value`
    };
    addWidget(newWidget);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Drag and resize widgets to customize your view. Configure SQL queries for real-time data.
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

        {/* Widget Grid Container */}
        <div className="widget-grid-container">
          <div 
            className="grid gap-4 auto-rows-fr"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              minHeight: '600px'
            }}
          >
            {widgets.map((widget) => (
              <div 
                key={widget.id} 
                className="widget-item"
                style={{
                  gridColumn: widget.span === 2 ? 'span 2' : 'span 1',
                }}
              >
                <ConfigurableWidget
                  widget={widget}
                  data={analyticsData}
                  onRemove={removeWidget}
                  onUpdate={updateWidget}
                  onMove={moveWidget}
                  onResize={resizeWidget}
                />
              </div>
            ))}
          </div>
          {widgets.length === 0 && (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p className="text-lg">No widgets added yet</p>
                <p className="text-sm">Click "Add Widget" to get started</p>
              </div>
            </div>
          )}
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
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Average Revenue</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Customers</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Monthly Orders</p>
              <div className="text-xs text-red-600 mt-2">↘ -2.1%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">23.5%</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Conversion Rate</p>
              <div className="text-xs text-green-600 mt-2">↗ +5.4%</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
