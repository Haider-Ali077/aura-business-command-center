import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingDown, AlertTriangle, Clock, Truck, BarChart3, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useWidgetStore } from "@/store/widgetStore";
import { useTenantStore } from "@/store/tenantStore";

interface InventoryMetric {
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

export function InventoryDashboard() {
  const [metrics, setMetrics] = useState<InventoryMetric[]>([]);
  const [stockLevels, setStockLevels] = useState<ChartData[]>([]);
  const [turnoverData, setTurnoverData] = useState<ChartData[]>([]);
  const [agingData, setAgingData] = useState<ChartData[]>([]);
  const [supplierData, setSupplierData] = useState<ChartData[]>([]);
  const [demandForecast, setDemandForecast] = useState<ChartData[]>([]);
  
  const { widgets, fetchWidgets, loading, refreshData } = useWidgetStore();
  const { currentSession } = useTenantStore();

  useEffect(() => {
    if (currentSession?.tenantId) {
      fetchWidgets(currentSession.tenantId, 'inventory');
    }
  }, [currentSession]);

  useEffect(() => {
    setMetrics([
      { title: 'Total Inventory Value', value: '$2,847,392', change: 5.2, icon: Package, color: 'text-blue-600' },
      { title: 'Low Stock Items', value: '47', change: -12.8, icon: AlertTriangle, color: 'text-red-600' },
      { title: 'Inventory Turnover', value: '6.2x', change: 8.7, icon: BarChart3, color: 'text-green-600' },
      { title: 'Avg Delivery Time', value: '4.2 days', change: -15.3, icon: Truck, color: 'text-purple-600' },
      { title: 'Stock Accuracy', value: '97.8%', change: 2.1, icon: TrendingDown, color: 'text-cyan-600' },
      { title: 'Aging Inventory', value: '$184,250', change: -8.9, icon: Clock, color: 'text-orange-600' }
    ]);

    setStockLevels([
      { category: 'Electronics', current: 2450, minimum: 500, maximum: 3000, status: 'Normal' },
      { category: 'Clothing', current: 890, minimum: 200, maximum: 1500, status: 'Normal' },
      { category: 'Home & Garden', current: 156, minimum: 300, maximum: 800, status: 'Low' },
      { category: 'Sports', current: 1240, minimum: 400, maximum: 1200, status: 'High' },
      { category: 'Books', current: 320, minimum: 100, maximum: 600, status: 'Normal' },
      { category: 'Automotive', current: 89, minimum: 150, maximum: 400, status: 'Critical' }
    ]);

    setTurnoverData([
      { month: 'Jan', turnover: 5.2, cogs: 180000, avgInventory: 34615 },
      { month: 'Feb', turnover: 5.8, cogs: 195000, avgInventory: 33621 },
      { month: 'Mar', turnover: 6.1, cogs: 210000, avgInventory: 34426 },
      { month: 'Apr', turnover: 6.4, cogs: 225000, avgInventory: 35156 },
      { month: 'May', turnover: 6.8, cogs: 238000, avgInventory: 35000 },
      { month: 'Jun', turnover: 7.2, cogs: 252000, avgInventory: 35000 }
    ]);

    setAgingData([
      { range: '0-30 days', value: 1450000, percentage: 61.2 },
      { range: '31-60 days', value: 580000, percentage: 24.5 },
      { range: '61-90 days', value: 245000, percentage: 10.3 },
      { range: '90+ days', value: 95000, percentage: 4.0 }
    ]);

    setSupplierData([
      { supplier: 'TechSupply Co.', deliveryTime: 3.2, onTime: 95.8, quality: 98.5 },
      { supplier: 'Global Parts Ltd.', deliveryTime: 4.1, onTime: 89.2, quality: 96.8 },
      { supplier: 'Rapid Logistics', deliveryTime: 2.8, onTime: 97.3, quality: 94.2 },
      { supplier: 'Premium Materials', deliveryTime: 5.2, onTime: 85.6, quality: 99.1 },
      { supplier: 'Quick Ship Inc.', deliveryTime: 3.8, onTime: 92.4, quality: 95.7 }
    ]);

    setDemandForecast([
      { week: 'Week 1', historical: 2400, forecast: 2520, actual: 2485 },
      { week: 'Week 2', historical: 2650, forecast: 2780, actual: 2745 },
      { week: 'Week 3', historical: 2200, forecast: 2310, actual: 2298 },
      { week: 'Week 4', historical: 2850, forecast: 2995, actual: null },
      { week: 'Week 5', historical: 2450, forecast: 2570, actual: null },
      { week: 'Week 6', historical: 2680, forecast: 2815, actual: null }
    ]);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory & Supply Chain Analytics</h1>
            <p className="text-gray-600 mt-2">Stock levels, turnover, and supply chain performance</p>
          </div>
          <Button 
            onClick={refreshData} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

      {/* Inventory Metrics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"> */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
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
        {/* Stock Levels by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Levels by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minimum" fill="#EF4444" name="Minimum Level" />
                <Bar dataKey="current" fill="#3B82F6" name="Current Stock" />
                <Bar dataKey="maximum" fill="#10B981" name="Maximum Level" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Turnover Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Turnover Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'turnover' ? `${value}x` : `$${value.toLocaleString()}`,
                  name === 'turnover' ? 'Turnover Ratio' : 'Value'
                ]} />
                <Line type="monotone" dataKey="turnover" stroke="#3B82F6" strokeWidth={3} name="Turnover Ratio" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Aging Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'value' ? `$${value.toLocaleString()}` : `${value}%`,
                  name === 'value' ? 'Value' : 'Percentage'
                ]} />
                <Bar dataKey="value" fill="#3B82F6" name="Inventory Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demand Forecasting */}
        <Card>
          <CardHeader>
            <CardTitle>Demand Forecasting vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="historical" stroke="#94A3B8" strokeWidth={2} name="Historical" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} name="Forecast" />
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Supplier</th>
                  <th className="text-right p-2">Avg Delivery (days)</th>
                  <th className="text-right p-2">On-Time %</th>
                  <th className="text-right p-2">Quality %</th>
                  <th className="text-center p-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {supplierData.map((supplier, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{supplier.supplier}</td>
                    <td className="p-2 text-right">{supplier.deliveryTime}</td>
                    <td className="p-2 text-right">{supplier.onTime}%</td>
                    <td className="p-2 text-right">{supplier.quality}%</td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < Math.round((supplier.onTime + supplier.quality) / 40)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}