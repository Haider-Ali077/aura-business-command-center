import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, FunnelChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Users, Award, MapPin, Calendar } from "lucide-react";

interface SalesMetric {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

interface ChartData {
  name?: string;
  [key: string]: any;
}

export function SalesDashboard() {
  const [metrics, setMetrics] = useState<SalesMetric[]>([]);
  const [funnelData, setFunnelData] = useState<ChartData[]>([]);
  const [regionData, setRegionData] = useState<ChartData[]>([]);
  const [productData, setProductData] = useState<ChartData[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [topCustomers, setTopCustomers] = useState<ChartData[]>([]);

  useEffect(() => {
    setMetrics([
      { title: 'Total Sales', value: '$1,847,250', change: 18.2, icon: TrendingUp, color: 'text-green-600' },
      { title: 'Conversion Rate', value: '24.8%', change: 5.3, icon: Target, color: 'text-blue-600' },
      { title: 'Active Leads', value: '2,847', change: 12.7, icon: Users, color: 'text-purple-600' },
      { title: 'Deals Closed', value: '156', change: 8.9, icon: Award, color: 'text-orange-600' },
      { title: 'Avg Deal Size', value: '$11,842', change: 6.4, icon: TrendingUp, color: 'text-cyan-600' },
      { title: 'Sales Cycle', value: '32 days', change: -12.1, icon: Calendar, color: 'text-red-600' }
    ]);

    setFunnelData([
      { stage: 'Leads', count: 2847, value: 2847, color: '#3B82F6' },
      { stage: 'Qualified', count: 1423, value: 1423, color: '#10B981' },
      { stage: 'Proposal', count: 712, value: 712, color: '#F59E0B' },
      { stage: 'Negotiation', count: 284, value: 284, color: '#EF4444' },
      { stage: 'Closed Won', count: 156, value: 156, color: '#8B5CF6' }
    ]);

    setRegionData([
      { region: 'North America', sales: 645000, deals: 89, percentage: 34.9 },
      { region: 'Europe', sales: 523000, deals: 72, percentage: 28.3 },
      { region: 'Asia Pacific', sales: 398000, deals: 56, percentage: 21.5 },
      { region: 'Latin America', sales: 281000, deals: 43, percentage: 15.3 }
    ]);

    setProductData([
      { product: 'Enterprise Software', revenue: 850000, units: 45, margin: 68 },
      { product: 'Professional Services', revenue: 520000, units: 128, margin: 42 },
      { product: 'Cloud Platform', revenue: 380000, units: 234, margin: 55 },
      { product: 'Mobile Apps', revenue: 290000, units: 189, margin: 38 },
      { product: 'Consulting', revenue: 185000, units: 67, margin: 62 }
    ]);

    setPerformanceData([
      { month: 'Jan', target: 450000, actual: 420000, leads: 2100 },
      { month: 'Feb', target: 480000, actual: 465000, leads: 2280 },
      { month: 'Mar', target: 520000, actual: 535000, leads: 2450 },
      { month: 'Apr', target: 550000, actual: 578000, leads: 2650 },
      { month: 'May', target: 580000, actual: 612000, leads: 2890 },
      { month: 'Jun', target: 620000, actual: 665000, leads: 3120 }
    ]);

    setTopCustomers([
      { customer: 'TechCorp Inc.', revenue: 125000, deals: 8, status: 'Active' },
      { customer: 'Global Dynamics', revenue: 98000, deals: 5, status: 'Active' },
      { customer: 'Innovation Labs', revenue: 87000, deals: 12, status: 'Active' },
      { customer: 'DataFlow Systems', revenue: 76000, deals: 6, status: 'Negotiating' },
      { customer: 'CloudFirst Ltd.', revenue: 65000, deals: 9, status: 'Active' }
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales & CRM Analytics</h1>
          <p className="text-gray-600 mt-2">Sales performance, pipeline, and customer insights</p>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <p className={`text-xs mt-1 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Funnel Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="percentage"
                  label={({ region, percentage }) => `${region}: ${percentage}%`}
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance vs Target */}
        <Card>
          <CardHeader>
            <CardTitle>Performance vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="target" fill="#94A3B8" name="Target" />
                <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Product Line</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `$${value.toLocaleString()}` : `${value}%`,
                  name === 'revenue' ? 'Revenue' : 'Margin'
                ]} />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Customer</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Deals</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{customer.customer}</td>
                    <td className="p-2 text-right">${customer.revenue.toLocaleString()}</td>
                    <td className="p-2 text-right">{customer.deals}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        customer.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}