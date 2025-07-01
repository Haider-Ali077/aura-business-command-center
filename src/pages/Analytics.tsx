
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddWidgetDialog } from "@/components/AddWidgetDialog";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { Settings } from "lucide-react";
import { useWidgetStore } from "@/store/widgetStore";

const analyticsData = [
  { name: 'Jan', revenue: 4000, customers: 240, orders: 120, visits: 1200 },
  { name: 'Feb', revenue: 3000, customers: 198, orders: 98, visits: 1900 },
  { name: 'Mar', revenue: 2000, customers: 180, orders: 85, visits: 1600 },
  { name: 'Apr', revenue: 2780, customers: 208, orders: 110, visits: 2100 },
  { name: 'May', revenue: 1890, customers: 181, orders: 95, visits: 2400 },
  { name: 'Jun', revenue: 2390, customers: 250, orders: 125, visits: 1800 },
];

const Analytics = () => {
  const { widgets, addWidget, removeWidget, updateWidget } = useWidgetStore();

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
            <p className="text-gray-600 mt-2">Customize your analytics view with interactive widgets</p>
          </div>
          <div className="flex gap-2">
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
              <div className="text-2xl font-bold text-blue-600">$24,500</div>
              <p className="text-sm text-gray-600 mt-1">Average Revenue</p>
              <div className="text-xs text-green-600 mt-2">↗ +15.3%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">1,847</div>
              <p className="text-sm text-gray-600 mt-1">Total Customers</p>
              <div className="text-xs text-green-600 mt-2">↗ +8.2%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">633</div>
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
