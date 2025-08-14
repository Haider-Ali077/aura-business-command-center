import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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

interface ChartData {
  [key: string]: any;
}

const PurchaseDashboard = () => {
  const [metrics, setMetrics] = useState<PurchaseMetric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [spendingData, setSpendingData] = useState<ChartData[]>([]);
  const [supplierData, setSupplierData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<ChartData[]>([]);
  const { session } = useAuthStore();
  const { widgets, loading, fetchWidgets, refreshData, removeWidget } = useWidgetStore();


  const defaultMetrics: PurchaseMetric[] = [
    {
      title: 'Total Spend',
      value: '$2.4M',
      change: '+12%',
      icon: getIconByName('DollarSign'),
      color: 'text-blue-600'
    },
    {
      title: 'Purchase Orders',
      value: '1,847',
      change: '+8%',
      icon: getIconByName('ShoppingCart'),
      color: 'text-green-600'
    },
    {
      title: 'Active Suppliers',
      value: '342',
      change: '+5%',
      icon: getIconByName('Users'),
      color: 'text-purple-600'
    },
    {
      title: 'Avg. Order Time',
      value: '3.2 days',
      change: '-15%',
      icon: getIconByName('Clock'),
      color: 'text-orange-600'
    }
  ];

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
        } else {
          setMetrics(defaultMetrics);
        }
      } else {
        setMetrics(defaultMetrics);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setMetrics(defaultMetrics);
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


  useEffect(() => {
    // Simulate loading and set chart data
    const timer = setTimeout(() => {
      setSpendingData([
        { month: 'Jan', amount: 180000 },
        { month: 'Feb', amount: 220000 },
        { month: 'Mar', amount: 195000 },
        { month: 'Apr', amount: 240000 },
        { month: 'May', amount: 210000 },
        { month: 'Jun', amount: 260000 }
      ]);

      setSupplierData([
        { name: 'Office Supplies', value: 35, amount: 840000 },
        { name: 'Technology', value: 28, amount: 672000 },
        { name: 'Manufacturing', value: 22, amount: 528000 },
        { name: 'Services', value: 15, amount: 360000 }
      ]);

      setCategoryData([
        { category: 'IT Equipment', budget: 500000, actual: 420000 },
        { category: 'Office Supplies', budget: 200000, actual: 180000 },
        { category: 'Marketing', budget: 150000, actual: 165000 },
        { category: 'Travel', budget: 100000, actual: 85000 },
        { category: 'Facilities', budget: 300000, actual: 280000 }
      ]);

      setPerformanceData([
        { month: 'Jan', onTime: 85, delayed: 15 },
        { month: 'Feb', onTime: 88, delayed: 12 },
        { month: 'Mar', onTime: 82, delayed: 18 },
        { month: 'Apr', onTime: 90, delayed: 10 },
        { month: 'May', onTime: 87, delayed: 13 },
        { month: 'Jun', onTime: 92, delayed: 8 }
      ]);

      setTopSuppliers([
        { name: 'TechCorp Solutions', amount: '$450,000', orders: 145, rating: 4.8 },
        { name: 'Office Plus Inc.', amount: '$320,000', orders: 89, rating: 4.6 },
        { name: 'Global Manufacturing', amount: '$280,000', orders: 67, rating: 4.7 },
        { name: 'Service Partners LLC', amount: '$195,000', orders: 43, rating: 4.5 },
        { name: 'Supply Chain Co.', amount: '$150,000', orders: 38, rating: 4.4 }
      ]);

      setIsLoadingCharts(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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
        ) : (
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
        )}

        {/* Dynamic Widgets */}
        {widgets.length > 0 && (
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
        )}

        {/* Default Charts - only show if no dynamic widgets */}
        {widgets.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {isLoadingCharts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-80" />
              ))
            ) : (
              <>
                {/* Monthly Spending Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Spending Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={spendingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                          <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Spending by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={supplierData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {supplierData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget vs Actual */}
                <Card>
                  <CardHeader>
                    <CardTitle>Budget vs Actual Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                          <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="onTime" stackId="a" fill="#82ca9d" name="On Time %" />
                          <Bar dataKey="delayed" stackId="a" fill="#ff7300" name="Delayed %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Top Suppliers Table - only show if no dynamic widgets */}
        {widgets.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCharts ? (
                <LoadingSkeleton className="h-64" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted">
                      <tr>
                        <th className="px-6 py-3">Supplier</th>
                        <th className="px-6 py-3">Total Amount</th>
                        <th className="px-6 py-3">Orders</th>
                        <th className="px-6 py-3">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSuppliers.map((supplier, index) => (
                        <tr key={index} className="bg-background border-b border-border">
                          <td className="px-6 py-4 font-medium text-foreground">
                            {supplier.name}
                          </td>
                          <td className="px-6 py-4">{supplier.amount}</td>
                          <td className="px-6 py-4">{supplier.orders}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              {supplier.rating}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PurchaseDashboard;