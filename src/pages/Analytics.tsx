
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Plus, Settings, Maximize2 } from "lucide-react";

const analyticsData = [
  { name: 'Jan', revenue: 4000, customers: 240, orders: 120 },
  { name: 'Feb', revenue: 3000, customers: 198, orders: 98 },
  { name: 'Mar', revenue: 2000, customers: 180, orders: 85 },
  { name: 'Apr', revenue: 2780, customers: 208, orders: 110 },
  { name: 'May', revenue: 1890, customers: 181, orders: 95 },
  { name: 'Jun', revenue: 2390, customers: 250, orders: 125 },
];

const trafficData = [
  { name: 'Mon', visits: 1200, pageviews: 3400 },
  { name: 'Tue', visits: 1900, pageviews: 4200 },
  { name: 'Wed', visits: 1600, pageviews: 3800 },
  { name: 'Thu', visits: 2100, pageviews: 4600 },
  { name: 'Fri', visits: 2400, pageviews: 5200 },
  { name: 'Sat', visits: 1800, pageviews: 3900 },
  { name: 'Sun', visits: 1500, pageviews: 3200 },
];

const Analytics = () => {
  const [widgets, setWidgets] = useState([
    { id: 1, title: 'Revenue Trends', type: 'line', span: 2 },
    { id: 2, title: 'Customer Growth', type: 'bar', span: 1 },
    { id: 3, title: 'Website Traffic', type: 'area', span: 2 },
    { id: 4, title: 'Order Volume', type: 'bar', span: 1 },
  ]);

  const renderChart = (type: string, data: any[]) => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="visits" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="pageviews" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="h-64 flex items-center justify-center text-gray-500">No chart available</div>;
    }
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
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <Card key={widget.id} className={`${widget.span === 2 ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{widget.title}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderChart(widget.type, analyticsData)}
              </CardContent>
            </Card>
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
